let stripe;
let clientSecret;
let cardElement;
let payIntent;
const initializeStripe = (pk, item) => {
    stripe = Stripe(pk);
    initPayment(item);
};

const createCardElement = async () => {
    try {
        const elements = stripe.elements();
        cardElement = elements.create('card');
        await cardElement.mount('#card-element');
        cardElement.on('change', (e) => {
            // Disable the Pay button if there are no card details in the Element
            document.getElementById('pay-button').disabled = e.empty;
            document.querySelector('#card-error').textContent = e.error
                ? e.error.message
                : '';
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const togglePaymentButton = (isDisabled) => {
    const payButton = document.getElementById('pay-button');
    if (isDisabled) {
        payButton.setAttribute('disabled', 'disabled');
    } else {
        payButton.removeAttribute('disabled');
    }
};

const initPayment = (item) => {
    const data = { item };
    fetch('/init-payment', {
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
            createCardElement();
            const form = document.getElementById('payment-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                payIntent = data.pi;
                completeCardPayment(stripe, cardElement, payIntent);
            });
        })
        .catch((err) => {
            console.error(err);
            throw err;
        });
};

const completeCardPayment = async (stripe, cardElement, pi) => {
    showSpinner(true);
    const email = document.getElementById('email').value;
    const data = {
        pi: pi.id,
        clientSecret: pi.client_secret,
        email,
    };
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
            stripe
                .confirmCardPayment(data.clientSecret, {
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
                });
        })
        .catch((err) => {
            console.error(err);
            throw err;
        });
};
