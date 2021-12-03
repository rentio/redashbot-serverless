const { App } = require('@slack/bolt')
const { createReadStream } = require('fs')
const playwright = require('playwright-aws-lambda')
const axios = require('axios')

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
})

const redashHost = process.env.REDASH_HOST

const getQuery = async (queryId) => {
  const res = await axios.get(`http://${redashHost}/api/queries/${queryId}?api_key=${process.env.REDASH_API_KEY}`)
  return res.data
}

const getDashboard = async (dashboardId) => {
  const res = await axios.get(`http://${redashHost}/api/dashboards/${dashboardId}?api_key=${process.env.REDASH_API_KEY}`)
  return res.data
}

const uploadScreenShot = async ({ client, body }) => {
  const fontUrl = process.env.FONT_URL
  if (fontUrl) {
    await playwright.loadFont(fontUrl)
  }

  const browser = await playwright.launchChromium({ headless: true })
  const context = await browser.newContext()

  const text = body['event']['text']
  const queryRegex = new RegExp(`http://${redashHost}/queries/([0-9]+)(?:#([0-9]+))?`)
  const dashboardRegex = new RegExp(`http://${redashHost}/dashboards/([0-9]+)-[0-9a-z_-]+`)

  let embedUrl
  let fileName
  let originalUrl

  if (text.match(queryRegex)) {
    const matches = text.match(queryRegex)
    const queryId = matches[1]
    const query = await getQuery(queryId)
    const visualizationId = matches[2] || query.visualizations[0].id
    embedUrl = `http://${redashHost}/embed/query/${queryId}/visualization/${visualizationId}?api_key=${process.env.REDASH_API_KEY}`
    fileName = `/tmp/${query.name}.png`
    originalUrl = matches[0]
  } else if (text.match(dashboardRegex)) {
    const matches = text.match(dashboardRegex)
    const dashboardId = matches[1]
    const dashboard = await getDashboard(dashboardId)
    embedUrl = dashboard.public_url
    fileName = `/tmp/${dashboard.name}.png`
    originalUrl = matches[0]
  } else {
    throw('Invalid URL')
  }

  const page = await context.newPage()
  page.setViewportSize({ width: 1024, height: 480 })
  await page.goto(embedUrl)
  await page.waitForResponse(/results/)
  await page.waitForTimeout(1000)
  await page.screenshot({ fullPage: true, path: fileName })

  browser.close()

  await client.files.upload({
    channels: body['event']['channel'],
    initial_comment: `Taking screenshot of ${originalUrl}`,
    file: createReadStream(fileName),
  })
}

(async () => {
app.event('app_mention', async ({ client, body, say }) => {
  if (body['event']['text'].includes('ping')) {
    await say('pong :table_tennis_paddle_and_ball:')
  } else {
    await uploadScreenShot({ client, body })
  }
})

  // Start your app
  await app.start(process.env.PORT || 3000)

  console.log('⚡️ Bolt app is running!')
})()
