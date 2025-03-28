import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import Shopify from "shopify-api-node";
import { authMiddleware } from "../middleware/authMiddleware.js";  // Ensure user is authenticated

dotenv.config();

const router = express.Router();

// Shopify connection check endpoint
router.get("/check-connection", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;  // Get the user ID from the JWT
    const shopData = await Shop.findOne({ userId });  // Fetch the Shopify store data for this user

    // Check if store is connected
    if (!shopData || !shopData.accessToken) {
      // Use access token from .env if no shop data
      const shopify = new Shopify({
        shopName: process.env.SHOPIFY_STORE_NAME,  // Get Shopify store name from .env
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN,  // Get access token from .env
      });

      // Check Shopify connection
      const shop = await shopify.shop.get();
      return res.json({ success: true, shop });
    }

    // If store is connected in the database, use the stored token
    const shopify = new Shopify({
      shopName: shopData.shop,  // Shopify store domain (e.g., 'your-shop.myshopify.com')
      accessToken: shopData.accessToken,  // Access token from the database
    });

    // Check Shopify connection
    const shop = await shopify.shop.get();
    res.json({ success: true, shop });
  } catch (error) {
    console.error("❌ Shopify Connection Failed:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get("/top-products", async (req, res) => {
  try {
  

    const query = `
      {
        products(first: 5) {
          edges {
            node {
              id
              title
              totalInventory
              featuredImage {
                url
              }
              variants(first: 1) {
                edges {
                  node {
                    price
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(`https://bullvvark.myshopify.com/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    const products = data.data.products.edges.map((edge) => edge.node);

    res.json({ products });
  } catch (error) {
    console.error("❌ Error fetching products from Shopify:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});
router.get("/analytics", async (req, res) => {

  try {
    const query = `
     {
  orders(first: 100, sortKey: CREATED_AT, reverse: true) {
    edges {
      node {
        id
        createdAt
        totalPriceSet {
          shopMoney {
            amount
          }
        }
      }
    }
  }
}

    `;

    const response = await fetch(`https://bullvvark.myshopify.com/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    console.log("🔍 Shopify API Response:", JSON.stringify(data, null, 2)); // Debugging log

    if (!data.data || !data.data.orders) {
      return res.status(500).json({ error: "Failed to fetch analytics", details: data });
    }

    const orders = data.data.orders.edges.map((edge) => edge.node);
    console.log("Total Orders Fetched from Shopify:", orders.length);

    // Get current date and time
    const now = new Date();
    // Calculate the date 7 days ago
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter orders created in the last 7 days
    const recentOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= last7Days;
    });

    // Calculate total revenue and orders for the last 7 days
    const totalRevenue = recentOrders.reduce((sum, order) => sum + parseFloat(order.totalPriceSet.shopMoney.amount), 0);
    const totalOrders = recentOrders.length;

    const activity = {};
    recentOrders.forEach((order) => {
      const date = order.createdAt.split("T")[0];
      activity[date] = (activity[date] || 0) + 1;
    });

    const activityLabels = Object.keys(activity);
    const activityValues = Object.values(activity);

    res.json({
      analytics: {
        totalOrders,
        totalRevenue,
        activity: {
          labels: activityLabels,
          hoursSpent: activityValues,
        },
        earnings: {
          labels: ["Total Revenue"],
          revenue: [totalRevenue],
          profit: [totalRevenue * 0.8],
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching analytics from Shopify:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

router.post("/graphql", async (req, res) => {
  console.log("🔥 Incoming Shopify GraphQL request:", req.body);

  try {
    const response = await axios.post(
      `https://${process.env.SHOPIFY_STORE_NAME}/admin/api/2024-01/graphql.json`,
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN, // ✅ Make sure this is correct
        },
      }
    );

    console.log("✅ Shopify Response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Shopify GraphQL Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});
export default router;


