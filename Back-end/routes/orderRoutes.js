// filepath: /c:/Users/jishan/Documents/GitHub/API_Integration/Back-end/routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new order
router.post("/", async (req, res) => {
  const { customer, total, paymentStatus, items, deliveryNo, orderStatus } = req.body;

  const order = new Order({
    customer,
    total,
    paymentStatus,
    items,
    deliveryNo,
    orderStatus,
  });

  try {
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an order
router.put("/:id", async (req, res) => {
  const { customer, total, paymentStatus, items, deliveryNo, orderStatus } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { customer, total, paymentStatus, items, deliveryNo, orderStatus },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an order
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;