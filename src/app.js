require('dotenv').config();
const { STRIPE_PUBLISHED_API_KEY, STRIPE_SECRET_API_KEY } = process.env;
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const exphbs = require('express-handlebars');
const { reset } = require('nodemon');
const stripe = require('stripe')(STRIPE_SECRET_API_KEY);

const app = express();

const jsonParser = bodyParser.json();

const CURRENCIES = { USD: 'usd', AUD: 'aud', CAD: 'cad', DEFAULT: 'usd' };

const inventory = new Map();

/**
 * Function to initialize the inventory map with hardcoded entries.
 * This will be useful to fetch the prices server side using a unique key
 * and avoid the risk of end users modifying prices on the client
 */
const initInventory = () => {
    inventory.set('1', {
        title: 'The Art of Doing Science and Engineering',
        amount: 2300,
    });
    inventory.set('2', {
        title: 'The Making of Prince of Persia: Journals 1985-1993',
        amount: 2500,
    });
    inventory.set('3', {
        title: 'Working in Public: The Making and Maintenance of Open Source',
        amount: 2800,
    });
};

// view engine setup (Handlebars)
app.engine(
    'hbs',
    exphbs({
        defaultLayout: 'main',
        extname: '.hbs',
    })
);
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, './../public')));

/**
 * Home route
 */
app.get('/', function (req, res) {
    res.render('index');
});

/**
 * Checkout route
 */
app.get('/checkout', function (req, res) {
    const item = req.query.item;
    let title, amount, error;
    if (inventory.size < 3) {
        initInventory();
    }
    const book = inventory.get(item);
    /**
     * Sending the Published API key as an expression to the checkout template
     * which in turn adds it to the card element as a data attribute so any JS function can access it
     * without the need to hard code the API key in templates and for easier updates
     **/
    res.render('checkout', {
        title: book.title,
        amount: book.amount,
        itemId: item,
        publishedKey: STRIPE_PUBLISHED_API_KEY,
        error: error,
    });
});
app.post('/init-payment', jsonParser, async function (req, res, next) {
    try {
        let { item, currency } = req.body;
        if (item) {
            if (inventory.get(item).amount) {
                if (!currency) {
                    currency = CURRENCIES.DEFAULT;
                }
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: inventory.get(item).amount,
                    currency,
                });
                res.send({ pi: paymentIntent });
            } else {
                throw new Error('Invalid amount or item');
            }
        } else {
            throw new Error('Invalid request');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

app.post('/update-intent', jsonParser, async function (req, res, next) {
    try {
        let { pi, clientSecret, email } = req.body;
        if (pi && email) {
            const paymentIntent = await stripe.paymentIntents.update(pi, {
                metadata: { receipt_email: email },
            });
            res.send({ clientSecret: paymentIntent.client_secret });
        } else {
            res.send({ clientSecret });
        }
    } catch (error) {
        console.error(err);
        next(err);
    }
});

app.get('/success', async function (req, res) {
    const pi = req.query.pi;
    const charges = await stripe.charges.list({ payment_intent: pi });
    let charge;
    if (charges.data && charges.data.length > 0) {
        for (ch of charges.data) {
            if (ch.status === 'succeeded') {
                charge = ch;
                break;
            }
        }
        let chargeAmount = charge.amount_captured / 100;
        res.render('success', {
            amount: chargeAmount,
            email: charge.metadata.receipt_email,
            chargeId: charge.id,
            receiptUrl: charge.receipt_url,
        });
    } else {
        res.render('success', {
            error: 'Invalid payment information',
        });
    }
});

/**
 * Start server
 */
app.listen(3000, () => {
    console.log('Getting served on port 3000');
});
