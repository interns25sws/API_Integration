import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import shopifyRoutes from "./routes/shopifyRoutes.js"; // Shopify Routes
import analyticsRoutes from "./routes/analyticsRoutes.js";
import customerRoutes from "./routes/customerRoutes.js"; // Customer Routes
import discountRoutes from "./routes/discountRoutes.js"; // Discount Routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// const allowedOrigins = [
//   "http://localhost:5173",  // ✅ Allow local development
//   "https://bullvark.com",   // ✅ Allow production
// ];

app.use(cors({
  // origin: ["http://localhost:5173", "https://bullvark.com"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization", "X-Shopify-Access-Token"],
  credentials: true,
}));
app.use(cookieParser());

// Middleware
app.use(express.json());
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    console.log("🔗 Connected to:", process.env.MONGO_URI); // Check if MONGO_URI is correct
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

  app.get("/api/config", (req, res) => {
    res.json({ backendUrl: process.env.CLIENT_URL || "http://localhost:5000" });
  });
  
// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shopify", shopifyRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/customers", customerRoutes);
console.log("📌 Customer routes loaded!"); // Debugging line
app.use("/api/discounts", discountRoutes);

// Log all routes
console.log("📌 Registered Routes:");
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${r.route.stack[0].method.toUpperCase()} ${r.route.path}`);
  }
});
// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
