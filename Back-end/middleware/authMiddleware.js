import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();  // Ensure dotenv is configured

// Authentication Middleware
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("🛠️ Auth Middleware Triggered, Received Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("❌ No Token Provided or Incorrect Format");
    return res.status(401).json({ message: "Access Denied! Missing Bearer token." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token Successfully Decoded:", decoded);

    // Fetch user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      console.error("❌ User not found in database");
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user data to request object
    req.user = user;
    req.userTags = user.tags || []; 

    console.log("🛠️ User Tags in Middleware:", req.userTags);
    next();
  } catch (error) {
    console.error("❌ Invalid Token:", error.message);
    res.status(401).json({ message: "Invalid Token!" });
  }
};

// Role-Based Access Control Middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is included in the allowed roles
    if (!req.user || !roles.includes(req.user.role)) {
      console.error("❌ Access Denied! User role:", req.user ? req.user.role : "undefined");
      return res.status(403).json({ message: "Access Denied! You do not have permission to perform this action." });
    }
    next();
  };
};