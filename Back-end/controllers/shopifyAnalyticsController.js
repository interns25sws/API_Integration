import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const getShopifyAnalytics = async () => {
    try {
        const shopifyUrl = `https://${process.env.SHOPIFY_STORE_NAME}.myshopify.com/admin/api/2023-10/shopifyql/queries.json`;

        const response = await axios.post(
            shopifyUrl,
            {
                query: `
                    {
                        orders(first: 5) {
                            edges {
                                node {
                                    id
                                    totalPriceSet {
                                        shopMoney {
                                            amount
                                            currencyCode
                                        }
                                    }
                                }
                            }
                        }
                    }
                `
            },
            {
                headers: {
                    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Shopify Analytics Data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching Shopify analytics:", error.response?.data || error.message);
    }
};

exportgetShopifyAnalytics();
