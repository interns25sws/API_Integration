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
                  customer {
                    id
                    displayName
                  }
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
                  tags
                  note
                  lineItems(first: 10) {
                    edges {
                      node {
                        title
                        quantity
                        variant {
                          id
                        }
                        originalUnitPriceSet {
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
      shopifyId: node.id, // Make sure this is unique
      orderId: node.legacyResourceId || node.id, // ✅ Shopify Order ID
      name: node.name,
      createdAt: node.createdAt,
      email: node.email,
      customerId: node.customer?.id || "", // Shopify Customer ID
      customerName: node.customer?.displayName || "Guest",
      totalPrice: parseFloat(node.totalPriceSet.shopMoney.amount),
      currency: node.totalPriceSet.shopMoney.currencyCode,
      paymentStatus: node.displayFinancialStatus,
      orderStatus: node.displayFulfillmentStatus,
      deliveryNumber: node.fulfillments?.[0]?.trackingInfo?.number || "Not Shipped",
      tags: node.tags || [],
      notes: node.note || "",
      lineItems: node.lineItems?.edges?.map(({ node }) => ({
        title: node.title || "Unknown Item",
        quantity: node.quantity,
        price: parseFloat(node.originalUnitPriceSet?.shopMoney?.amount || 0),
        variantId: node.variant?.id || "",
      })) || [],
    }));

    for (const order of orders) {
      if (!order.orderId) {
        console.warn("⚠️ Skipping order due to missing orderId:", order);
        continue; // Skip orders with no ID
      }
    
      await Order.findOneAndUpdate(
        { orderId: order.orderId }, // Ensure correct order matching
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
router.put("/:shopifyId", async (req, res) => {
  const { shopifyId } = req.params;
  const { orderStatus, deliveryNumber, newLineItem } = req.body;

  console.log("🔄 Updating Order:", { shopifyId, orderStatus, deliveryNumber, newLineItem });

  if (!shopifyId || !orderStatus) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let queryShopifyId = shopifyId.startsWith("gid://shopify/Order/") 
      ? shopifyId 
      : `gid://shopify/Order/${shopifyId}`;

    // 🔍 Fetch the existing order
    const existingOrder = await Order.findOne({ shopifyId: queryShopifyId });

    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ✅ Keep old items + Add new product if provided
    const updatedLineItems = [...(existingOrder.lineItems || [])];

    if (newLineItem && newLineItem.title) {
      updatedLineItems.push(newLineItem);
    }

    // ✅ Update Order in MongoDB
    const updatedOrder = await Order.findOneAndUpdate(
      { shopifyId: queryShopifyId },
      { 
        $set: { orderStatus, deliveryNumber }, 
        $push: { lineItems: newLineItem } // Push new item without overwriting
      },
      { new: true }
    );

    console.log("✅ Updated Order with New Product:", updatedOrder);

    res.json({
      success: true,
      message: "Order updated successfully",
      updatedOrder,
    });
  } catch (error) {
    console.error("❌ Error updating order:", error.response?.data || error.message);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// 🟢 Delete Order from MongoDB & Cancel on Shopify
router.delete("/:shopifyId", async (req, res) => {
  const { shopifyId } = req.params;

  try {
    console.log("🗑️ Deleting Order:", shopifyId);

    // Delete from MongoDB, ensuring we check both formats
    const deletedOrder = await Order.findOneAndDelete({
      $or: [
        { shopifyId },
        { shopifyId: `gid://shopify/Order/${shopifyId}` }
      ]
    });

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found in database" });
    }

    // Cancel order in Shopify using GraphQL
    const shopifyCancelResponse = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `mutation CancelOrder($orderId: ID!) {
          orderClose(input: {id: $orderId}) {
            order { id }
            userErrors { field message }
          }
        }`,
        variables: {
          orderId: deletedOrder.shopifyId, // Use the stored full Shopify GID
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

// 🟢 Create New Order in MongoDB & Shopify
router.post("/", async (req, res) => {
  try {
    const { line_items, customer, note, tags } = req.body;

    // Prepare order payload for Shopify
    const shopifyOrderPayload = {
      input: {
        lineItems: line_items.map((item) => ({
          variantId: item.product_id,
          quantity: item.quantity || 1,
        })),
        customerId: customer?.id || null,
        note,
        tags,
      },
    };

    // 🔄 Send order to Shopify via GraphQL
    const shopifyResponse = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `mutation CreateOrder($input: DraftOrderInput!) {
          draftOrderCreate(input: $input) {
            draftOrder {
              id
              name
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }`,
        variables: shopifyOrderPayload,
      },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const shopifyOrder = shopifyResponse.data.data.draftOrderCreate.draftOrder;

    if (!shopifyOrder) {
      return res.status(400).json({ error: "Failed to create order in Shopify" });
    }

    // ✅ Save order to MongoDB
    const newOrder = new Order({
      shopifyId: shopifyOrder.id,
      orderId: shopifyOrder.name,
      createdAt: shopifyOrder.createdAt,
      totalPrice: parseFloat(shopifyOrder.totalPriceSet.shopMoney.amount),
      currency: shopifyOrder.totalPriceSet.shopMoney.currencyCode,
      customerId: customer?.id || "",
      customerName: customer?.displayName || "Guest",
      note,
      tags,
      lineItems: line_items.map((item) => ({
        title: "Custom Product", // Modify as needed
        quantity: item.quantity || 1,
        price: 0, // Modify if fetching product price
      })),
    });

    await newOrder.save();

    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

export default router;
