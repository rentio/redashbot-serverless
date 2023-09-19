# Slack Bot for Redash on AWS Lambda

This is Slack bot for [Redash](https://redash.io/).


## Features

* Running on AWS Lambda (so low-cost).
* Made with [Bolt](https://slack.dev/bolt-js/concepts) framework (Non-Socket Mode).
* Take a screenshot of query visualization or dashboard.

<img src="https://github.com/rentio/redashbot-serverless/blob/images/readme.png" width="450">

## How to develop

### On your machine with Docker

First, run `local.js` to start Slack bot.
(customized `app.js` to work locally since we can't emulate the API Gateway)

```sh
$ make setup
$ docker compose up
(Other Terminal)
$ open http://localhost:5001/users/me
# Login admin@example.com/password and get User API Key
$ make REDASH_API_KEY=your-redash-api-key sample_query_and_dashboard
```

Next, use ngrok to forward Slack events to your local machine.

```sh
$ ngrok http 3000
```

### Deploy to AWS Lambda

First, deploy to AWS by [serverless framework](https://www.serverless.com/).

```sh
$ npm install
$ cp .env.sample .env.dev
$ npx serverless deploy --stage dev
```

Next, edit a function as necessary on aws web console.

https://docs.aws.amazon.com/lambda/latest/dg/code-editor.html


### Lambda function to access resources in a VPC

In most cases, Redash is located in a VPC.
If Slack bot needs to access the VPC, uncomment vpc section of `serverless.yml`.
