import express from "express";
import axios from "axios";
import { Server } from "socket.io";

const router = express.Router();
let ioInstance;

// Initialize WebSocket server
export const initWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // Update with your frontend URL
      methods: ["GET", "POST"],
    },
  });
  ioInstance = io;
};

// Fetch customers from Shopify
router.get("/", async (req, res) => {
  try {
    const response = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `{
          customers(first: 10) {
            edges {
              node {
                id
                firstName
                lastName
                email
                tags
                defaultAddress {
                  city
                  country
                }
                orders(first: 10) {
                  edges {
                    node {
                      totalPriceSet {
                        shopMoney {
                          amount
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
      },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.errors) {
      return res.status(400).json({ error: response.data.errors });
    }

    const customers = response.data.data.customers.edges.map(({ node }) => {
      const orders = node.orders.edges;
      const ordersCount = orders.length;
      const amountSpent = orders.reduce(
        (total, order) => total + parseFloat(order.node.totalPriceSet.shopMoney.amount),
        0
      );

      return {
        shopifyId: node.id,
        firstName: node.firstName,
        lastName: node.lastName,
        email: node.email,
        location: node.defaultAddress
          ? `${node.defaultAddress.city}, ${node.defaultAddress.country}`
          : "Unknown",
        orders: ordersCount,
        amountSpent: amountSpent.toFixed(2),
        tags: node.tags,
      };
    });

    res.status(200).json(customers);
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Shopify Webhook Endpoint to Listen for Customer Updates
router.post("/webhook/customers", (req, res) => {
  try {
    console.log("🔔 Customer webhook received:", req.body);

    if (ioInstance) {
      ioInstance.emit("customerUpdate", req.body);
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res.status(500).send("Error processing webhook");
  }
});

export default router;
