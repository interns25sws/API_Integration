import express from "express";
import axios from "axios";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Fetch customers directly from Shopify


router.get("/", authMiddleware, async (req, res) => {
  try {
    const { limit = 10, cursor = null, page = 1 } = req.query; // Added page query for better pagination
    const { role, tags } = req.user;

    console.log("🛠️ User Role:", role);
    console.log("🔍 User Tags:", tags);

    if (!process.env.SHOPIFY_ACCESS_TOKEN || !process.env.SHOPIFY_GRAPHQL_URL) {
      return res.status(500).json({ error: "Missing Shopify API credentials" });
    }

    // Construct GraphQL Query
    const query = `
      query GetCustomers($limit: Int!, $cursor: String) {
        customers(first: $limit, after: $cursor) {
          edges {
            node {
              id
              firstName
              lastName
              email
              tags
              defaultAddress {
                id
                address1
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
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        }
      }
    `;

    // Fetch customers from Shopify
    const response = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      { query, variables: { limit: parseInt(limit), cursor } },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📢 Shopify API Response:", JSON.stringify(response.data, null, 2));

    if (response.data.errors) {
      return res.status(400).json({ error: response.data.errors });
    }

    const customersData = response.data.data.customers;
    let customers = customersData.edges.map(({ node, cursor }) => {
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
        addressId: node.defaultAddress ? node.defaultAddress.id : null,
        orders: ordersCount,
        amountSpent: amountSpent.toFixed(2),
        tags: node.tags || [],
        cursor,
      };
    });

    console.log("📊 Total Customers Before Filtering:", customers.length);
    console.log("📜 Customers Data:", JSON.stringify(customers, null, 2));

    // 🔹 **Enforce Role-Based Access**
    if (role === "sales-rep") {
      console.log("🛠️ Sales Rep Tags:", tags);

      // Ensure tags is an array
      const repTags = Array.isArray(tags) ? tags : [];

      // Filter customers based on tags
      customers = customers.filter((customer) => {
        console.log(`🔍 Checking Customer: ${customer.email}`);
        console.log("📌 Customer Tags:", customer.tags);

        // Convert all tags to lowercase for case-insensitive matching
        const customerTags = customer.tags.map((tag) => tag.toLowerCase());
        const hasMatchingTag = customerTags.some((tag) =>
          repTags.includes(tag.toLowerCase())
        );

        console.log(`✅ Match Found? ${hasMatchingTag}`);
        return hasMatchingTag;
      });

      console.log("🔍 Filtered Customers for Sales Rep:", customers);
    }

    console.log("📊 Total Customers After Filtering:", customers.length);

    // ✅ Apply Pagination After Filtering
    const startIndex = (parseInt(page) - 1) * limit;
    const paginatedCustomers = customers.slice(startIndex, startIndex + parseInt(limit));
    const hasNextPage = startIndex + parseInt(limit) < customers.length;
    const nextCursor =
      hasNextPage && paginatedCustomers.length > 0
        ? paginatedCustomers[paginatedCustomers.length - 1].cursor
        : null;

    res.status(200).json({
      customers: paginatedCustomers,
      hasNextPage,
      hasPreviousPage: startIndex > 0,
      nextCursor,
    });
  } catch (error) {
    console.error("❌ Error fetching customers:", error.response?.data || error.message);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// ✅ Update customer in Shopify (Now supports updating location)
router.put("/:id", async (req, res) => {
  try {
    const shopifyId = `gid://shopify/Customer/${req.params.id}`;
    const { firstName, lastName, email, tags, location, addressId, address1 } = req.body;

    // Extract city & country from location
    let city = "";
    let country = "";
    if (location) {
      const parts = location.split(",");
      city = parts[0]?.trim() || "";
      country = parts[1]?.trim() || "";
    }

    // 🔹 1️⃣ Update Customer Details
    const customerUpdateResponse = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
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
            id: shopifyId,
            firstName: firstName || "",
            lastName: lastName || "",
            email: email || "",
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

    // Check for errors in customer update
    const customerErrors = customerUpdateResponse.data.data.customerUpdate.userErrors;
    if (customerErrors.length > 0) {
      console.error("❌ Customer Update Errors:", customerErrors);
      return res.status(400).json({ errors: customerErrors });
    }

    // 🔹 2️⃣ Update Address Only If Necessary
    if (addressId && city && country && address1) {
      const addressUpdateResponse = await axios.post(
        process.env.SHOPIFY_GRAPHQL_URL,
        {
          query: `
            mutation updateAddress($addressId: ID!, $address: MailingAddressInput!) {
              customerAddressUpdate(customerAddressId: $addressId, address: $address) {
                customerAddress {
                  id
                  address1
                  city
                  country
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            addressId: addressId,
            address: {
              address1: address1,  // ✅ Required field
              city: city,
              country: country,
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

      // Check for errors in address update
      const addressErrors = addressUpdateResponse.data.data.customerAddressUpdate.userErrors;
      if (addressErrors.length > 0) {
        console.error("❌ Address Update Errors:", addressErrors);
        return res.status(400).json({ errors: addressErrors });
      }
    }

    res.status(200).json({ message: "Customer updated successfully" });
  } catch (error) {
    console.error("❌ Error updating customer:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to update customer" });
  }
});
// add customer 

router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, tags, addresses } = req.body;

    console.log("📌 Received Data:", JSON.stringify(req.body, null, 2));

    // ✅ Filter addresses: Remove empty fields
    const filteredAddresses = addresses?.map((addr) => ({
      address1: addr.address1 || "",
      city: addr.city || "",
      province: addr.province || "",
      country: addr.country || "",
      zip: addr.zip || "",
      phone: addr.phone || "",
      company: addr.company || "",
    })).filter(addr => addr.address1 || addr.city || addr.country || addr.zip) || []; // ✅ Ensures at least one valid address field exists

    const response = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `
          mutation createCustomer($input: CustomerInput!) {
            customerCreate(input: $input) {
              customer {
                id
                firstName
                lastName
                email
                phone
                tags
                defaultAddress {
                  address1
                  city
                  province
                  country
                  zip
                  phone
                  company
                }
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
            firstName,
            lastName,
            email,
            phone,
            tags: tags ? tags.join(", ") : "",
            addresses: filteredAddresses, // ✅ Use filtered addresses
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

    console.log("📌 Shopify Response:", JSON.stringify(response.data, null, 2));

    const userErrors = response.data.data.customerCreate.userErrors;
    if (userErrors.length > 0) {
      console.error("❌ Shopify GraphQL Errors:", userErrors);
      return res.status(400).json({ errors: userErrors });
    }

    res.status(201).json({
      message: "Customer created successfully",
      customer: response.data.data.customerCreate.customer,
    });
  } catch (error) {
    console.error("❌ Error creating customer:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create customer", details: error.response?.data });
  }
});

router.get("/:id", async (req, res) => {
  try {
    let customerId = req.params.id;

    if (!customerId.startsWith("gid://")) {
      customerId = `gid://shopify/Customer/${customerId}`;
    }

    console.log("🔍 Fetching Customer with ID:", customerId);

    const response = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `
          query getCustomer($id: ID!) {
            customer(id: $id) {
              id
              firstName
              lastName
              email
              phone
              tags
              defaultAddress {
                address1
                city
                province
                country
                zip
                phone
                company
              }
              addresses {
                address1
                city
                province
                country
                zip
                phone
                company
              }
              orders(first: 5) {
                edges {
                  node {
                    id
                    name
                    totalPriceSet {
                      presentmentMoney {
                        amount
                        currencyCode
                      }
                    }
                    createdAt
                  }
                }
              }
            }
          }
        `,
        variables: { id: customerId },
      },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("🔎 Shopify Response:", JSON.stringify(response.data, null, 2));

    const customer = response.data.data.customer;

    if (!customer) {
      console.error("❌ Customer not found in Shopify:", response.data);
      return res.status(404).json({ message: "Customer not found in Shopify" });
    }

    res.json(customer);
  } catch (error) {
    console.error("❌ Error fetching customer from Shopify:", error.response?.data || error.message);
    res.status(500).json({ message: "Server error", error: error.response?.data });
  }
});

// ✅ Delete customer from Shopify

router.delete("/:id", async (req, res) => {
  try {
    const shopifyCustomerId = `gid://shopify/Customer/${req.params.id}`;
    const shopifyGraphQLUrl = process.env.SHOPIFY_GRAPHQL_URL;

    const mutation = `
      mutation {
        customerDelete(input: { id: "${shopifyCustomerId}" }) {
          deletedCustomerId
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await axios.post(
      shopifyGraphQLUrl,
      { query: mutation },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📌 Shopify Response:", response.data); // ✅ Log Shopify's response

    const { data } = response;

    if (data.errors || data.data.customerDelete.userErrors.length > 0) {
      return res.status(400).json({
        error: "Shopify deletion failed",
        details: data.errors || data.data.customerDelete.userErrors,
      });
    }

    res.json({ success: true, deletedCustomerId: req.params.id });

  } catch (error) {
    console.error("❌ Error deleting customer:", error.response?.data || error.message);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});


export default router;


// curl -X POST http://localhost:5000/api/user/login ^
// -H "Content-Type: application/json" ^
// -d "{ \"email\": \"interns.spiderwebsolutions@gmail.com\", \"password\": \"123456\" }"
