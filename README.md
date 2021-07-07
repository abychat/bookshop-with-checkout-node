# Using Stripe for a seamless checkout experience

## Overview

This is a node.js app that uses express.js, handlebars.js and Stripe Elements to host a fictitious bookshop website. Users visiting the bookshop can browse all available books and checkout using a credit card or by using Apple Pay, Google Pay or Microsoft Pay depending on the browser they are using.

A live version of the site in test mode is deployed at - https://ac-bookshop-w-checkout.herokuapp.com/

The following sections on this page list the options for deploying and using the app. Checkout the Github generated table of contents in the header of this README file to quickly navigate to different sections of the document.

![image](https://user-images.githubusercontent.com/7586106/124688183-33741c80-de8b-11eb-8d36-ec33ef93ea96.png)

## Running the App

### Prerequisites

-   A modern browser like Chrome, Microsoft Edge, Firefox or Safari
-   A [free Stripe account](https://dashboard.stripe.com/register) to be able to process payments
-   [Node.js >=10.0.0](https://nodejs.org/en/download/) and [Git](https://git-scm.com/downloads) for running the app locally
-   The PaymentRequest Stripe Element requires that the application be served over https both in development and production.
    -   You can install and use [ngrok](https://dashboard.ngrok.com/signup) for enabling a secure connection to your local server.
    -   Apple Pay requires the [verification and registration of your domain](https://stripe.com/docs/stripe-js/elements/payment-request-button#verifying-your-domain-with-apple-pay).
        -   You can create a free account and easily deploy your app to [Heroku](https://signup.heroku.com/) to get a dedicated secure domain.
        -   Alternatively, ngrok offers a paid version which will allow you to have to a dedicated secure domain that can be verified and registered to test the Apple Pay integration during development.

### OPTION 1 - Deploy the App to Heroku

1. Click on the following button to deploy the app to Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/abychat/bookshop-with-checkout-node)

2. Supply an app name for your demo app, your test API keys, the remaining config variables and click on 'Deploy'.

![image](https://user-images.githubusercontent.com/7586106/124684702-96ae8080-de84-11eb-8061-b8b9c34a77db.png)

3. Once the app is deployed, navigate to https://[app-name].herokuapp.com to verify that the app is up and running. You should see the following screen -

![image](https://user-images.githubusercontent.com/7586106/124688613-eb092e80-de8b-11eb-9eca-f4253979507b.png)

4. If you want to test Apple Pay on Safari, [verify and register your domain](https://stripe.com/docs/stripe-js/elements/payment-request-button#verifying-your-domain-with-apple-pay). Since this is a demo app, you can skip step #2 (Download Verification File) on the screen that appears when you click 'Add a new domain' on the [Apple Pay tab](https://dashboard.stripe.com/settings/payments/apple_pay) of your Stripe Dashboard.

### OPTION 2 - Running the App Locally

The following steps will guide you through the setup of this app on your local machine

1. Clone this repository using the following command on the terminal of your choice

```
git clone https://github.com/abychat/bookshop-with-checkout-node.git
```

2. Change to the project directory

```
cd bookshop-with-checkout-node
```

3. Install all project dependencies by executing

```
npm install
```

4. Create a copy of the .env.example file and supply all the required test API keys as well as other configuration parameters. The .env file is included in the .gitignore file and is not pushed to your repository.

```
cp .env.example .env
```

5. Start the application by executing

```
npm start
```

6. If you have installed ngrok and want to access the app via a secure url, open a new terminal or command prompt window and run ngrok command in the format
   [location of ngrok install]/ngrok [PORT specified in .env]. The secure 'Forwarding URL' in the output can be used to access the app over a secure url.

```
***Example command***:  ./ngrok 3000

***Example Output***:
ngrok by @inconshreveable

Tunnel Status                 online
Version                       2.0/2.0
Web Interface                 http://127.0.0.1:3000
Forwarding                    http://92832de0.ngrok.io -> localhost:80
Forwarding                    https://92832de0.ngrok.io -> localhost:80

Connections                  ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

7. If you want to test Apple Pay on Safari, [verify and register your domain](https://stripe.com/docs/stripe-js/elements/payment-request-button#verifying-your-domain-with-apple-pay). Since this is a demo app, you can skip step #2 (Download Verification File) on the screen that appears when you click 'Add a new domain' on the [Apple Pay tab](https://dashboard.stripe.com/settings/payments/apple_pay) of your Stripe Dashboard.

8. Navigate to http://localhost: <PORT> (port specified in .env) or the ngrok secure URL on your browser to verify that the application is up and running.

## Solution Description
The goal of creating the app was to use Stripe Elements to enable a checkout and confirmation experience for a ficititious e-commerce book store. The app uses the [Card](https://stripe.com/docs/stripe-js#card-elementhttps://stripe.com/docs/stripe-js#card-element) and [Payment Request Button](https://stripe.com/docs/stripe-js#payment-request-button-element) Stripe Elements to enable card payments as well as the ability to use digital wallet services like Apple Pay on Safari, Google Pay on Chrome or browser-saved cards using Microsoft Pay on Edge. The Payment Request Button Stripe Element uses the [Payment Request Web API](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API) and the checkout page indicates if your browser doesn't support the API (eg. Firefox) or if you don't have any saved cards for use with Microsoft Pay.

The app use the [Stripe node.js library](https://www.npmjs.com/package/stripe) on the server side and Stripe.js library hosted by Stripe on the client side. When the user selects a book and clicks 'Purchase', they are redirected to the checkout page. At this point the app creates a new PaymentIntent on the server side using the ``stripe.paymentIntents.create`` library function and supplies this PaymentIntent to client side js functions. The client side js functions uses Stripe.js to create and mount the Card as well as Payment Request Button Stripe Elements (based on browser support or saved card availability) using the ``elements.create`` and ``element.mount`` functions. 

![image](https://user-images.githubusercontent.com/7586106/124686499-19850a80-de88-11eb-8dd6-aea89270231b.png)
![image](https://user-images.githubusercontent.com/7586106/124686506-1be76480-de88-11eb-9b82-13ba98058a84.png)
![image](https://user-images.githubusercontent.com/7586106/124686514-1ee25500-de88-11eb-8867-1b809db74e13.png)
![image](https://user-images.githubusercontent.com/7586106/124686519-230e7280-de88-11eb-984f-4d0ae8e44d15.png)

DISCLAIMER - This is a learning/demo app and has been tested with [Stripe test data](https://stripe.com/docs/testing#cards) on Google Chrome, Safari, Microsoft Edge and Firefox. Do not deploy this app for use as a live site without a detailed code review and comprehensive testing.

## Solution Approach and Experience Integrating Stripe

## If this were a Production App
