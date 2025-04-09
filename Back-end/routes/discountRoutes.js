import express from "express";
import Discount from "../models/Discount.js"; // Ensure correct path
import axios from "axios";
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Fetch all discounts
router.get("/get-all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let discounts;

    if (userRole === "Super Admin") {
      // ✅ Super Admin sees all discounts
      discounts = await Discount.find().populate("userId", "name email");
    } else {
      // ✅ Other users see only their own
      discounts = await Discount.find({ userId });
    }

    res.status(200).json(discounts);
  } catch (error) {
    console.error("❌ Error fetching discounts:", error.message);
    res.status(500).json({ message: "Server error while fetching discounts" });
  }
});


router.post("/save-discount", authMiddleware, async (req, res) => {
  try {
    console.log("📌 Received Data:", req.body);

    let {
      type,
      discountType,
      discountValue,
      selectedTags = [],
      minQuantity,
      applyTo
    } = req.body;

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
        return res.status(400).json({
          error: "Bulk discount requires a minimum quantity of at least 2."
        });
      }
    } else {
      minQuantity = undefined;
    }

    // ✅ Check for existing Tag-Based Discount with same tags
    if (type === "Tag-Based Discount" && selectedTags.length > 0) {
      const existing = await Discount.findOne({
        userId: req.user._id,
        type: "Tag-Based Discount",
        selectedTags: { $in: selectedTags }
      });

      if (existing) {
        return res.status(400).json({
          error: `A discount already exists for one of the selected tags (${existing.selectedTags.join(", ")})`
        });
      }
    }

    console.log("🔥 Processed Discount Data:", {
      type,
      discountType,
      discountValue,
      selectedTags,
      applyTo,
      minQuantity
    });

    // Save the discount in MongoDB
    const newDiscount = new Discount({
      type,
      discountType,
      discountValue,
      selectedTags,
      applyTo,
      minQuantity,
      userId: req.user._id
    });

    await newDiscount.save();

    res.json({ message: "Discount saved successfully!", discount: newDiscount });

  } catch (error) {
    console.error("❌ Error saving discount:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// ✅ Get all distinct discount tags
router.get("/tag-list", async (req, res) => {
  try {
    const tags = await Discount.find().distinct("selectedTags");
    res.json(tags);
  } catch (error) {
    console.error("❌ Error fetching tag list:", error);
    res.status(500).json({ error: "Error fetching tag list" });
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
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Discount.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Discount not found" });
    res.json({ message: "Discount deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting discount:", err.message);
    res.status(500).json({ message: "Failed to delete discount" });
  }
});


export default router;
