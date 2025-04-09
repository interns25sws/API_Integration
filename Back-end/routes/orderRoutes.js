import express from "express";
import axios from "axios";
import { authMiddleware, authorize } from "../middleware/authMiddleware.js";
import Discount from "../models/Discount.js"; // Import the schema

const router = express.Router();

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

router.post("/create-order", async (req, res) => {
  try {
    console.log("🔥 Incoming Order Request:", JSON.stringify(req.body, null, 2));

    const { line_items, customer, tags, total_price } = req.body;
    const customer_id = customer?.id || null;

    if (!Array.isArray(line_items) || line_items.length === 0) {
      console.error("❌ line_items is undefined or empty!");
      return res.status(400).json({ message: "No products selected" });
    }

    // Convert line_items to Shopify format
    const formattedLineItems = line_items.map((p) => ({
      variant_id: parseInt(p.variant_id.replace("gid://shopify/ProductVariant/", ""), 10),
      quantity: p.quantity,
      price: parseFloat(p.price).toFixed(2),
    }));

    // Convert tags to Shopify's format (Ensure it's an array for matching)
    const formattedTags = Array.isArray(tags) ? tags : tags.split(",").map(tag => tag.trim());

    // 🏷️ Initialize Discount Variables
    let bulkDiscountValue = 0;
    let tagDiscountValue = 0;

    // 🔎 Check for Bulk Discount
    const totalQuantity = line_items.reduce((sum, item) => sum + item.quantity, 0);
    const bulkDiscount = await Discount.findOne({ minQuantity: { $lte: totalQuantity } });

    if (bulkDiscount) {
      console.log(`✅ Bulk Discount Found: ${JSON.stringify(bulkDiscount, null, 2)}`);
      bulkDiscountValue = parseFloat(bulkDiscount.discountValue);
    }

    // 🔎 Check for Tag Discounts (Apply all matching tag discounts)
    if (formattedTags.length > 0) {
      // Loop through each tag and apply its discount
      let totalTagDiscountPercentage = 0;

      // Loop through the tags to find matching discounts
      for (let tag of formattedTags) {
        const tagDiscount = await Discount.findOne({
          selectedTags: { $in: [tag] } // Match the tag
        });

        if (tagDiscount) {
          console.log(`✅ Tag Discount Found for ${tag}: ${JSON.stringify(tagDiscount, null, 2)}`);
          totalTagDiscountPercentage += parseFloat(tagDiscount.discountValue); // Accumulate the tag discounts
        } else {
          console.log(`⚠️ No discount found for tag: ${tag}`);
        }
      }

      // Apply the total tag discount percentage
      tagDiscountValue = totalTagDiscountPercentage;
    }

    // ✅ Calculate Combined Discount Percentage
    let combinedDiscountPercentage = 100 - ((100 - bulkDiscountValue) * (100 - tagDiscountValue) / 100);

    // 💰 Apply Total Discount
    let finalTotalPrice = total_price * ((100 - combinedDiscountPercentage) / 100);
    if (finalTotalPrice < 0) finalTotalPrice = 0; // Prevent negative total

    // ✅ Prepare Discount Codes for Shopify
    let discountCodes = [];
    if (combinedDiscountPercentage > 0) {
      discountCodes.push({
        code: "BULK+TAG",
        amount: combinedDiscountPercentage.toFixed(2),
        type: "percentage",
      });
    }

    console.log("🛍️ Incoming customer_id:", customer_id);

    // 🛍️ Construct Shopify Order Payload
    const shopifyOrder = {
      order: {
        line_items: formattedLineItems,
        financial_status: "paid",
        currency: "INR",
        tags: formattedTags || null,
        total_discounts: (total_price - finalTotalPrice).toFixed(2),
        discount_codes: discountCodes,
        customer: customer_id
          ? { id: parseInt(customer_id.split("/").pop(), 10) } // Extract numeric ID
          : null,
      },
    };

    console.log("🛍️ Sending Order Payload:", JSON.stringify(shopifyOrder, null, 2));

    // 🛠️ Send Order to Shopify
    const response = await fetch(`https://bullvvark.myshopify.com/admin/api/2024-01/orders.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify(shopifyOrder),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Shopify API Error:", JSON.stringify(data, null, 2));
      return res.status(response.status).json({ error: data.errors || data });
    }

    res.json({ message: "Order created successfully", order: data.order });
  } catch (error) {
    console.error("❌ Error creating order:", error.message);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    console.log(`🔥 Deleting Order: ${orderId}`);

    const response = await fetch(
      `https://bullvvark.myshopify.com/admin/api/2024-01/orders/${orderId}.json`,
      {
        method: "DELETE",
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Shopify API Error:", JSON.stringify(data, null, 2));
      return res.status(response.status).json({ error: data.errors || data });
    }

    res.json({ message: "Order deleted successfully", orderId });
  } catch (error) {
    console.error("❌ Error deleting order:", error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;
