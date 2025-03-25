import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // Type of discount (e.g., Tag-Based Discount)
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    }, // ✅ Allow both percentage & fixed
    discountValue: { type: Number, required: true }, // ✅ Use 'discountValue' instead of 'discountPercent'
    selectedTags: [{ type: String, required: true }],
  },
  { timestamps: true }
);

const Discount = mongoose.model("Discount", discountSchema, "discounts");

export default Discount; // ✅ Ensure default export
