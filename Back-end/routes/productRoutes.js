// filepath: /c:/Users/jishan/Documents/GitHub/API_Integration/Back-end/routes/productRoutes.js
import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Add a new product
router.post("/", async (req, res) => {
  const { name, price, stock, category, rating, reviews, image } = req.body;

  // Validate required fields
  if (!name || !price || !stock || !category || !rating || !reviews || !image) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const product = new Product({
    name,
    price,
    stock,
    category,
    rating,
    reviews,
    image,
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;