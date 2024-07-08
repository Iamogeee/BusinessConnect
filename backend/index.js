require("dotenv").config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const axios = require("axios");

const prisma = new PrismaClient();
const saltRounds = 14;
const secretKey = process.env.JWT_SECRET;
const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

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
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
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
    const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 604800000, // 7 days
    });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

//Endpoint for fethcing businesses
app.get("/api/businesses", async (req, res) => {
  try {
    const businesses = await prisma.business.findMany();
    res.json(businesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({ error: "Failed to fetch businesses" });
  } finally {
    await prisma.$disconnect();
  }
});

app.get("/api/businesses/search", async (req, res) => {
  const { query } = req.query;

  try {
    const businesses = await prisma.business.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { location: { contains: query, mode: "insensitive" } },
          { businessType: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    res.json(businesses);
  } catch (error) {
    console.error("Error searching businesses:", error);
    res.status(500).json({ error: "Failed to search businesses" });
  } finally {
    await prisma.$disconnect();
  }
});

app.get("/api/businesses/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const business = await prisma.business.findUnique({
      where: { id: parseInt(id) },
      include: {
        recommendations: true,
      },
    });
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    res.json(business);
  } catch (error) {
    console.error("Error fetching business:", error);
    res.status(500).json({ error: "Failed to fetch business" });
  } finally {
    await prisma.$disconnect();
  }
});

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
  } finally {
    await prisma.$disconnect();
  }
});

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
  } finally {
    await prisma.$disconnect();
  }
});

const jsonFilePath = path.join(__dirname, "public", "businessApiResponse.json");

fs.readFile(jsonFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading JSON file:", err);
    return;
  }
  try {
    const jsonData = JSON.parse(data);

    async function fetchPlaceDetails(placeId) {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?fields=name,rating,formatted_phone_number,photos,reviews,current_opening_hours,editorial_summary&place_id=${placeId}&key=${API_KEY}`;
      const response = await axios.get(url);
      return response.data.result;
    }

    async function main() {
      for (const business of jsonData.results) {
        const location = `${business.geometry.location.lat}, ${business.geometry.location.lng}`;
        const businessType = business.types.join(", ");
        const firstType = business.types[0]
          ? business.types[0].trim()
          : "Uncategorized";
        const businessHours = business.opening_hours
          ? business.opening_hours.weekday_text || ["Unknown"]
          : ["Unknown"];

        // Fetch additional details from Google Places API
        const placeDetails = await fetchPlaceDetails(business.place_id);

        const upsertedBusiness = await prisma.business.upsert({
          where: { placeId: business.place_id },
          update: {
            name: placeDetails.name || business.name,
            location,
            contactInformation:
              placeDetails.formatted_phone_number || "Unknown",
            overview: placeDetails.editorial_summary
              ? placeDetails.editorial_summary.overview
              : "Overview not provided",
            businessHours: placeDetails.current_opening_hours
              ? placeDetails.current_opening_hours.weekday_text
              : [],
            averageRating: placeDetails.rating || business.rating,
            businessType,
            photoReference: placeDetails.photos
              ? placeDetails.photos[0].photo_reference
              : null,
            photos: placeDetails.photos
              ? placeDetails.photos.map((photo) => photo.photo_reference)
              : [],
            category: firstType, // Set the category field
          },
          create: {
            placeId: business.place_id,
            name: placeDetails.name || business.name,
            location,
            contactInformation:
              placeDetails.formatted_phone_number || "Unknown",
            overview: placeDetails.editorial_summary
              ? placeDetails.editorial_summary.overview
              : "Overview not provided",
            businessHours: placeDetails.current_opening_hours
              ? placeDetails.current_opening_hours.weekday_text
              : [],
            averageRating: placeDetails.rating || business.rating,
            businessType,
            photoReference: placeDetails.photos
              ? placeDetails.photos[0].photo_reference
              : null,
            photos: placeDetails.photos
              ? placeDetails.photos.map((photo) => photo.photo_reference)
              : [],
            category: firstType, // Set the category field
            recommendations: { create: [] },
          },
        });

        if (placeDetails.reviews) {
          for (const review of placeDetails.reviews) {
            const existingReview = await prisma.review.findFirst({
              where: {
                name: review.author_name,
              },
            });

            if (!existingReview) {
              await prisma.review.create({
                data: {
                  rating: review.rating,
                  reviewText: review.text,
                  name: review.author_name,
                  businessId: upsertedBusiness.id,
                },
              });
            }
          }
        }
      }
    }

    main()
      .catch((e) => {
        console.error(e);
        process.exit(1);
      })
      .finally(async () => {
        await prisma.$disconnect();
      });
  } catch (parseErr) {
    console.error("Error parsing JSON data:", parseErr);
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.get("/api/businesses/search", async (req, res) => {
  const { query } = req.query;

  try {
    const businesses = await prisma.business.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { location: { contains: query, mode: "insensitive" } },
          { businessType: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    res.json(businesses);
  } catch (error) {
    console.error("Error searching businesses:", error);
    res.status(500).json({ error: "Failed to search businesses" });
  } finally {
    await prisma.$disconnect();
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
