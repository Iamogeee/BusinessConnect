const express = require("express");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();
const saltRounds = 10;

app.use(express.json());

// Landing Page Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Home Page Route
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Signup route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  bcrypt.hash(password, saltRounds, async function (err, hashedPassword) {
    try {
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
      res.json("Account created");
    } catch (error) {
      res.status(400).json({ error: "User already exists" });
    }
  });
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        res.json({ message: "Login successful" });
      } else {
        res.status(400).json({ error: "Invalid password" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
