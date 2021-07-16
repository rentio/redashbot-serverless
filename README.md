# Slack Bot for Redash on AWS Lambda

This is Slack bot for [Redash](https://redash.io/).


## Features

* Running on AWS Lambda (so low-cost).
* Made with [Bolt](https://slack.dev/bolt-js/concepts) framework (Non-Socket Mode).
* Take a screenshot of query visualization or dashboard.

<img src="https://user-images.githubusercontent.com/34906524/125292245-3c6a5f80-e35d-11eb-940f-1479222cf3f9.png" width="450">

## How to develop

### On your machine

First, run `local.js` to start Slack bot.
(customized `app.js` to work locally since we can't emulate the API Gateway)

```sh
$ npm install
$ export REDASH_HOST=redash.example.com
$ export REDASH_API_KEY=your-redash-api-key
$ export SLACK_BOT_TOKEN=xoxb-your-bot-token
$ export SLACK_SIGNING_SECRET=your-signing-secret
$ node local.js
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
