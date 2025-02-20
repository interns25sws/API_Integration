import express from 'express';
import Shopify from 'shopify-api-node';
import { authMiddleware } from '../middleware/authMiddleware.js';  // Ensure user is authenticated
import Shop from '../models/Shop.js';  // Your shop model

const router = express.Router();

// Fetch Earnings Data (Revenue and Profit)
router.get("/earnings", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const shopData = await Shop.findOne({ userId });

    if (!shopData || !shopData.accessToken) {
      return res.status(400).json({ success: false, message: "Shopify store not connected" });
    }

    const shopify = new Shopify({
      shopName: shopData.shop,
      accessToken: shopData.accessToken,
    });

    // Get the orders for the past week (you can modify the time range)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days

    const orders = await shopify.order.list({
      created_at_min: startDate.toISOString(),
      financial_status: 'paid',  // Only paid orders
      status: 'any',  // Include all order statuses
    });

    // Calculate total revenue
    const revenue = orders.reduce((total, order) => total + parseFloat(order.total_price), 0);

    // Calculate profit (assuming you have product cost data stored in Shopify)
    const profit = orders.reduce((total, order) => {
      // You could calculate profit by subtracting cost from total_price (assuming product cost is available)
      const cost = order.line_items.reduce((cost, item) => cost + (item.cost || 0), 0); // Replace `item.cost` with your cost field
      return total + (parseFloat(order.total_price) - cost);
    }, 0);

    // Prepare the response data
    const earningsData = {
      revenue,
      profit,
      weeklyData: orders.map(order => ({
        date: order.created_at.split('T')[0],  // Just the date part
        revenue: parseFloat(order.total_price),
      })),
    };

    return res.json(earningsData);
  } catch (error) {
    console.error("❌ Error fetching earnings data:", error.message);
    res.status(500).json({ error: "Failed to fetch earnings data." });
  }
});

// Fetch Activity Data (Order count per day)
router.get("/activities", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const shopData = await Shop.findOne({ userId });

    if (!shopData || !shopData.accessToken) {
      return res.status(400).json({ success: false, message: "Shopify store not connected" });
    }

    const shopify = new Shopify({
      shopName: shopData.shop,
      accessToken: shopData.accessToken,
    });

    // Get the orders for the past week (you can modify the time range)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days

    const orders = await shopify.order.list({
      created_at_min: startDate.toISOString(),
      financial_status: 'paid',
      status: 'any',
    });

    // Calculate the number of orders per day for activity data
    const activityData = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dateStr = day.toISOString().split('T')[0];

      const ordersForDay = orders.filter(order => order.created_at.split('T')[0] === dateStr);
      activityData.push({
        day: dateStr,
        ordersCount: ordersForDay.length,
      });
    }

    return res.json(activityData);
  } catch (error) {
    console.error("❌ Error fetching activity data:", error.message);
    res.status(500).json({ error: "Failed to fetch activity data." });
  }
});

export default router;
