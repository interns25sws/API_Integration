import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true }, // 🟢 Ensure `orderId` exists
    shopifyId: { type: String, required: true }, 
    name: { type: String, required: true }, 
    email: { type: String, required: true },
    customerId: { type: String }, 
    customerName: { type: String }, 
    totalPrice: { type: Number, required: true },
    currency: { type: String, required: true },
    paymentStatus: { type: String, enum: ["paid", "pending", "failed"], default: "pending" },
    orderStatus: { type: String, enum: ["draft", "completed", "cancelled"], default: "draft" },
    deliveryNumber: { type: String, default: "" }, 
    tags: [{ type: String }], 
    notes: { type: String, default: "" }, 
    lineItems: [
      {
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, 
        variantId: { type: String }, 
      },
    ],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
