import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Middleware to authenticate the user based on the token
export const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  console.log("🛠️ Auth Middleware Triggered");

  if (!token) {
    console.error("❌ No Token Provided");
    return res.status(401).json({ message: "Access Denied!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token Decoded:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Invalid Token:", error.message);
    res.status(400).json({ message: "Invalid Token!" });
  }
};
// Role-Based Access Control Middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied!" });
    }
    next();
  };
};
