let stripe;
let clientSecret;
let cardElement;
let payIntent;
let elements;
let itemInfo;

const initializeStripe = async (paymentConfig, item, currency) => {
    try {
        stripe = Stripe(paymentConfig.pk);
        elements = stripe.elements();
        itemInfo = await getItemInfo(item);
        await initPayment(item, paymentConfig.country, currency);
    } catch (err) {
        console.error(err);
        displayError(err);
    }
};

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

const completeCardPayment = async (stripe, cardElement) => {
    showSpinner(true);
    const email = document.getElementById('email').value;
    const data = {
        pi: payIntent.id,
        clientSecret,
        email,
    };
    await updatePayIntent(data);

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
                if (result.paymentIntent.status === 'succeeded')
                    window.location.replace(
                        `/success?pi=${result.paymentIntent.id}`
                    );
            }
        })
        .catch((err) => {
            console.error(err);
            throw err;
        });
};

const createPaymentRequest = async (country, currency) => {
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
            prButton.mount('#payment-request-button');
        } else {
            document.getElementById('payment-request-button').style.display =
                'none';
        }
    });

    pr.on('paymentmethod', async function (ev) {
        showPaymentMethods(false);
        const data = {
            pi: payIntent,
            clientSecret,
            email: ev.payerEmail,
        };
        // Confirm the PaymentIntent without handling potential next actions (yet).
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
};

const updatePayIntent = async (data) => {
    fetch('/update-intent', {
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
