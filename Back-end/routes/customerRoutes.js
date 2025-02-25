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
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  ioInstance = io;
  console.log("✅ WebSocket server initialized.");
};

// Fetch customers from Shopify
router.get("/", async (req, res) => {
  try {
    const response = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `{
          customers(first: 50) {
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
                orders(first: 50) {
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

// ✅ Update customer details in Shopify
router.put("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    
    // Extract numeric ID from Shopify's global ID format
    id = id.replace("gid://shopify/Customer/", "");

    const { firstName, lastName, email, tags } = req.body;

    const updateQuery = {
      query: `
        mutation updateCustomer($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer {
              id
              firstName
              lastName
              email
              tags
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
          id: `gid://shopify/Customer/${id}`, // Ensure it's in Shopify format
          firstName,
          lastName,
          email,
          tags,
        },
      },
    };

    const response = await axios.post(process.env.SHOPIFY_GRAPHQL_URL, updateQuery, {
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    const errors = response.data.data.customerUpdate.userErrors;
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const updatedCustomer = response.data.data.customerUpdate.customer;

    if (ioInstance) {
      ioInstance.emit("customerUpdated", updatedCustomer);
    }

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error("❌ Error updating customer:", error);
    res.status(500).json({ error: "Failed to update customer" });
  }
});


// ✅ Delete customer from Shopify
router.delete("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    
    // Extract numeric ID from Shopify global ID
    id = id.replace("gid://shopify/Customer/", "");

    const deleteQuery = {
      query: `
        mutation {
          customerDelete(input: { id: "gid://shopify/Customer/${id}" }) {
            deletedCustomerId
            userErrors {
              field
              message
            }
          }
        }
      `,
    };

    const response = await axios.post(process.env.SHOPIFY_GRAPHQL_URL, deleteQuery, {
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    const errors = response.data.data.customerDelete.userErrors;
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (ioInstance) {
      ioInstance.emit("customerDeleted", id);
    }

    res.status(200).json({ success: true, deletedCustomerId: id });
  } catch (error) {
    console.error("❌ Error deleting customer:", error);
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

// ✅ Shopify Webhook: Listen for Customer Updates
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
