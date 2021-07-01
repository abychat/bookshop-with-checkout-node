require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_PUBLISHED_API_KEY);
