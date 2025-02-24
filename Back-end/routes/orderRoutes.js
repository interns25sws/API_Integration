// // filepath: /c:/Users/jishan/Documents/GitHub/API_Integration/Back-end/routes/orderRoutes.js
// import express from "express";
// import Order from "../models/Order.js";

// const router = express.Router();

// // Get all orders
// router.get("/", async (req, res) => {
//   try {
//     const orders = await Order.find();
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Add a new order
// router.post("/", async (req, res) => {
//   const { customer, total, paymentStatus, items, deliveryNo, orderStatus } = req.body;

//   const order = new Order({
//     customer,
//     total,
//     paymentStatus,
//     items,
//     deliveryNo,
//     orderStatus,
//   });

//   try {
//     const newOrder = await order.save();
//     res.status(201).json(newOrder);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // Update an order
// router.put("/:id", async (req, res) => {
//   const { customer, total, paymentStatus, items, deliveryNo, orderStatus } = req.body;

//   try {
//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       { customer, total, paymentStatus, items, deliveryNo, orderStatus },
//       { new: true }
//     );
//     res.json(updatedOrder);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // Delete an order
// router.delete("/:id", async (req, res) => {
//   try {
//     await Order.findByIdAndDelete(req.params.id);
//     res.json({ message: "Order deleted" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// export default router;

import express from "express";
import axios from "axios";
import Order from "../models/Order.js";

const router = express.Router();

// 🟢 Fetch orders from Shopify and store in MongoDB
router.post("/fetch-orders", async (req, res) => {
  try {
    console.log("⏳ Fetching orders from Shopify...");

    const response = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `
          {
            orders(first: 50, reverse: true, query: "created_at:>2024-01-01") {
              edges {
                node {
                  id
                  legacyResourceId
                  name
                  createdAt
                  email
                  totalPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                  displayFinancialStatus
                  displayFulfillmentStatus
                  fulfillments {
                    trackingInfo {
                      number
                    }
                  }
                  lineItems(first: 10) {
                    edges {
                      node {
                        title
                        quantity
                      }
                    }
                  }
                }
              }
            }
          }
        `,
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

    const orders = response.data.data.orders.edges.map(({ node }) => ({
      orderId: node.legacyResourceId,
      name: node.name,
      createdAt: node.createdAt,
      email: node.email,
      totalPrice: parseFloat(node.totalPriceSet.shopMoney.amount),
      currency: node.totalPriceSet.shopMoney.currencyCode,
      paymentStatus: node.displayFinancialStatus,
      orderStatus: node.displayFulfillmentStatus,
      deliveryNumber: node.fulfillments?.[0]?.trackingInfo?.number || "Not Shipped",
      lineItems: node.lineItems?.edges?.map(({ node }) => ({
        title: node.title || "Unknown Item",
        quantity: node.quantity,
      })) || [],
    }));

    for (const order of orders) {
      await Order.findOneAndUpdate(
        { orderId: order.orderId },
        order,
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ message: "Orders saved successfully", orders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// 🟢 Get all orders from MongoDB
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟢 Update Order Status in MongoDB & Shopify
router.put("/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus, deliveryNumber } = req.body;

  console.log("🔄 Updating Order:", { orderId, orderStatus, deliveryNumber });

  if (!orderId || !orderStatus) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Update MongoDB Order
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: orderId }, // Ensure correct matching
      { $set: req.body }, // Update all fields dynamically
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Send Update to Shopify (Fulfillment)
    const shopifyResponse = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `
          mutation FulfillOrder($fulfillmentOrderId: ID!) {
            fulfillmentCreateV2(
              input: {
                fulfillmentOrderId: $fulfillmentOrderId
                trackingInfo: {
                  number: "${deliveryNumber || "No Tracking"}"
                  company: "DHL"
                }
              }
            ) {
              fulfillment {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          fulfillmentOrderId: `gid://shopify/Order/${orderId}`,
        },
      },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📦 Shopify Response:", shopifyResponse.data);

    res.json({ success: true, message: "Order updated successfully", updatedOrder });
  } catch (error) {
    console.error("❌ Error updating order:", error.response?.data || error.message);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// 🟢 Delete Order from MongoDB & Cancel on Shopify
router.delete("/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    console.log("🗑️ Deleting Order:", orderId);

    // Delete from MongoDB
    const deletedOrder = await Order.findOneAndDelete({ orderId });

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found in database" });
    }

    // Cancel order in Shopify using GraphQL
    const shopifyCancelResponse = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `
          mutation CancelOrder($orderId: ID!) {
            orderClose(input: {id: $orderId}) {
              order {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          orderId: `gid://shopify/Order/${orderId}`,
        },
      },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("🛑 Shopify Cancel Response:", shopifyCancelResponse.data);

    if (shopifyCancelResponse.data.errors) {
      return res.status(400).json({ error: shopifyCancelResponse.data.errors });
    }

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

export default router;
