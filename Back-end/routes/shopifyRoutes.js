import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import Shopify from "shopify-api-node";
import { authMiddleware } from "../middleware/authMiddleware.js";  // Ensure user is authenticated
import Shop from "../models/Shop.js";  // Assuming this is your model to store shop data

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
// 🟢 Fetch Analytics Data from Shopify
router.get("/analytics", authMiddleware, async (req, res) => {
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

    // 🛒 Fetch All Orders
    const orders = await shopify.order.list();
    
    // 🏆 Calculate Total Revenue
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
    
    // 🛍️ Calculate Total Orders Count
    const orderCount = orders.length;

    // 📈 Example: Get Total Products Count
    const products = await shopify.product.list();
    const totalProducts = products.length;

    // ⏳ Get Sales in Last 7 Days (Example)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = orders.filter(order => new Date(order.created_at) >= sevenDaysAgo);
    const revenueLast7Days = recentOrders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);

    res.json({
      totalRevenue,
      orderCount,
      totalProducts,
      revenueLast7Days,
    });

  } catch (error) {
    console.error("❌ Error fetching analytics:", error.message);
    res.status(500).json({ error: "Failed to fetch analytics." });
  }
});

// Fetch all products
router.get("/products", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const shopData = await Shop.findOne({ userId });

    if (!shopData || !shopData.accessToken) {
      // Fallback to access token from .env if not in the database
      if (!process.env.SHOPIFY_ACCESS_TOKEN) {
        return res.status(400).json({ success: false, message: "Shopify store not connected and no access token in .env" });
      }
      // Use the access token from .env if not in DB
      const shopify = new Shopify({
        shopName: process.env.SHOPIFY_STORE_NAME, // Directly from .env
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN, // From .env
      });

      const products = await shopify.product.list();
      return res.json(products);
    }

    const shopify = new Shopify({
      shopName: shopData.shop,
      accessToken: shopData.accessToken,
    });

    const products = await shopify.product.list();

    // Check if any products were found
    if (products.length === 0) {
      console.log("🔍 No products found for user:", userId);
      return res.status(404).json({ success: false, message: "No products found" });
    }

    console.log("✅ Products fetched successfully for user:", userId);
    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products." });
  }
});

// Fetch all orders
router.get("/orders", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const shopData = await Shop.findOne({ userId });

    if (!shopData || !shopData.accessToken) {
      // Fallback to access token from .env if not in the database
      if (!process.env.SHOPIFY_ACCESS_TOKEN) {
        return res.status(400).json({ success: false, message: "Shopify store not connected and no access token in .env" });
      }

      // Use the access token from .env if not in DB
      const shopify = new Shopify({
        shopName: process.env.SHOPIFY_STORE_NAME, // Directly from .env
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN, // From .env
      });

      const orders = await shopify.order.list();
      return res.json(orders);
    }

    const shopify = new Shopify({
      shopName: shopData.shop,
      accessToken: shopData.accessToken,
    });

    const orders = await shopify.order.list();
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error.message);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});



router.post("/graphql", async (req, res) => {
  console.log("🔥 Incoming Shopify GraphQL request:", req.body);

  try {
    const response = await axios.post(
      `https://${process.env.SHOPIFY_STORE_NAME}/admin/api/2023-01/graphql.json`,
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



// Fetch a single product by ID
router.get("/products/:id", authMiddleware, async (req, res) => {
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

    const product = await shopify.product.get(req.params.id);
    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error.message);
    res.status(500).json({ error: "Failed to fetch product." });
  }
});

// Fetch a single order by ID
router.get("/orders/:id", authMiddleware, async (req, res) => {
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

    const order = await shopify.order.get(req.params.id);
    res.json(order);
  } catch (error) {
    console.error("❌ Error fetching order:", error.message);
    res.status(500).json({ error: "Failed to fetch order." });
  }
});

export default router;

