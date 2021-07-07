require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const exphbs = require('express-handlebars');

//Get all the config values from the .env file
const {
    STRIPE_PUBLISHED_API_KEY,
    STRIPE_SECRET_API_KEY,
    STRIPE_ACCOUNT_COUNTRY,
    SUPPORTED_CURRENCIES,
    DEFAULT_CURRENCY,
    PORT,
} = process.env;

//Client side config details to be returned via the API
const config = {
    pk: STRIPE_PUBLISHED_API_KEY,
    country: STRIPE_ACCOUNT_COUNTRY,
    defaultCurrency: DEFAULT_CURRENCY,
    supportedCurrencies: SUPPORTED_CURRENCIES.split(','),
};

const stripe = require('stripe')(STRIPE_SECRET_API_KEY);

const app = express();

const jsonParser = bodyParser.json();

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

//Config route to return client side config
app.get('/payment/config', function (req, res) {
    res.json(config);
});

/**
 * Checkout route
 */
app.get('/checkout', function (req, res) {
    const item = req.query.item;
    //Future-proofing for multi currency support
    let currency = req.query.curr;
    if (
        !currency ||
        (currency && config.supportedCurrencies.indexOf(currency) === -1)
    ) {
        currency = config.defaultCurrency;
    }

    if (inventory.size < 3) {
        initInventory();
    }
    const book = inventory.get(item);
    if (book) {
        res.render('checkout', {
            title: book.title,
            amount: book.amount,
            itemId: item,
            currency,
        });
    } else {
        console.error(`Invalid Book Id ${item} supplied`);
        res.render('checkout', {
            title: 'Unknown book',
            amount: 0,
            itemId: item,
            error: 'Invalid book selected',
            currency,
        });
    }
});

//Route to create and return a new payment intent
app.post('/init-payment', jsonParser, async function (req, res, next) {
    try {
        let { item, currency } = req.body;
        if (item) {
            if (inventory.get(item).amount) {
                if (!currency) {
                    currency = DEFAULT_CURRENCY;
                }
                //Get the price of the item from the server and not the request so the right price is charged even if the request is tampered
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
        res.status(500).json(JSON.stringify(err));
    }
});

/**
 * Route to update an existing payment intent with the email supplied in the checkout form
 * and deliver an email receipt to the email supplied
 */
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
    } catch (err) {
        console.error(err);
        res.status(500).json(JSON.stringify(err));
    }
});

/**
 * Route to get details of a specific item
 */
app.get('/item/:itemNumber', function (req, res) {
    if (inventory.size < 3) {
        initInventory();
    }
    const book = inventory.get(req.params.itemNumber);
    if (book) {
        res.send(book);
    } else {
        const error = new Error('Invalid book item id supplied');
        res.status(500).json(error.message);
    }
});

/**
 * Route for showing the success page.
 */
app.get('/success', async function (req, res) {
    try {
        const pi = req.query.pi;

        //Get a list of all the charges for the paymentIntent supplied in the request
        const charges = await stripe.charges.list({ payment_intent: pi });
        let charge;
        //Look for the successful charge. In this case we are expecting only one successful charge.
        if (charges.data && charges.data.length > 0) {
            for (ch of charges.data) {
                if (ch.status === 'succeeded') {
                    charge = ch;
                    break;
                }
            }
            let chargeAmount = charge.amount_captured / 100;

            /**
             * Render the success page with the charge id, email and receipt URL.
             * Depending on the paymentMethod - card | paymentRequest, the user's email
             * is retrieved either from the payment intent's metadata or billing details
             */
            res.render('success', {
                amount: chargeAmount,
                email: charge.metadata.receipt_email
                    ? charge.metadata.receipt_email
                    : charge.billing_details.email,
                chargeId: charge.id,
                receiptUrl: charge.receipt_url,
            });
        } else {
            res.render('success', {
                error: 'Invalid payment information',
            });
        }
    } catch (error) {
        console.error(err);
        res.status(500).json(JSON.stringify(err));
    }
});

/**
 * Start server
 */
app.listen(PORT, () => {
    console.log('Getting served on port ' + PORT);
});
