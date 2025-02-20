import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: { type: String, required: true },
  total: { type: Number, required: true },
  paymentStatus: { type: String, required: true },
  items: { type: String, required: true },
  deliveryNo: { type: String, required: true },
  orderStatus: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;