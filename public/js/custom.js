/**
 * Clientside helper functions
 */

$(document).ready(async function () {
    let amount;
    const amounts = document.getElementsByClassName('amount');
    // iterate through all "amount" elements and convert from cents to dollars
    for (var i = 0; i < amounts.length; i++) {
        amount = amounts[i].getAttribute('data-amount') / 100;
        amounts[i].innerHTML = amount.toFixed(2);
    }
    if (
        document.getElementById('card-element') &&
        document.getElementById('payment-request-button')
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
                displayError(err);
            });
    }
});

const showSpinner = function (isLoading) {
    if (isLoading) {
        // Disable the button and show a spinner
        document.querySelector('#pay-button').disabled = true;
        document.querySelector('.spinner-border').classList.remove('hidden');
        document.querySelector('#button-text').classList.add('hidden');
    } else {
        document.querySelector('button').disabled = false;
        document.querySelector('.spinner-border').classList.add('hidden');
        document.querySelector('#button-text').classList.remove('hidden');
    }
};

const displayError = function (error) {
    showSpinner(false);
    const errorMsg = document.querySelector('#card-error');
    errorMsg.textContent = error.message ? error.message : error;
    setTimeout(function () {
        errorMsg.textContent = '';
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
    const nodes = document.querySelectorAll('.spinner-grow');
    if (!hasLoaded) {
        nodes.forEach((node) => {
            node.classList.remove('hidden');
        });
        document.querySelector('#payment-form').classList.add('hidden');
        document
            .querySelector('#payment-request-button')
            .classList.add('hidden');
    } else {
        nodes.forEach((node) => {
            node.classList.add('hidden');
        });
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
