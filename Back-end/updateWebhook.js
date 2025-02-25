import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const SHOPIFY_SHOP = process.env.SHOPIFY_STORE_NAME;
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = "2024-01"; // Ensure API version is correct

// ✅ Function to get the active Ngrok URL
async function getNgrokUrl() {
  try {
    const response = await fetch("http://localhost:4040/api/tunnels");
    const data = await response.json();

    const tunnel = data.tunnels.find(tunnel => tunnel.proto === "https");
    if (!tunnel) throw new Error("No active Ngrok tunnel found!");

    console.log("🔗 Ngrok URL:", tunnel.public_url);
    return tunnel.public_url;
  } catch (error) {
    console.error("🚨 Failed to fetch Ngrok URL:", error.message);
    process.exit(1);
  }
}

// ✅ Function to register a webhook
async function registerWebhook(topic, path) {
  const ngrokUrl = await getNgrokUrl();
  const webhookUrl = `${ngrokUrl}${path}`;

  const query = {
    query: `
      mutation {
        webhookSubscriptionCreate(
          topic: ${topic},
          webhookSubscription: { callbackUrl: "${webhookUrl}", format: JSON }
        ) {
          userErrors { field message }
          webhookSubscription { id }
        }
      }
    `,
  };

  try {
    const response = await fetch(
      `https://${SHOPIFY_SHOP}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ACCESS_TOKEN,
        },
        body: JSON.stringify(query),
      }
    );

    const result = await response.json();

    console.log(`🔍 Full API response for ${topic}:`, JSON.stringify(result, null, 2));

    if (!result.data || !result.data.webhookSubscriptionCreate) {
      console.error(`⚠ Unexpected API response for ${topic}:`, result);
      return;
    }

    if (result.data.webhookSubscriptionCreate.userErrors.length > 0) {
      console.error(`❌ Error registering ${topic} webhook:`, result.data.webhookSubscriptionCreate.userErrors);
    } else {
      console.log(`✅ Webhook for ${topic} registered successfully!`);
    }
  } catch (error) {
    console.error(`🚨 Failed to register webhook for ${topic}:`, error.message);
  }
}

// ✅ Function to set up multiple webhooks
async function setupWebhooks() {
  console.log("🚀 Registering Shopify webhooks...");

  await registerWebhook("ORDERS_CREATE", "/webhooks/orders/create");
  await registerWebhook("ORDERS_EDITED", "/webhooks/orders/edited"); 
  await registerWebhook("ORDERS_DELETE", "/webhooks/orders/delete");

  await registerWebhook("CUSTOMERS_CREATE", "/webhooks/customers/create");
  await registerWebhook("CUSTOMERS_UPDATE", "/webhooks/customers/update");
  await registerWebhook("CUSTOMERS_DELETE", "/webhooks/customers/delete");

  await registerWebhook("PRODUCTS_CREATE", "/webhooks/products/create");
  await registerWebhook("PRODUCTS_UPDATE", "/webhooks/products/update");
  await registerWebhook("PRODUCTS_DELETE", "/webhooks/products/delete");

  console.log("🎉 All webhooks are set up!");
}

// ✅ Run the setup function
setupWebhooks();
