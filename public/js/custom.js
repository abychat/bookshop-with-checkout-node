/**
 * Clientside helper functions
 */

$(document).ready(function () {
    let amount;
    const amounts = document.getElementsByClassName('amount');
    // iterate through all "amount" elements and convert from cents to dollars
    for (var i = 0; i < amounts.length; i++) {
        amount = amounts[i].getAttribute('data-amount') / 100;
        amounts[i].innerHTML = amount.toFixed(2);
    }
    if (document.getElementById('card-element')) {
        const cardElement = document.querySelector('#card-element');
        initializeStripe(cardElement.dataset.pk, cardElement.dataset.item);
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
    errorMsg.textContent = error;
    setTimeout(function () {
        errorMsg.textContent = '';
    }, 4000);
};
