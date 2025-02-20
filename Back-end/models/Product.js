import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    image: { type: String, required: true }, // URL of the product image
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
