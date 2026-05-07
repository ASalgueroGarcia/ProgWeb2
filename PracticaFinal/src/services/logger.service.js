const axios = require("axios");

const sendSlackError = async (err, req) => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await axios.post(webhookUrl, {
      text: `*5XX Error*\n*Time:* ${new Date().toISOString()}\n*Route:* ${req.method} ${req.originalUrl}\n*Message:* ${err.message}\n*Stack:*\n${err.stack}`
    });
  } catch (_) {}
};

module.exports = { sendSlackError };
