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
        //Check if the 'error' handlebar expression has been rendered indicating that the server responded with an error
        const serverError = document.getElementById('server-error')
            ? document.getElementById('server-error').textContent
            : undefined;
        if (
            document.getElementById('card-element') &&
            document.getElementById('payment-request-button') &&
            !serverError
        ) {
            //Control the UI by hiding the Stripe Elements and static messages while they are loaded
            showOptionsMessage(false);
            showPaymentMethods(false);
            //Get the config values from the server and initialize Stripe, as well as the different payment methods
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
//Boolean flag to indicate whether the browser supports the PaymentRequest API
let prSupportedFlag = false;

//Function to display error messages on the checkout page
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

//Function to get client side config variables from the server
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

//Function to control the visibility of the payment methods
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

//Function to show a message that informs users of the availability of multiple payment methods based on the availability of the PaymentRequest API
const showOptionsMessage = (hasMultipleOptions) => {
    if (hasMultipleOptions) {
        document.querySelector('#option-message').classList.remove('hidden');
    } else {
        document.querySelector('#option-message').classList.add('hidden');
    }
};

//Setter for the Payment Request support flag
const setPaymentRequestFlag = (isSupported) => {
    if (isSupported) {
        prSupportedFlag = true;
    } else {
        prSupportedFlag = false;
    }
};

//Function to control UI elements if payment methods and spinners need to be disabled/hidden, especially in the case of errors
const disablePaymentUI = () => {
    showOptionsMessage(false);
    showPaymentMethods(true);
    setPaymentRequestFlag(false);
    toggleElementVisibility(false, 'pr-spinner');
};
