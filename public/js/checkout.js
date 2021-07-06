let stripe;
let clientSecret;
let cardElement;
let payIntent;
let elements;
let itemInfo;

/**
 * This function initializes Stripe,
 * gets the info for the item so as to not depend on client side values and
 * initializes and mounts the Stripe Elements for card and payment request button
 * @param {Object} paymentConfig - Client side config variables
 * @param {String} item - The numerical id of the item being checked out
 * @param {String} currency - The currency of the payment
 */
const initializeStripe = async (paymentConfig, item, currency) => {
    try {
        stripe = Stripe(paymentConfig.pk);
        elements = stripe.elements();
        itemInfo = await getItemInfo(item);
        await initPayment(item, paymentConfig.country, currency);
    } catch (err) {
        console.error(err);
        disablePaymentUI();
        displayError(
            'There was an error with the Checkout process. Please try again.'
        );
    }
};

/**
 * Function to get the information about a book from the server
 * @param {String} item - The numerical id of the item being checked out
 */
const getItemInfo = async (item) => {
    fetch(`/item/${item}`, {
        method: 'GET',
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            itemInfo = data;
        })
        .catch((err) => {
            console.error(err);
            throw err;
        });
};

/**
 * Function to request a new PaymentIntent from the server
 * @param {String} item - The numerical id of the item being checked out
 * @param {String} country - Stripe account country
 * @param {String} currency - The currency of the payment
 */
const initPayment = async (item, country, currency) => {
    const data = { item };
    await fetch('/init-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            return response.json();
        })
        .then(async (data) => {
            //If the request is successful, create the payment request button and the card element
            payIntent = data.pi;
            clientSecret = data.pi.client_secret;
            await createPaymentRequest(country, currency);
            await createCardElement();
            showPaymentMethods(true);
        })
        .catch((err) => {
            console.error(err);
            throw err;
        });
};

/**
 * Function to create and mount the card Stripe Element
 */
const createCardElement = async () => {
    try {
        cardElement = elements.create('card');
        await cardElement.mount('#card-element');
        cardElement.on('change', (e) => {
            // Disable the Pay button if there are no card details in the Element
            document.getElementById('pay-button').disabled = e.empty;
            document.querySelector('#card-error').textContent = e.error
                ? e.error.message
                : '';
        });
        const form = document.getElementById('payment-form');

        //Attach a listener to the form that completes the card payment when the user clicks the Pay button
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            showPaymentMethods(false);
            completeCardPayment(stripe, cardElement);
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Function to complete the card payment and update email details
 * in the PaymentIntent when a user uses a card to pay
 * @param {Object} - Stripe client
 * @param {Object} - Instance of the card element
 */

const completeCardPayment = async (stripe, cardElement) => {
    try {
        const email = document.getElementById('email').value;
        const data = {
            pi: payIntent.id,
            clientSecret,
            email,
        };
        //Update the PaymentIntent to reflect the user's email
        await updatePayIntent(data);

        //Confirm the card payment
        stripe
            .confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            })
            .then((result) => {
                if (result.error) {
                    displayError(result.error.message);
                } else {
                    //Redirect to the Success page if the payment succeeded
                    if (result.paymentIntent.status === 'succeeded') {
                        window.location.replace(
                            `/success?pi=${result.paymentIntent.id}`
                        );
                    }
                }
            })
            .catch((err) => {
                console.error(err.message);
                throw err;
            });
    } catch (error) {
        console.error(error.message);
        displayError(
            'There was an error processing your payment. Please try again.'
        );
        showPaymentMethods(true);
    }
};

/**
 * Function to create and mount the PaymentRequest button if the browser
 * supports the Payment Request API
 * @param {String} country - Stripe account country
 * @param {String} currency - Three letter currency code
 */
const createPaymentRequest = async (country, currency) => {
    try {
        const pr = stripe.paymentRequest({
            country,
            currency,
            total: {
                label: 'Total Amount',
                amount: itemInfo.amount,
            },
            requestPayerName: true,
            requestPayerEmail: true,
        });
        const prButton = elements.create('paymentRequestButton', {
            paymentRequest: pr,
        });

        // Check the availability of the Payment Request API first.
        await pr.canMakePayment().then(function (result) {
            if (result) {
                setPaymentRequestFlag(true);
                prButton.mount('#payment-request-button');
                showOptionsMessage(true);
            } else {
                showOptionsMessage(false);
                setPaymentRequestFlag(false);
                toggleElementVisibility(true, 'pr-support-message');
                toggleElementVisibility(false, 'pr-spinner');
                document.getElementById(
                    'payment-request-button'
                ).style.display = 'none';
            }
        });
        //Confirm the card payments and hide the buttons when a user submits a payment
        pr.on('paymentmethod', async function (ev) {
            showPaymentMethods(false);
            const data = {
                pi: payIntent,
                clientSecret,
                email: ev.payerEmail,
            };
            const response = await stripe.confirmCardPayment(
                clientSecret,
                { payment_method: ev.paymentMethod.id },
                { handleActions: false }
            );
            if (response.error) {
                // Report to the browser that the payment failed.
                ev.complete('fail');
                displayError(
                    'Error processing payment' +
                        '\n Please try another payment method'
                );
            } else {
                if (response.paymentIntent.status === 'succeeded') {
                    // Report to the browser that the confirmation was successful, prompting
                    // it to close the browser payment method collection interface.
                    ev.complete('success');
                    //Redirect the user to the Success page
                    window.location.replace(
                        `/success?pi=${response.paymentIntent.id}`
                    );
                } else {
                    displayError(
                        'There was a problem processing your payment. Please try another payment method.'
                    );
                }
            }
        });
    } catch (error) {
        console.error(error.message);
        throw error;
    }
};

/**
 * Update the PaymentIntent
 * @param {Object} data - Data to update the PaymentIntent which include the PaymentIntent id, client secret and details to be updated
 */
const updatePayIntent = async (data) => {
    await fetch('/update-intent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            clientSecret = data.clientSecret;
        })
        .catch((err) => {
            console.error(err);
            throw err;
        });
};
