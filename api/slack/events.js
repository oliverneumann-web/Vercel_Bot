import { processFiles } from '../../lib/fileProcessing.js';
import { verifySlackRequest } from '../../lib/slackVerify.js';

export default async function handler(req, res) {
  try {
    // Parse body safely (Vercel may send string or object)
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body;

    // 1. Slack URL verification (must be first response path)
    if (body?.type === 'url_verification') {
      return res.status(200).send(body.challenge);
    }

    // 2. Verify Slack signature
    const isValid = verifySlackRequest(
      req,
      process.env.SLACK_SIGNING_SECRET
    );

    if (!isValid) {
      return res.status(401).send('Invalid signature');
    }

    const event = body?.event;

    // 3. Respond immediately to avoid Slack timeout
    res.status(200).send();

    // 4. Async processing (do NOT await in serverless request)
    if (event?.files?.length) {
      processFiles(
        event.files,
        event.channel,
        process.env.SLACK_BOT_TOKEN
      ).catch((err) => {
        console.error('File processing error:', err);
      });
    }

  } catch (err) {
    console.error('Handler crash:', err);
    return res.status(500).send('Server error');
  }
}
