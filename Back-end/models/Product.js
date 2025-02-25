import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  price: { type: String },
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
