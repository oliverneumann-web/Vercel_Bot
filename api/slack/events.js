import { processFiles } from '../../lib/fileProcessing.js';
import { verifySlackRequest } from '../../lib/slackVerify.js';

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  try {
    const rawBody = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });

    const body = JSON.parse(rawBody);

    if (body?.type === 'url_verification') {
      return res.status(200).json({ challenge: body.challenge });
    }

    const isValid = verifySlackRequest(
      rawBody,
      req.headers,
      process.env.SLACK_SIGNING_SECRET
    );

    if (!isValid) {
      return res.status(401).send('Invalid signature');
    }

    res.status(200).send();

    const event = body?.event;
    if (event?.files?.length) {
      processFiles(event.files, event.channel, process.env.SLACK_BOT_TOKEN)
        .catch(err => console.error('File processing error:', err));
    }

  } catch (err) {
    console.error('Handler crash:', err);
    return res.status(500).send('Server error');
  }
}
