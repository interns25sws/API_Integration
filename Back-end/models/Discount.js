import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ["Tag-Based Discount", "Bulk Discount", "Generic Discount"], 
      required: true 
    }, 

    discountType: { 
      type: String, 
      enum: ["percentage", "fixed"], 
      required: true 
    },

    discountValue: { 
      type: Number, 
      required: true,
      min: [0, "Discount value must be positive"], 
    },

    selectedTags: { 
      type: [String], 
      default: [] 
    },

    applyTo: { 
      type: String, 
      enum: ["single", "bulk", "generic"], 
      default: function () {
        return this.type === "Bulk Discount" ? "bulk" : undefined;
      }
    },

    minQuantity: { 
      type: Number, 
      min: [2, "Minimum quantity must be at least 2"], 
      required: function () {
        return this.type === "Bulk Discount";
      }
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Set applyTo before saving
discountSchema.pre("save", function (next) {
  if (this.type === "Bulk Discount" && !this.applyTo) {
    this.applyTo = "bulk";
  }
  next();
});

const Discount = mongoose.model("Discount", discountSchema, "discounts");

export default Discount;
