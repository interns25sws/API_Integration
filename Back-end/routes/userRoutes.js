import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";  // Import the middleware
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";  // Assuming you have a User model for user data
import { forgotPassword, resetPassword } from "../controllers/authController.js";
import dotenv from "dotenv";
import generateToken from "../utils/generateToken.js";


dotenv.config();
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

    // Fetch user from DB with role, tags, and password
    const user = await User.findOne({ email }).select("name email role tags password");
    console.log("📌 Retrieved User from DB:", user);

    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(404).json({ message: "User does not exist" });
    }

    console.log("🔍 Verifying password for:", email);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("❌ Incorrect password for:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Ensure `tags` is defined before using it
    const userTags = user.tags ?? [];
    console.log("✅ User Tags Before Token Generation:", userTags);

    // Generate JWT Token
    const token = generateToken(user);
    console.log("🛠️ JWT Token Generated:", token);

    // Decode token to verify payload
    const decodedToken = jwt.decode(token);
    console.log("🔍 Decoded JWT Payload:", decodedToken);

    // Respond with the token and user data
    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        tags: userTags,  // Check if this is still undefined
      },
    });
  } catch (error) {
    console.error("❌ Error in login:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});



// ✅ Protected route example (Profile route)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Use req.user.id instead of req.user.userId
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile data", user });

  } catch (error) {
    console.error("❌ Error fetching profile:", error.message);
    res.status(500).json({ message: "Server error fetching profile data" });
  }
});


router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["admin", "sales-rep"] } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});



// 🔹 DELETE user by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { name, email, role, tags } = req.body;
    const userId = req.params.id;

    console.log("🔍 Update Request Received for User ID:", userId);
    console.log("🛠️ Update Data:", { name, email, role, tags });

    // 🔹 Fetch current user data
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 Check if the email is being changed
    if (email !== currentUser.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // ✅ Update user data
    currentUser.name = name;
    currentUser.email = email;
    currentUser.role = role;
    currentUser.tags = tags;

    await currentUser.save();

    console.log("✅ Updated User:", JSON.stringify(currentUser, null, 2));

    res.json({ message: "User updated successfully", user: currentUser });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { name, email, password, role, tags } = req.body;

    console.log("🔍 Add User Request Received");
    console.log("🛠️ Data to be Inserted:", { name, email, password, role, tags });

    if (role === "super-admin") {
      return res.status(403).json({ message: "Cannot create a Super Admin" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if any of the provided tags already exist in another user
    const existingTag = await User.findOne({ tags: { $in: tags } });
    if (existingTag) {
      return res.status(400).json({ message: `Tag(s) already exist: ${existingTag.tags}` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role, tags });
    await newUser.save();

    console.log("✅ New User Created:", JSON.stringify(newUser, null, 2));

    res.status(201).json({ message: "User created", user: newUser });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// Forgot Password Route
router.post("/forgot-password", forgotPassword);

// Reset Password Route
router.post("/reset-password", resetPassword);

export default router;
