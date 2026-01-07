require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('./models/Order');

if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('replace')) {
    console.error('CRITICAL: STRIPE_SECRET_KEY is missing or invalid in server/.env');
} else {
    console.log('Stripe Secret Key loaded');
}

const app = express();

// Middleware
app.use(cors());
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => console.log(' Connected to MongoDB Atlas'))
    .catch(err => {
        console.error(' MongoDB connection error:', err.message);
        console.log('Server will continue to run without DB connection...');
    });

// Keep process alive even if event loop is nearly empty
setInterval(() => { }, 60000);

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
});

// Routes
app.post('/api/checkout/create-session', async (req, res) => {
    console.log('Received checkout request:', req.body);
    try {
        const { items, email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create line items for Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: [item.image],
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents
            },
            quantity: item.quantity,
        }));

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            customer_email: email,
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
           cancel_url: `${process.env.FRONTEND_URL}/cancel?session_id={CHECKOUT_SESSION_ID}`,

        });

        // Save order to database as pending (Non-blocking)
        try {
            const newOrder = new Order({
    customerEmail: email,
    items,
    totalAmount,
    stripeSessionId: session.id,
 
    status: 'pending'
});

            await newOrder.save();
            console.log('Order saved to DB');
        } catch (dbError) {
            console.error('Database save failed, but proceeding with checkout:', dbError.message);
        }

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe session creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Verify payment status
  app.get('/api/checkout/verify/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            await Order.findOneAndUpdate(
                { stripeSessionId: sessionId },
                { status: 'completed' }
            );
            return res.json({ status: 'success' });
        } else {
            await Order.findOneAndUpdate(
                { stripeSessionId: sessionId },
                { status: 'failed' }
            );
            return res.json({ status: 'failed' });
        }
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: error.message });
    }
});


// Mark order as cancelled
app.get('/api/checkout/cancel/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        await Order.findOneAndUpdate(
            { stripeSessionId: sessionId },
            { status: 'cancelled' }
        );

        return res.json({ status: 'cancelled' });
    } catch (error) {
        console.error('Cancel update error:', error);
        res.status(500).json({ error: error.message });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(` Server is definitely running on http://0.0.0.0:${PORT}`);
    console.log(` Stripe Checkout endpoint: http://127.0.0.1:${PORT}/api/checkout/create-session`);
});
