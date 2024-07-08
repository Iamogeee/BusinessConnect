require("dotenv").config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const prisma = new PrismaClient();
const saltRounds = 14;
const secretKey = process.env.JWT_SECRET;
const app = express();
const PORT = process.env.PORT || 3000;

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

// Load and process business data from JSON file
const jsonFilePath = path.join(__dirname, "public", "businessApiResponse.json");

fs.readFile(jsonFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading JSON file:", err);
    return;
  }
  try {
    const jsonData = JSON.parse(data);
    async function main() {
      for (const business of jsonData.results) {
        const location = `${business.geometry.location.lat}, ${business.geometry.location.lng}`;
        const businessType = business.types.join(", ");
        const businessHours =
          business.opening_hours &&
          business.opening_hours.open_now !== undefined
            ? business.opening_hours.open_now
              ? "Open"
              : "Closed"
            : "Unknown";

        await prisma.business.upsert({
          where: { placeId: business.place_id },
          update: {
            name: business.name,
            location,
            contactInformation: "Unknown",
            businessHours,
            averageRating: business.rating,
            businessType,
            photoReference: business.photos[0].photo_reference,
          },
          create: {
            placeId: business.place_id,
            name: business.name,
            location,
            contactInformation: "Unknown",
            businessHours,
            averageRating: business.rating,
            businessType,
            photoReference: business.photos[0].photo_reference,
            reviews: { create: [] },
            recommendations: { create: [] },
            services: { create: [] },
          },
        });
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
    res.status(500).json({ error: "Failed to parse JSON data" });
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
