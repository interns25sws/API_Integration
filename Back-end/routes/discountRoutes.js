import express from "express";
import Discount from "../models/Discount.js"; // Import the schema

const router = express.Router();

// Fetch all discounts
router.get("/discounts", async (req, res) => {
  try {
    const discounts = await Discount.find();
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// Save a new discount (✅ Prevent Duplicate Tags)
router.post("/save-discount", async (req, res) => {
  try {
    console.log("Received Data:", req.body); // ✅ Debugging

    const { type, discountType, discountValue, selectedTags } = req.body;

    if (!type || !discountType || !discountValue || !selectedTags.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Check if any of the selected tags already exist in the database
    const existingDiscount = await Discount.findOne({
      selectedTags: { $in: selectedTags },
    });

    if (existingDiscount) {
      return res.status(400).json({
        error: `The tag "${existingDiscount.selectedTags[0]}" already has a discount. Please use a unique tag.`,
      });
    }

    // ✅ If no duplicate, save the new discount
    const newDiscount = new Discount({
      type,
      discountType,
      discountValue,
      selectedTags,
    });
    await newDiscount.save();

    res.json({ message: "Discount saved successfully", discount: newDiscount });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Fetch discount based on tag
router.get("/discounts-by-tag", async (req, res) => {
  try {
    const { tag } = req.query;
    if (!tag) {
      return res.status(400).json({ message: "Tag is required" });
    }

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

export default router;
