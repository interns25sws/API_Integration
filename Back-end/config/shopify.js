require('dotenv').config();
const Shopify = require('shopify-api-node');

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_STORE_NAME,
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN
});

module.exports = shopify;
