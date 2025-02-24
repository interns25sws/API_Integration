import express from "express";
import axios from "axios";
import Customer from "../models/Customer.js";

 const router = express.Router();

// Fetch customers from Shopify and store in MongoDB
router.post("/fetch-customers", async (req, res) => {
    try {
      console.log("⏳ Fetching customers from Shopify...");
  
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
  
      // Process customer data
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
  
      // Save to database
      for (const customer of customers) {
        await Customer.findOneAndUpdate(
          { shopifyId: customer.shopifyId },
          customer,
          { upsert: true, new: true }
        );
      }
  
      res.status(200).json({ message: "Customers saved successfully", customers });
    } catch (error) {
      console.error("❌ Error fetching customers:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });
  

// Get all customers
router.get("/", async (req, res) => {
    try {
      const customers = await Customer.find();
      res.json(customers);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
// Get a single customer by ID
router.get("/:customerId", async (req, res) => {
  try {
    const customer = await Customer.findOne({ customerId: req.params.customerId });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a customer
router.put("/:customerId", async (req, res) => {
  try {
    const updatedCustomer = await Customer.findOneAndUpdate(
      { customerId: req.params.customerId },
      { $set: req.body },
      { new: true }
    );
    if (!updatedCustomer) return res.status(404).json({ error: "Customer not found" });
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a customer
router.delete("/:customerId", async (req, res) => {
  try {
    const deletedCustomer = await Customer.findOneAndDelete({ customerId: req.params.customerId });
    if (!deletedCustomer) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
