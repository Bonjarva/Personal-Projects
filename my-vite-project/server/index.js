const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Load environment variables from .env file if it exists
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple route for testing
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

// GET /users - fetch all users from the database
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Unable to fetch users" });
  }
});

// POST /users - create a new user
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: { name, email },
    });
    res.json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Unable to create user" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
