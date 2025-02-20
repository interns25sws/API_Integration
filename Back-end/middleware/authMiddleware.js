import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Middleware to authenticate the user based on the token
export const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];  // Token comes as "Bearer <token>"

  if (!token) {
    return res.status(403).json({ message: "Access Denied: No token provided" });
  }

  try {
    // Verify the token with the secret key from the environment variable
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach user info to the request object
    next();  // Pass the request to the next middleware/controller
  } catch (error) {
    console.error("❌ Token verification error:", error.message);
    return res.status(401).json({ message: "Access Denied: Invalid token" });
  }
};
