import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const router = express.Router();

/**
 * 📝 User Registration
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // ✅ Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered!" });
    }

    // ✅ Ensure only one Super Admin exists
    if (role === "super-admin") {
      const existingSuperAdmin = await User.findOne({ role: "super-admin" });
      if (existingSuperAdmin) {
        return res.status(400).json({ message: "Super Admin already exists!" });
      }
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });

    // ✅ Save user to database
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("❌ Error Registering User:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 * 🔐 User Login with JWT
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    // ✅ Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Send structured response
    res.status(200).json({
      message: "Login successful!",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    console.error("❌ Error Logging In:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 * 🛡️ Get Logged-in User Data (Protected Route)
 */
router.get("/me", async (req, res) => {
  try {
    // ✅ Extract token properly
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access Denied! No token provided." });
    }

    // ✅ Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

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
