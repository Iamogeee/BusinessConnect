const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cors = require("cors");
const express = require("express");
const app = express();
app.use(express.json());
app.use(cors());
require("dotenv").config();
const bcrypt = require("bcrypt");
const saltRounds = 14;

// app.get("/", async);

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  //
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
