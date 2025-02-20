import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config(); // Load environment variables

const router = express.Router();

/**
 * 📝 User Registration
 */
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;
    console.log("📥 Incoming Registration Data:", req.body);

    // ✅ Check if all fields are provided
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // ✅ Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ✅ Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Create new user
    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("❌ Error in registration:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 * 🔐 User Login with JWT
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔍 Checking login for:", email);

    // ✅ Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("❌ Error in login:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 * 🛡️ Get Logged-in User Data (Protected Route)
 */
router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // ✅ Verify JWT token
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error.message);
    res.status(401).json({ message: "Invalid token", error: error.message });
  }
});

export default router;
