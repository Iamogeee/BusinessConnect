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
const { provideRecommendations } = require("./recommendationSystem");
const { searchBusinesses } = require("./search");
const { personalizeResults } = require("./personalizeResults");
const redisCache = require("./redisCache");

const prisma = new PrismaClient();
const saltRounds = 14;
const secretKey = process.env.JWT_SECRET;
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
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
}

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
  const { name, email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
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

// Endpoint for fetching businesses
app.get("/api/businesses", async (req, res) => {
  try {
    const businesses = await prisma.business.findMany();
    res.json(businesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
});

// Search businesses
app.get("/api/search", async (req, res) => {
  const { query, userId } = req.query;

  const cacheKey = `search:${userId}:${query}`;
  const cachedResults = await redisCache.get(cacheKey);

  if (cachedResults) {
    return res.json(cachedResults);
  }

  try {
    const results = await searchBusinesses(query);

    for (const result of results) {
      result.interactions = await prisma.interaction.findMany({
        where: {
          businessId: result.id,
          userId: parseInt(userId),
        },
      });
    }

    const personalizedResults = personalizeResults(results);

    await redisCache.set(cacheKey, personalizedResults);

    res.json(personalizedResults);
  } catch (error) {
    console.error("Error in search endpoint:", error);
    res.status(500).json({ error: "An error occurred while searching" });
  }
});

// Fetch currently logged-in user's information
app.get("/api/user", authenticateToken, async (req, res) => {
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

// Fetch single business
app.get("/api/businesses/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const business = await prisma.business.findUnique({
      where: { id: parseInt(id) },
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
  const { businessId, rating, reviewText, name, profilePhoto } = req.body;
  try {
    const review = await prisma.review.create({
      data: {
        businessId,
        rating,
        reviewText,
        name,
        profilePhoto,
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

    const uniqueBusinesses = Array.from(
      new Set(favorites.map((interaction) => interaction.businessId))
    ).map((businessId) => {
      return favorites.find(
        (interaction) => interaction.businessId === businessId
      ).Business;
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
      return saved.find((interaction) => interaction.businessId === businessId)
        .Business;
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
app.get("/recommendations/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send("User ID is required");
  }

  try {
    const recommendations = await provideRecommendations(parseInt(id));

    // Fetch the full business data for each recommended business
    const businessPromises = recommendations.map((rec) => {
      return prisma.business.findUnique({
        where: { id: parseInt(rec.businessId) },
      });
    });

    // Wait for all business data fetch promises to resolve
    const businesses = await Promise.all(businessPromises);
    res.json(businesses);
  } catch (error) {
    console.error("Error providing recommendations:", error);
    res.status(500).send("An error occurred while providing recommendations");
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
