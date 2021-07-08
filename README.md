# Using Stripe for a seamless checkout experience

## Overview

This is a node.js app that uses express.js, handlebars.js and Stripe Elements to host a fictitious ecommerce bookstore. Users visiting the bookshop can browse all available books and checkout using a credit card or by using Apple Pay, Google Pay or Microsoft Pay depending on the browser they are using.

A live version of the site in test mode is deployed at - https://ac-bookshop-w-checkout.herokuapp.com/

Please use [Stripe test data](https://stripe.com/docs/testing#cards) to experience the checkout process. The app has been tested for US based card payments.

The following sections on this page list the options for deploying and using the app as well as my experience integrating Stripe. Checkout the handy Github generated table of contents in the header of this README file to quickly navigate to different sections of the document.

![image](https://user-images.githubusercontent.com/7586106/124688183-33741c80-de8b-11eb-8d36-ec33ef93ea96.png)

## Running the App

### Prerequisites

-   A modern browser like Chrome, Microsoft Edge, Firefox or Safari.
-   A [free Stripe account](https://dashboard.stripe.com/register) to be able to process payments using your [test API keys](https://dashboard.stripe.com/test/developers).
-   [Node.js >=10.0.0](https://nodejs.org/en/download/) and [Git](https://git-scm.com/downloads) for running the app locally.
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

The goal of creating the app was to use Stripe Elements to enable a checkout and confirmation experience for a fictitious e-commerce book store. A screenshot of the landing page for the app can be seen in the [Running the App section](#option-1---deploy-the-app-to-heroku) above. The app uses the [Card](https://stripe.com/docs/stripe-js#card-elementhttps://stripe.com/docs/stripe-js#card-element) and [Payment Request Button](https://stripe.com/docs/stripe-js#payment-request-button-element) Stripe Elements to enable card payments as well as the ability to use digital wallet services like Apple Pay on Safari, Google Pay on Chrome or browser-saved cards using Microsoft Pay on Edge. The Payment Request Button Stripe Element uses the [Payment Request Web API](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API) and the checkout page indicates if your browser doesn't support the API (eg. Firefox) or if you don't have any saved cards for use with Microsoft Pay.

The app uses the [Stripe node.js library](https://www.npmjs.com/package/stripe) on the server side and Stripe.js library hosted by Stripe on the client side. When the user selects a book and clicks 'Purchase', they are redirected to the checkout page. At this point the app creates a new PaymentIntent on the server side using the `stripe.paymentIntents.create` method and supplies this PaymentIntent to client side js functions. The client side js functions uses Stripe.js to create and mount the Card as well as Payment Request Button Stripe Elements (based on browser support or saved card availability) using the `elements.create` and `element.mount` methods. Following are screenshots of the checkout page as rendered on Chrome, Safari and Microsoft Edge respectively.

![image](https://user-images.githubusercontent.com/7586106/124686499-19850a80-de88-11eb-8dd6-aea89270231b.png)![image](https://user-images.githubusercontent.com/7586106/124686506-1be76480-de88-11eb-9b82-13ba98058a84.png)![image](https://user-images.githubusercontent.com/7586106/124686514-1ee25500-de88-11eb-8867-1b809db74e13.png)

The application tracks a successful payment via card or digital wallet services using the `status` property of the PaymentIntent instance. It also has UI controls that disable/enable the payment methods when stripe is initializing or when the user attempts a payment. On successful payment, the user is redirected to the success page. This page displays the amount of the transaction, the user's email that they either supplied for the card payment or the one associated with their digital wallet service, and the charge id. All of this information, including the email is extracted from the PaymentIntent instance and does not rely on client side values for better security. To ensure the automatic delivery of email receipts by Stripe I am updating the PaymentIntent with email information received from the form for the card payment or from the PaymetRequest Web API using the `stripe.paymentIntents.update` method. The success page also provides a link to the email receipt in case there is a problem sending the email.

![image](https://user-images.githubusercontent.com/7586106/124686519-230e7280-de88-11eb-984f-4d0ae8e44d15.png)

## Solution Approach and Experience Integrating Stripe

Given Stripe's focus on developers, I was pretty sure I would be able to find documentation relatively easily and I wasn't disappointed. In fact, I was delighted with the way that most documentation and code samples were organized, and were designed to be interactive as well as dynamic. I started off by looking for documentation for Stripe Elements and quickly found the [Stripe JS Elements documentation](https://stripe.com/docs/js/elements_object) as well as the [Stripe Payments demo and Github repository](https://stripe-payments-demo.appspot.com/) that uses Stripe Elements. As I started exploring these documents and code samples I started coming across the different resources such as PaymentIntents, PaymentMethods, Charges etc that the Stripe API provides. The [API Documentation](https://stripe.com/docs/payments/payment-intents) and the [Stripe API Reference](https://stripe.com/docs/api/payment_intents) helped me learn more about the API. I was still looking for a more detailed write up of how these entities relate to each other and why all the code I have been writing is a little more than the 7 lines of code that Stripe developers could apparently include in an app to enable payments. The [Stripe’s payments APIs: the first ten years](https://stripe.com/blog/payment-api-design) blog post did a great job explaining the evolution of the Stripe API and the complexities a modern payment experience has to deal with. I was impressed with the few lines of code setting up each Stripe Element required as compared to the 100s of lines of code I would have to write to enable these payments without Stripe.
    
I was also really impressed with all the API logs and the event information that the 'Developers' section on the Stripe Dashboard provided. It made understanding the structure of API and event really easy. The Stripe VS Code extension also made it easy to debug errors during development.

One small challenge I faced while developing the app was trying to fetch the charge id for a payment. I wasn't sure why it wasn't included in the PaymentIntent response when it seemed to be an important attribute for a payment. Reading the blog post mentioned above helped me understand that and I did find the Charges API that let me fetch all the charges attached to a PaymentIntent. The other slight challenge was trying to figure out how I can send an email receipt to a user using Stripe. I discovered that Stripe sends an email receipt if the ``receipt-email`` attribute of a PaymentIntent is populated and that a PaymentIntent can be updated during it's lifecycle. I created an API endpoint on the backend to update the PaymentIntent with the user's email before a payment was attempted.

## If this were a Production App

I am sure security and reliability is top of mind when a business of any size is dealing with online payments. As I was designing the app, I wasn't worried about the security of the transaction once Stripe takes over but did find myself thinking about scenarios where the app itself would have to safeguard against tampering of data (item details, prices etc), repeated payment attempts etc. To this end I ensured that the payment and item details are always fetched from the server, and are verified again when a payment is attempted. Additionally, client side controls make sure that users cannot make repeated attempts till an existing payment attempt is complete or if there is a server side error. I would like to get a deeper understanding about all the different types of errors that can surface when using Stripe and make the error handling in the code more specific to those errors.

I would also incorporate global payment methods like IBAN, iDEAL etc using Stripe Elements. I would also look at collecting shipping details using Stripe and tying this application to an order management/logistics system by incorporating the use of the Stripe events delivered via Webhooks.

I would like to use the Customer API to track customer profiles, billing information and payments. I though this would especially be useful for saving payment methods, tracking any failed payments and avoiding creating multiple duplicate PaymentIntents if the same customer tries to update cart items or is trying to pay for the same order using different payment methods in case any payment methods fail. It would also help enable an authenticated experience for customers on the site. The Product and Price APIs would also be useful for managing a product catalog for the bookstore. At the same time I was thinking about how Stripe would integrate with other product masters used by organizations that have complex, multi currency, global price books and product catalogs.

## DISCLAIMER

This is a learning/demo app and has been tested with [Stripe test data](https://stripe.com/docs/testing#cards) on Google Chrome, Safari, Microsoft Edge and Firefox for US based payment methods. Deploy this app for use as a live site would require a detailed code review, comprehensive testing and possibly significant code changes.
