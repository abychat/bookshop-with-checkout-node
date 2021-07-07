# Using Stripe Elements for a seamless checkout experience

## Overview

This is a node.js app that uses express.js, handelbars.js and Stripe Elements to host a fictitious bookshop wesbite. Users visiting the bookshop can browse all available books
and checkout using a credit card or by using Apple Pay, Google Pay or Microsoft Pay depending on the browser they are using.

The following sections on this page list the options for deploying and using the app. Use the Github generated table of contents in the header of this file to quickly navigate to different sections of the document.

## Running the app

### Prerequisites
* Node.js >=10.0.0
* A modern browser like Chrome, Microsoft Edge, Firefox or Safari
* A [free Stripe account](https://dashboard.stripe.com/register) to be able to process payments
* [Git](https://git-scm.com/downloads)
* The PaymentRequest Stripe Element requires that the application be served over https both in development and production.
  + You can install and use [ngrok](https://dashboard.ngrok.com/signup) for enabling a secure connection to your local server.
  + Apple Pay requires the [verification and registration of your domain](https://stripe.com/docs/stripe-js/elements/payment-request-button#verifying-your-domain-with-apple-pay).
    - You can create a free account and easily deploy your app to [Heroku](https://signup.heroku.com/) to get a dedicated secure domain.
    - Alternatively, ngrok offers a paid version which will allow you to have to a dedicated secure domain that can be verified and registered to test the Apple Pay intergration during development.

### OPTION 1 - Deploy the app to Heroku

1. Click on the following button to deploy the app to Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/abychat/bookshop-with-checkout-node)

2. Supply an app name for your demo app, the config variables and click on 'Deploy'.

![image](https://user-images.githubusercontent.com/7586106/124684702-96ae8080-de84-11eb-8061-b8b9c34a77db.png)

3. Once the app is deployed, navigate to https://[app-name].herokuapp.com to verify that the app is up and running.
4. If you want to test Apple Pay on Safari, [verify and register your domain](https://stripe.com/docs/stripe-js/elements/payment-request-button#verifying-your-domain-with-apple-pay).

###  OPTION 2 - Running the app locally

The following steps will guide you through the setup of this app on your local machine

1. Clone this repostory using the following command  on the terminal of your choice 
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
4. Create a copy of the .env.example file and supply all the required API keys as well as other configuration parameters. The .env file is included in the .gitignore file and is not pushed to your repository.
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

Connnections                  ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

7. If you want to test Apple Pay on Safari, [verify and register your domain](https://stripe.com/docs/stripe-js/elements/payment-request-button#verifying-your-domain-with-apple-pay).

8. Navigate to http://localhost: <PORT> (port specified in .env) or the ngrok secure URL on your browser to verify that the application is up and running. You should see the following screen
![image](https://user-images.githubusercontent.com/7586106/124682884-b93e9a80-de80-11eb-95e9-f906e7f1cb99.png)


## Using the app

![image](https://user-images.githubusercontent.com/7586106/124686499-19850a80-de88-11eb-8dd6-aea89270231b.png)
![image](https://user-images.githubusercontent.com/7586106/124686506-1be76480-de88-11eb-9b82-13ba98058a84.png)
![image](https://user-images.githubusercontent.com/7586106/124686514-1ee25500-de88-11eb-8867-1b809db74e13.png)
![image](https://user-images.githubusercontent.com/7586106/124686519-230e7280-de88-11eb-984f-4d0ae8e44d15.png)


DISCLAIMER - This is a learning/demo app and has been tested with [Stripe test data](https://stripe.com/docs/testing#cards) on Google Chrome, Safari, Microsoft Edge and Firefox. Do not deploy this app for use as a live site without a detailed code review and comprehensive testing.

## Solution approach and experience building the app

## If this were a production app
