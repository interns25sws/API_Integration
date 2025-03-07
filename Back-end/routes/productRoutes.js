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
  const { id } = req.params; // Correct extraction
  const { title, description } = req.body;

  const shopifyProductId = `gid://shopify/Product/${id}`;

  console.log("🔄 Updating Product:", shopifyProductId);
  console.log("📌 Received Data:", { title, description });

  try {
    const response = await axios.post(
      SHOPIFY_GRAPHQL_URL,
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
        variables: { id: shopifyProductId, title, descriptionHtml: description },
      },
      { headers }
    );

    console.log("✅ Shopify Response:", response.data);

    const { productUpdate } = response.data.data;
    if (productUpdate.userErrors.length > 0) {
      console.error("❌ Shopify Errors:", productUpdate.userErrors);
      return res.status(400).json({ success: false, errors: productUpdate.userErrors });
    }

    res.json({ success: true, updatedProduct: productUpdate.product });
  } catch (error) {
    console.error("❌ Error updating product:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// ✅ Update Product Variant Price (Separate Mutation)
router.put("/variant/:variantId", async (req, res) => {
  const { variantId } = req.params;
  const { price } = req.body;

  const shopifyVariantId = `gid://shopify/ProductVariant/${variantId}`;

  console.log("🔄 Updating Variant Price:", shopifyVariantId, "New Price:", price);

  try {
    const response = await axios.post(
      SHOPIFY_GRAPHQL_URL,
      {
        query: `
          mutation UpdateVariant($id: ID!, $price: String) {
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
        variables: { id: shopifyVariantId, price: price.toString() },
      },
      { headers }
    );

    console.log("✅ Shopify Response:", response.data);

    const { productVariantUpdate } = response.data.data;
    if (productVariantUpdate.userErrors.length > 0) {
      console.error("❌ Shopify Errors:", productVariantUpdate.userErrors);
      return res.status(400).json({ success: false, errors: productVariantUpdate.userErrors });
    }

    res.json({ success: true, updatedVariant: productVariantUpdate.productVariant });
  } catch (error) {
    console.error("❌ Error updating variant:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to update product variant" });
  }
});

// ✅ Create Product
router.post("/", async (req, res) => {
  try {
    const { title, description, variants, media } = req.body;
    console.log("🔹 Received product data:", req.body);

    // ✅ Fix Price Formatting
    const formattedVariants = variants.map((v) => {
      const price = isNaN(parseFloat(v.price)) ? "0.00" : parseFloat(v.price).toFixed(2);
      const compareAtPrice = isNaN(parseFloat(v.compareAtPrice)) ? undefined : parseFloat(v.compareAtPrice).toFixed(2);

      return {
        title: v.name || "Default Variant",
        price,
        compareAtPrice, // ✅ Fix key name for Shopify
      };
    });

    // ✅ Shopify GraphQL Mutation for Product Creation
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
                      title
                      price
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

    // Handle Shopify Errors
    if (!responseData.data || responseData.data.productCreate.userErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Shopify error",
        errors: responseData.data?.productCreate?.userErrors || [],
      });
    }

    const product = responseData.data.productCreate.product;

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
