import { processFiles } from '../../lib/fileProcessing.js';
import { verifySlackRequest } from '../../lib/slackVerify.js';

export default async function handler(req, res) {
  let body;

  try {
    body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;
  } catch (err) {
    return res.status(400).send('Invalid JSON');
  }

  // Slack URL verification (MUST be first meaningful logic)
  if (body?.type === 'url_verification') {
    return res.status(200).send(body.challenge);
  }

  // Verify Slack signature AFTER parsing
  const isValid = verifySlackRequest(req, process.env.SLACK_SIGNING_SECRET);

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  const event = body.event;

  if (event?.files) {
    res.status(200).send();

    processFiles(
      event.files,
      event.channel,
      process.env.SLACK_BOT_TOKEN
    );

    return;
  }

  return res.status(200).send();
}