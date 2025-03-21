import express from "express";
import axios from "axios";
import { authMiddleware, authorize } from "../middleware/authMiddleware.js";
import User from "../models/User.js";


const router = express.Router();

// Fetch orders from Shopify directly with role-based filtering
// Fetch orders from Shopify directly with role-based filtering
// Fetch orders from Shopify directly
router.get("/fetch-orders-direct", authMiddleware, async (req, res) => {
  try {
    console.log("Fetching orders directly from Shopify...");

    if (!process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("Missing Shopify Access Token");
      return res.status(500).json({ error: "Shopify Access Token is missing" });
    }

    // Get pagination parameters
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor ? `"${req.query.cursor}"` : null;

    // **🔐 Role-Based Filtering**
    let tagFilter = "";
    if (req.user.role === "sales-rep") {
      const userTags = req.user.tags || [];
      console.log("🔎 Filtering orders for Sales Rep with tags:", userTags);

      if (userTags.length > 0) {
        const tagQuery = userTags.map((tag) => `tag:'${tag}'`).join(" OR ");
        tagFilter = `, query: "${tagQuery}"`;
      }
    }

    // ✅ Shopify GraphQL Query (Now filters orders **directly** from Shopify)
    const response = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `
          {
            orders(first: ${limit}, after: ${cursor}, reverse: true${tagFilter}) {
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
                  lineItems(first: 10) {
                    edges {
                      node {
                        title
                        quantity
                      }
                    }
                  }
                }
                cursor
              }
              pageInfo {
                hasNextPage
                endCursor
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

    const ordersData = response.data?.data?.orders;

    // ✅ Format orders
    const orders = ordersData.edges.map(({ node, cursor }) => ({
      orderId: node.legacyResourceId || node.id,
      name: node.name,
      createdAt: node.createdAt,
      email: node.email || "N/A",
      customerName: node.customer?.displayName || "Guest",
      totalPrice: node.totalPriceSet.shopMoney.amount,
      currency: node.totalPriceSet.shopMoney.currencyCode,
      paymentStatus: node.displayFinancialStatus,
      orderStatus: node.displayFulfillmentStatus || "Pending",
      deliveryNumber: node.fulfillments?.[0]?.trackingInfo?.number || "Not Available",
      tags: node.tags || [],
      lineItems:
        node.lineItems?.edges?.map(({ node }) => ({
          title: node.title,
          quantity: node.quantity,
        })) || [],
      cursor: cursor,
    }));

    res.status(200).json({
      orders,
      nextCursor: ordersData.pageInfo.hasNextPage ? ordersData.pageInfo.endCursor : null,
      hasNextPage: ordersData.pageInfo.hasNextPage,
    });
  } catch (error) {
    console.error(
      "Shopify API Error:",
      error.response ? JSON.stringify(error.response.data, null, 2) : error.message
    );
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});


// Update order in Shopify
router.put("/update-order/:id", async (req, res) => {
  const orderId = req.params.id; 
  const { email, note, tags, customAttributes, displayFulfillmentStatus } = req.body;

  console.log("Updating Order ID:", orderId, "with Data:", req.body);

  if (!orderId) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  try {
    const query = `
      mutation orderUpdate($input: OrderInput!) {
        orderUpdate(input: $input) {
          order {
            id
            email
            note
            tags
            displayFulfillmentStatus
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        id: `gid://shopify/Order/${orderId}`,
        email: email || undefined,
        note: note || undefined,
        tags: tags || undefined,
        customAttributes: customAttributes || undefined,
        displayFulfillmentStatus: displayFulfillmentStatus || undefined,
      }
    };

    const response = await axios.post(process.env.SHOPIFY_GRAPHQL_URL, { query, variables }, {
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    console.log("Shopify Response:", JSON.stringify(response.data, null, 2));

    if (response.data.errors) {
      return res.status(400).json({ error: response.data.errors });
    }

    if (response.data.data.orderUpdate.userErrors.length > 0) {
      return res.status(400).json({ error: response.data.data.orderUpdate.userErrors });
    }

    res.json({ success: true, order: response.data.data.orderUpdate.order });

  } catch (error) {
    console.error("❌ Error updating order in Shopify:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to update order in Shopify" });
  }
});

// Create a new order in Shopify
router.post("/create-order", async (req, res) => {
  try {
    console.log("Incoming Order Data:", JSON.stringify(req.body, null, 2));

    const { line_items, customer, note, tags } = req.body;

    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      console.error("Error: Line items are missing.");
      return res.status(400).json({ error: "Line items are required." });
    }

    const formattedLineItems = line_items.map((item) => {
      if (item.variant_id) {
        return { variantId: item.variant_id, quantity: item.quantity };
      } else {
        if (!item.title || !item.price) {
          console.error("Custom item missing title or price:", item);
          throw new Error("Custom item must have a title and price.");
        }
        return {
          title: item.title,
          originalUnitPrice: parseFloat(item.price).toFixed(2), // Ensure valid price format
          quantity: item.quantity,
        };
      }
    });

    console.log("Formatted Line Items:", JSON.stringify(formattedLineItems, null, 2));

    const response = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `
          mutation createOrder($input: DraftOrderInput!) {
            draftOrderCreate(input: $input) {
              draftOrder {
                id
                name
                totalPrice
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          input: {
            lineItems: formattedLineItems,
            customerId: customer?.id || null,
            note: note || "",
            tags: tags || [],
          },
        },
      },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const { draftOrderCreate } = response.data?.data || {};

    if (!draftOrderCreate) {
      console.error("Error: Missing `draftOrderCreate` in Shopify response:", response.data);
      return res.status(500).json({ error: "Unexpected response format from Shopify" });
    }

    if (draftOrderCreate.userErrors.length > 0) {
      console.error("Shopify Errors:", draftOrderCreate.userErrors);
      return res.status(400).json({ errors: draftOrderCreate.userErrors });
    }

    console.log("Order Created Successfully:", draftOrderCreate.draftOrder);
    res.status(201).json(draftOrderCreate.draftOrder);
  } catch (error) {
    console.error("Error creating order in Shopify:", error.response?.data || error.message);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Shopify GraphQL API Proxy Route
router.post("/graphql", async (req, res) => {
  try {
    console.log("Processing Shopify GraphQL request...");

    const response = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      req.body,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error processing Shopify GraphQL request:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
