import express from "express";
import axios from "axios";

const router = express.Router();

const headers = {
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN, // Use your token from .env
};

// ✅ Fetch products from Shopify
router.post("/fetch", async (req, res) => {
  const { limit = 10, cursor = null } = req.body;

  try {
    const response = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `
          query GetProducts($limit: Int!, $cursor: String) {
            products(first: $limit, after: $cursor) {
              edges {
                node {
                  id
                  title
                  description
                  createdAt
                  totalInventory
                  images(first: 1) {
                    edges {
                      node {
                        originalSrc
                      }
                    }
                  }
                  variants(first: 1) {
                    edges {
                      node {
                        price
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
        variables: { limit, cursor },
      },
      { headers }
    );

    const data = response.data.data.products;
    const products = data.edges.map(({ node }) => ({
      id: node.id,
      shopifyId: node.id, // Store Shopify ID
      title: node.title,
      description: node.description,
      createdAt: new Date(node.createdAt).toLocaleDateString(),
      stock: node.totalInventory ?? "N/A",
      image: node.images.edges[0]?.node.originalSrc || "https://via.placeholder.com/150",
      price: node.variants.edges[0]?.node.price || "N/A",
    }));

    res.json({
      products,
      nextCursor: data.pageInfo.endCursor,
      hasNextPage: data.pageInfo.hasNextPage,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ✅ Update Product Route
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, price, stock } = req.body;

  const productId = `gid://shopify/Product/${id}`;

  console.log("🔹 Updating product with ID:", id);
  console.log("📌 New Data:", { title, description, price, stock });

  try {
    // ✅ Step 1: Fetch product variants to get variant ID & Inventory Item ID
    const variantResponse = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `
          query GetProductVariants($id: ID!) {
            product(id: $id) {
              variants(first: 1) {
                edges {
                  node {
                    id
                    inventoryItem {
                      id
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { id: productId },
      },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const variants = variantResponse.data.data.product.variants.edges;
    if (variants.length === 0) {
      return res.status(400).json({ success: false, message: "No variants found for this product" });
    }

    const variantId = variants[0].node.id;
    const inventoryItemId = variants[0].node.inventoryItem.id;

    console.log("✅ Variant ID Found:", variantId);
    console.log("✅ Inventory Item ID Found:", inventoryItemId);

    // ✅ Step 2: Update product details (Title & Description)
    const productUpdateResponse = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `
          mutation UpdateProduct($id: ID!, $title: String, $descriptionHtml: String) {
            productUpdate(input: { id: $id, title: $title, descriptionHtml: $descriptionHtml }) {
              product {
                id
                title
                descriptionHtml
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: { id: productId, title, descriptionHtml: description },
      },
      { headers: { "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN, "Content-Type": "application/json" } }
    );

    // ✅ Step 3: Update product variant price
    const priceUpdateResponse = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `
          mutation UpdateProductVariant($id: ID!, $price: Money!) {
            productVariantUpdate(input: { id: $id, price: $price }) {
              productVariant {
                id
                price
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: { id: variantId, price: parseFloat(price) },
      },
      { headers: { "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN, "Content-Type": "application/json" } }
    );

    // ✅ Step 4: Set Inventory Quantity
    const inventoryUpdateResponse = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `
          mutation InventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
            inventoryAdjustQuantities(input: $input) {
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          input: {
            name: "available", // ✅ Correct quantity type
            reason: "correction", // ✅ Valid reason
            changes: [
              {
                inventoryItemId: inventoryItemId, // ✅ Correct dynamic ID
                delta: parseInt(stock), // ✅ Correct field
                locationId: "gid://shopify/Location/77066436786", // ✅ Correct location ID
              },
            ],
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

    console.log("🔍 Full Shopify Response:", JSON.stringify(inventoryUpdateResponse.data, null, 2));

    // ✅ Check for Inventory Update Errors
    const inventoryErrors =
      inventoryUpdateResponse?.data?.data?.inventoryAdjustQuantities?.userErrors || [];

    if (inventoryErrors.length > 0) {
      console.error("❌ Shopify Inventory Errors:", inventoryErrors);
      return res.status(400).json({ success: false, errors: inventoryErrors });
    }

    console.log("✅ Inventory Updated Successfully");

    res.json({
      success: true,
      updatedProduct: productUpdateResponse.data.data.productUpdate.product,
      updatedVariant: priceUpdateResponse.data.data.productVariantUpdate.productVariant,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating product:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ✅ Create Product

router.post("/", async (req, res) => {
  try {
    const { title, description, variants, media, category, tags, trackQuantity, quantity, collectionId } = req.body;
    console.log("🔹 Received product data:", req.body);

    // ✅ Format Variants Properly
    const formattedVariants = variants.map((v) => {
      const price = isNaN(parseFloat(v.price)) ? "0.00" : parseFloat(v.price).toFixed(2);
      const compareAtPrice = isNaN(parseFloat(v.compareAtPrice)) ? undefined : parseFloat(v.compareAtPrice).toFixed(2);

      return {
        title: v.name || "Default Variant",
        price,
        compareAtPrice,
        inventoryManagement: trackQuantity ? "SHOPIFY" : null, // ✅ Inventory tracking enabled
      };
    });

    // ✅ Create Product in Shopify
    const shopifyResponse = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `
          mutation CreateProduct($input: ProductInput!) {
            productCreate(input: $input) {
              product {
                id
                title
                variants(first: 10) {
                  edges {
                    node {
                      id
                      inventoryItem {
                        id
                      }
                    }
                  }
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
            title,
            descriptionHtml: description,
            tags,
            variants: formattedVariants,
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

    console.log("✅ Shopify Response:", JSON.stringify(shopifyResponse.data, null, 2));

    const responseData = shopifyResponse.data;

    // ✅ Handle Errors
    if (!responseData.data || responseData.data.productCreate.userErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Shopify error",
        errors: responseData.data?.productCreate?.userErrors || [],
      });
    }

    const product = responseData.data.productCreate.product;
    const inventoryItemId = product.variants.edges[0]?.node?.inventoryItem?.id;

    // ✅ Update Category (Product Type) Separately
    if (category) {
      console.log("🚀 Updating Product Category...");
      await axios.post(
        process.env.SHOPIFY_GRAPHQL_URL,
        {
          query: `
            mutation UpdateProductCategory($id: ID!, $productType: String!) {
              productUpdate(input: { id: $id, productType: $productType }) {
                product {
                  id
                  productType
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            id: product.id,
            productType: category,
          },
        },
        {
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Category Updated Successfully!");
    }

    // ✅ Get Inventory Location ID
    const locationResponse = await axios.post(
      process.env.SHOPIFY_GRAPHQL_URL,
      {
        query: `query { locations(first: 10) { edges { node { id name } } } }`,
      },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const locationId = locationResponse.data.data.locations.edges[0]?.node?.id;
    console.log("✅ Found Location ID:", locationId);

    // ✅ Update Inventory Quantity
    if (trackQuantity && quantity > 0 && inventoryItemId && locationId) {
      console.log("🚀 Updating Inventory Quantity...");
      await axios.post(
        process.env.SHOPIFY_GRAPHQL_URL,
        {
          query: `
            mutation SetInventoryQuantity($inventoryItemId: ID!, $locationId: ID!, $quantity: Int!) {
              inventorySetOnHandQuantities(setOnHandQuantities: [
                {
                  inventoryItemId: $inventoryItemId,
                  locationId: $locationId,
                  onHandQuantity: $quantity
                }
              ]) {
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            inventoryItemId,
            locationId,
            quantity: parseInt(quantity),
          },
        },
        {
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Inventory Updated Successfully!");
    }

    // ✅ Add Product to Collection (Fixed Mutation)
    if (collectionId) {
      console.log("🚀 Adding Product to Collection...");
      await axios.post(
        process.env.SHOPIFY_GRAPHQL_URL,
        {
          query: `
            mutation AddProductToCollection($collectionId: ID!, $productIds: [ID!]!) {
              collectionAddProducts(collectionId: $collectionId, productIds: $productIds) {
                collection {
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
            collectionId,
            productIds: [product.id],
          },
        },
        {
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Product Added to Collection!");
    }

    // ✅ Upload Media Separately to Shopify
    const validMedia = media?.filter((m) => m.url && m.url.startsWith("http")) || [];

    if (validMedia.length > 0) {
      console.log("🚀 Uploading images to Shopify...");
      for (const file of validMedia) {
        try {
          const mediaResponse = await axios.post(
            process.env.SHOPIFY_GRAPHQL_URL,
            {
              query: `
                mutation ProductCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
                  productCreateMedia(productId: $productId, media: $media) {
                    media {
                      id
                      status
                      preview {
                        image {
                          originalSrc
                        }
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
                productId: product.id,
                media: [{ originalSource: file.url, mediaContentType: "IMAGE" }],
              },
            },
            {
              headers: {
                "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
                "Content-Type": "application/json",
              },
            }
          );

          console.log("✅ Shopify Image Upload Response:", mediaResponse.data);
        } catch (mediaError) {
          console.error("❌ Error uploading media:", mediaError.response?.data || mediaError);
        }
      }
    }

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("❌ Error Creating Product:", error.response?.data || error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ✅ Correct Delete Route (Permanent Deletion)
router.delete("/:id", async (req, res) => {
  try {
    const shopifyProductId = req.params.id.startsWith("gid://shopify/Product/")
    ? req.params.id
    : `gid://shopify/Product/${req.params.id}`;
      const shopifyGraphQLUrl = process.env.SHOPIFY_GRAPHQL_URL;

    const mutation = `
      mutation {
        productDelete(input: { id: "${shopifyProductId}" }) {
          deletedProductId
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

    if (data.errors || data.data?.productDelete?.userErrors?.length > 0) {
      console.error("❌ Shopify deletion failed:", data.errors || data.data?.productDelete?.userErrors);
      return res.status(400).json({
        error: "Shopify deletion failed",
        details: data.errors || data.data?.productDelete?.userErrors,
      });
    }
    

    res.json({ success: true, deletedProductId: req.params.id });

  } catch (error) {
    console.error("❌ Error deleting product:", error.response?.data || error.message);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});


export default router;
