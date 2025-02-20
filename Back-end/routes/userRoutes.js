import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";  // Import the middleware
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";  // Assuming you have a User model for user data

const router = express.Router();

// 🔹 Registration Route
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;
    console.log("📥 Incoming Data:", req.body);

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("❌ Error in registration:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// 🔹 Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔍 Checking login for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(200).json({ message: "Login successful", token, user });

  } catch (error) {
    console.error("❌ Error in login:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// ✅ Protected route example (Profile route)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // The user is already validated by the middleware (authMiddleware)
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile data", user });

  } catch (error) {
    console.error("❌ Error fetching profile:", error.message);
    res.status(500).json({ message: "Server error fetching profile data" });
  }
});

export default router;
