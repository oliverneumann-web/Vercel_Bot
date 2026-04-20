import { processFiles } from '../../lib/fileProcessing.js';
import { verifySlackRequest } from '../../lib/slackVerify.js';

export default async function handler(req, res) {
  // Verify Slack request
  const isValid = verifySlackRequest(req, process.env.SLACK_SIGNING_SECRET);

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  const body = req.body;

  // Slack URL verification
  if (body.type === 'url_verification') {
    return res.status(200).send(body.challenge);
  }

  const event = body.event;

  if (event?.files) {
    // Respond immediately (VERY important)
    res.status(200).send();

    // Async processing (don’t block Slack)
    processFiles(
      event.files,
      event.channel,
      process.env.SLACK_BOT_TOKEN
    );

    return;
  }

  return res.status(200).send();
}