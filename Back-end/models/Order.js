import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: String,
  name: String,
  createdAt: Date,
  email: String,
  totalPrice: Number,
  currency: String,
  paymentStatus: String,
  orderStatus: String,
  deliveryNumber: String,
  lineItems: [
    {
      title: String,
      quantity: Number,
    },
  ],
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
