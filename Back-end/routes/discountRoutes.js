import express from "express";
import Discount from "../models/Discount.js"; // Ensure correct path
import axios from "axios";
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Fetch all discounts
router.get("/get-all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id; // `req.user` is available from your authMiddleware

    const discounts = await Discount.find({ userId }); // only fetch for logged-in user

    res.status(200).json(discounts);
  } catch (error) {
    console.error("❌ Error fetching discounts:", error.message);
    res.status(500).json({ message: "Server error while fetching discounts" });
  }
});

router.post("/save-discount", authMiddleware, async (req, res) => {
  try {
    console.log("📌 Received Data:", req.body);

    let { type, discountType, discountValue, selectedTags = [], minQuantity, applyTo } = req.body;

    // Check for required fields
    if (!type || !discountType || discountValue === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert values to the correct type explicitly
    discountValue = Number(discountValue);
    if (isNaN(discountValue)) {
      return res.status(400).json({ error: "Invalid discount value" });
    }

    minQuantity = Number(minQuantity);

    if (type === "Bulk Discount") {
      applyTo = "bulk";
      if (!minQuantity || minQuantity < 2) {
        return res.status(400).json({ error: "Bulk discount requires a minimum quantity of at least 2." });
      }
    } else {
      minQuantity = undefined;
    }

    console.log("🔥 Processed Discount Data:", { type, discountType, discountValue, selectedTags, applyTo, minQuantity });

    // Save the discount in MongoDB
    const newDiscount = new Discount({ type, discountType, discountValue, selectedTags, applyTo, minQuantity,  userId: req.user._id, });
    await newDiscount.save();

    res.json({ message: "Discount saved successfully!", discount: newDiscount });

  } catch (error) {
    console.error("❌ Error saving discount:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch discount by tag (Only for Tag-Based Discounts)
router.get("/discounts-by-tag", async (req, res) => {
  try {
    const { tag } = req.query;
    if (!tag) return res.status(400).json({ message: "Tag is required" });

    console.log("🔎 Searching discount for tag:", tag);
    const discount = await Discount.findOne({ selectedTags: { $in: [tag] } });

    if (!discount) {
      console.log("❌ No discount found for tag:", tag);
      return res.json({ discountPercent: 0 });
    }

    console.log("✅ Discount Found:", discount);
    res.json({ discountPercent: discount.discountValue });
  } catch (error) {
    console.error("❌ Error fetching discount:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Fetch discount for bulk purchase
router.get("/discounts-by-quantity", async (req, res) => {
  try {
    let { quantity } = req.query;
    
    // Validate and parse quantity
    quantity = parseInt(quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be a valid positive number" });
    }

    console.log("🔎 Searching for bulk discount. Quantity:", quantity);

    // Find the highest applicable discount (closest to quantity but <= quantity)
    const discount = await Discount.findOne({
      type: "Bulk Discount",
      minQuantity: { $lte: quantity } // Find the best discount for this quantity
    }).sort({ minQuantity: -1 }); // Get the highest possible discount

    if (!discount) {
      console.log("❌ No bulk discount found for quantity:", quantity);
      return res.json({ discountPercent: 0 });
    }

    console.log("✅ Bulk Discount Found:", {
      minQuantity: discount.minQuantity,
      discountValue: discount.discountValue
    });

    res.json({ discountPercent: discount.discountValue });
  } catch (error) {
    console.error("❌ Error fetching bulk discount:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
