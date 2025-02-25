import express from 'express';
import crypto from 'crypto';
import bodyParser from 'body-parser';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';

const router = express.Router();

// Middleware to verify Shopify webhook signature
const verifyShopifyWebhook = (req, res, next) => {
    const hmac = req.headers['x-shopify-hmac-sha256'];
    console.log("Received HMAC:", hmac); 
    const secret = process.env.SHOPIFY_API_SECRET;
    const body = JSON.stringify(req.body);
    const hash = crypto.createHmac('sha256', secret).update(body).digest('base64');

    if (hash !== hmac) {
        return res.status(401).send('Unauthorized - Invalid Webhook Signature');
    }
    next();
};

// Middleware to parse JSON
router.use(bodyParser.json());

// ✅ Handle Order Created Webhook
router.post('/webhook/orders/create', verifyShopifyWebhook, async (req, res) => {
    try {
        const orderData = req.body;

        // Save order to MongoDB
        const newOrder = new Order(orderData);
        await newOrder.save();

        console.log('🛒 New Order Received:', orderData.id);
        res.status(200).send('Order saved');
    } catch (error) {
        console.error('❌ Error saving order:', error);
        res.status(500).send('Error saving order');
    }
});

// ✅ Handle Customer Created Webhook
router.post('/webhook/customers/create', verifyShopifyWebhook, async (req, res) => {
    try {
        const customerData = req.body;

        // Save customer to MongoDB
        const newCustomer = new Customer(customerData);
        await newCustomer.save();

        console.log('👤 New Customer Received:', customerData.id);
        res.status(200).send('Customer saved');
    } catch (error) {
        console.error('❌ Error saving customer:', error);
        res.status(500).send('Error saving customer');
    }
});

// ✅ Handle Product Created Webhook
router.post('/webhook/products/create', verifyShopifyWebhook, async (req, res) => {
    try {
        const productData = req.body;

        // Save product to MongoDB
        const newProduct = new Product(productData);
        await newProduct.save();

        console.log('📦 New Product Received:', productData.id);
        res.status(200).send('Product saved');
    } catch (error) {
        console.error('❌ Error saving product:', error);
        res.status(500).send('Error saving product');
    }
});

export default router;
