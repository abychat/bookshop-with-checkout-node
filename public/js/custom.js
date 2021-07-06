/**
 * Clientside helper functions
 */
const toggleElementVisibility = (isVisible, elementName) => {
    if (isVisible) {
        document.getElementById(elementName).classList.remove('hidden');
    } else {
        document.getElementById(elementName).classList.add('hidden');
    }
};
$(document).ready(async function () {
    let amount;
    try {
        const amounts = document.getElementsByClassName('amount');
        // iterate through all "amount" elements and convert from cents to dollars
        for (var i = 0; i < amounts.length; i++) {
            amount = amounts[i].getAttribute('data-amount') / 100;
            amounts[i].innerHTML = amount.toFixed(2);
        }
        const serverError = document.getElementById('server-error')
            ? document.getElementById('server-error').textContent
            : undefined;
        if (
            document.getElementById('card-element') &&
            document.getElementById('payment-request-button') &&
            !serverError
        ) {
            showOptionsMessage(false);
            showPaymentMethods(false);
            getPaymentConfig()
                .then((paymentConfig) => {
                    const cardElement = document.querySelector('#card-element');
                    const prButtonElement = document.querySelector(
                        '#payment-request-button'
                    );
                    initializeStripe(
                        paymentConfig,
                        cardElement.dataset.item,
                        prButtonElement.dataset.curr
                    );
                })
                .catch((err) => {
                    console.error(err);
                    displayError(
                        'Error initializing payment methods. Please try again.'
                    );
                    disablePaymentUI();
                });
        } else {
            disablePaymentUI();
        }
    } catch (error) {
        console.error(error);
        displayError('Error initializing payment methods. Please try again.');
        disablePaymentUI();
    }
});

let prSupportedFlag = false;

const displayError = function (error) {
    showPaymentMethods(true);
    const errorMsg = document.querySelector('#card-error');
    errorMsg.classList.add('alert', 'alert-danger', 'mt-20');
    errorMsg.textContent = error.message ? error.message : error;
    setTimeout(function () {
        errorMsg.textContent = '';
        errorMsg.classList.remove('alert', 'alert-danger', 'mt-20');
    }, 4000);
};

const getPaymentConfig = async () => {
    let paymentConfig;
    await fetch(`/payment/config`, {
        method: 'GET',
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            paymentConfig = data;
        })
        .catch((err) => {
            console.error(err);
            throw err;
        });
    return paymentConfig;
};

const showPaymentMethods = (hasLoaded) => {
    if (!hasLoaded) {
        if (prSupportedFlag) {
            toggleElementVisibility(true, 'pr-spinner');
        }
        toggleElementVisibility(true, 'pc-spinner');
        document.querySelector('#payment-form').classList.add('hidden');
        document
            .querySelector('#payment-request-button')
            .classList.add('hidden');
    } else {
        if (prSupportedFlag) {
            toggleElementVisibility(false, 'pr-spinner');
        }
        toggleElementVisibility(false, 'pc-spinner');
        document
            .querySelector('#payment-request-button')
            .classList.remove('hidden');
        document.querySelector('#payment-form').classList.remove('hidden');
    }
};

const showOptionsMessage = (hasMultipleOptions) => {
    if (hasMultipleOptions) {
        document.querySelector('#option-message').classList.remove('hidden');
    } else {
        document.querySelector('#option-message').classList.add('hidden');
    }
};

const setPaymentRequestFlag = (isSupported) => {
    if (isSupported) {
        prSupportedFlag = true;
    } else {
        prSupportedFlag = false;
    }
};

const disablePaymentUI = () => {
    showOptionsMessage(false);
    showPaymentMethods(true);
    setPaymentRequestFlag(false);
    toggleElementVisibility(false, 'pr-spinner');
};
