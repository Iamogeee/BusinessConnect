require("dotenv").config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { exec } = require("child_process");
const { PORT, JWT_SECRET } = require("./config");
const { recommendBusinesses, handleUserInteraction } = require("./main");
const { searchBusinesses } = require("./search");
const cache = require("./cache");
const fs = require("fs");
const multer = require("multer");
const axios = require("axios");
const http = require("http");
const WebSocket = require("ws");
const { cos } = require("@tensorflow/tfjs");

const prisma = new PrismaClient();
const saltRounds = 14;
const secretKey = process.env.JWT_SECRET;
const app = express();
const GeoCode_API_KEY = process.env.GeoCode_API_KEY;
const server = http.createServer(app);
const wss = new WebSocket.Server({ port: 3001 });

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(401); // Send unauthorized status
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Send forbidden status
    }
    req.user = user;
    next();
  });
};

// Geocode location to get latitude and longitude
async function geocodeLocation(location) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GeoCode_API_KEY}`;
  const response = await axios.get(url);
  const result = response.data.results[0];
  return result ? result.geometry.location : null;
}
// WebSocket connection handling
wss.on("connection", (ws, req) => {
  const token = new URLSearchParams(req.url.split("?")[1]).get("token");
  if (!token) {
    ws.close();
    return;
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      ws.close();
      return;
    }

    ws.user = user;
  });
});

const notifyUser = (userId, message) => {
  wss.clients.forEach((client) => {
    if (client.user && client.user.id === userId) {
      client.send(JSON.stringify(message));
    }
  });
};

// Landing Page Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Home Page Route (protected)
app.get("/home", authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Signup route
app.post("/signup", async (req, res) => {
  const { name, email, password, bio, interests, location } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const coordinates = await geocodeLocation(location);
    const locationString = coordinates
      ? `${coordinates.lat}, ${coordinates.lng}`
      : location;
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        bio,
        interests,
        location: locationString,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ id: newUser.id }, secretKey, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 604800000, // 7 days
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ id: user.id }, secretKey, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 604800000, // 7 days
    });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Error in /login route:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

// Logout route
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// Endpoint for fetching businesses
app.get("/api/businesses", async (req, res) => {
  try {
    const businesses = await prisma.business.findMany({
      include: { interactions: true },
    });
    res.json(businesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
});

app.get("/api/myreviews/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: parseInt(id) },
    });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Search businesses
app.get("/api/search", async (req, res) => {
  const { query, userId } = req.query;
  let results = [];
  if (!query || !userId) {
    return res.status(400).json({ error: "Missing query or userId parameter" });
  }

  try {
    results = await searchBusinesses(parseInt(userId), query);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while searching" });
  }

  res.json(results);
});

app.get("/api/cache", (req, res) => {
  const cacheEntries = Array.from(cache.cache.entries()).map(
    ([key, [value, expiryTime]]) => ({
      key,
      results: value.results.map((business) => business.name), // Only show business names for brevity
      users: value.users,
      expiryTime: new Date(expiryTime).toISOString(),
    })
  );
  res.json(cacheEntries);
});

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Fetch currently logged-in user's information
app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        interactions: {
          include: {
            Business: true,
          },
          where: {
            OR: [{ saved: true }, { reviewed: { not: null } }],
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch user data", details: error.message });
  }
});

// Fetch user by ID
app.get("/api/user/:id", authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { interactions: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If coordinates are missing in the location field, geocode the location
    if (user.location && !user.location.includes(",")) {
      const coordinates = await geocodeLocation(user.location);
      if (coordinates) {
        const locationString = `${coordinates.lat}, ${coordinates.lng}`;
        user = await prisma.user.update({
          where: { id: userId },
          data: {
            location: locationString,
          },
        });
      }
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch user data", details: error.message });
  }
});

// Update user's profile
app.put(
  "/api/user/profile",
  authenticateToken,
  upload.single("profilePicture"), //handles the upload of a single file with the field name 'profilePicture'
  async (req, res) => {
    const userId = req.user.id;
    const { name, email, location, bio, interests } = req.body;

    try {
      const updatedProfile = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          location,
          bio,
          interests,
          profilePicture: req.file ? req.file.path : undefined, // Save the profile picture path
        },
      });
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

// Fetch single business
app.get("/api/businesses/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const business = await prisma.business.findUnique({
      where: { id: parseInt(id) },
      include: {
        interactions: true,
      },
    });
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    res.json(business);
  } catch (error) {
    console.error("Error fetching business:", error);
    res.status(500).json({ error: "Failed to fetch business" });
  }
});

// Fetch reviews for a business
app.get("/api/reviews/:businessId", async (req, res) => {
  const { businessId } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { businessId: parseInt(businessId) },
    });
    if (!reviews.length) {
      return res
        .status(404)
        .json({ error: "No reviews found for this business" });
    }

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Save a review
app.post("/api/reviews", async (req, res) => {
  const { businessId, rating, reviewText, name, userId, profilePhoto } =
    req.body;

  try {
    const review = await prisma.review.create({
      data: {
        businessId,
        rating,
        reviewText,
        name,
        profilePhoto,
        userId,
      },
    });
    res.status(201).json(review);
  } catch (error) {
    console.error("Error saving review:", error);
    res.status(500).json({ error: "Failed to save review" });
  }
});

// Fetch business categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await prisma.business.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    const categoryList = categories.map((c) => c.category);
    res.json(categoryList);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Interact with a business
app.post("/interact", async (req, res) => {
  const { businessId, liked, saved, viewed, reviewed, rated, userId } =
    req.body;
  try {
    const interaction = await prisma.interaction.upsert({
      where: { userId_businessId: { userId, businessId } },
      update: { liked, saved, viewed, reviewed, rated },
      create: { userId, businessId, liked, saved, viewed, reviewed, rated },
    });
    res.status(200).json(interaction);
  } catch (error) {
    console.error("Error creating/updating interaction:", error);
    res.status(500).json({ error: "Failed to create/update interaction" });
  }
});

// Fetch user's favorite businesses
app.get("/api/favorites/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const favorites = await prisma.interaction.findMany({
      where: { userId: parseInt(id), liked: true },
      include: { Business: true },
    });

    // Remove duplicates by businessId and include interactions
    const uniqueBusinesses = Array.from(
      new Set(favorites.map((interaction) => interaction.businessId))
    ).map((businessId) => {
      const interaction = favorites.find(
        (interaction) => interaction.businessId === businessId
      );
      return {
        ...interaction.Business,
        interaction: {
          liked: interaction.liked,
          saved: interaction.saved,
        },
      };
    });

    res.json(uniqueBusinesses);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// Fetch user's saved businesses
app.get("/api/saved/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const saved = await prisma.interaction.findMany({
      where: { userId: parseInt(id), saved: true },
      include: { Business: true },
    });

    const uniqueBusinesses = Array.from(
      new Set(saved.map((interaction) => interaction.businessId))
    ).map((businessId) => {
      const interaction = saved.find(
        (interaction) => interaction.businessId === businessId
      );
      return {
        ...interaction.Business,
        interaction: {
          liked: interaction.liked,
          saved: interaction.saved,
        },
      };
    });

    res.json(uniqueBusinesses);
  } catch (error) {
    console.error("Error fetching saved businesses:", error);
    res.status(500).json({ error: "Failed to fetch saved businesses" });
  }
});

// Save categories and preferred rating
app.post("/save-categories", async (req, res) => {
  const { userId, categories, preferredRating } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        favoriteCategories: categories,
        preferredRating: preferredRating,
        hasSelectedCategories: true,
      },
    });

    res.status(200).json({
      message: "Categories and preferred rating saved successfully",
      user,
    });
  } catch (error) {
    console.error("Error saving categories and preferred rating:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint to receive user ID and provide recommendations
app.get("/recommendations/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    const recommendations = await recommendBusinesses(userId);
    // Fetch the full business data for each recommended business
    const businessPromises = recommendations.map((rec) => {
      return prisma.business.findUnique({
        where: { id: parseInt(rec.id) },
        include: { interactions: true },
      });
    });

    // Wait for all business data fetch promises to resolve
    const businesses = await Promise.all(businessPromises);
    res.json(businesses);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Send a message
app.post("/api/messages", authenticateToken, async (req, res) => {
  const { text, receiverId, businessId, reviewId } = req.body;
  const senderId = req.user.id;

  try {
    const message = await prisma.message.create({
      data: {
        text,
        senderId,
        receiverId,
        businessId: parseInt(businessId),
        reviewId: parseInt(reviewId),
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get messages between two users
app.get(
  "/api/messages/:receiverId/:businessId/:reviewId",
  authenticateToken,
  async (req, res) => {
    const senderId = req.user.id;
    const receiverId = parseInt(req.params.receiverId);
    const businessId = parseInt(req.params.businessId);
    const reviewId = parseInt(req.params.reviewId);

    try {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { receiverId, businessId, reviewId },
            {
              receiverId: senderId,
              businessId,
              reviewId,
            },
          ],
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  }
);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
