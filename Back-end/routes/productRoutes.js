import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Save products to the database
router.post("/save", async (req, res) => {
  try {
    const { products } = req.body;

    for (const product of products) {
      await Product.findOneAndUpdate({ id: product.id }, product, { upsert: true });
    }

    res.status(200).json({ message: "Products saved successfully!" });
  } catch (error) {
    console.error("Error saving products:", error);
    res.status(500).json({ message: "Server error while saving products" });
  }
});

// Fetch products from the database
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error while fetching products" });
  }
});

export default router;
