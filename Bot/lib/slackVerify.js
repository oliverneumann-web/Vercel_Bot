import crypto from 'crypto';

export function verifySlackRequest(req, signingSecret) {
  const timestamp = req.headers['x-slack-request-timestamp'];
  const signature = req.headers['x-slack-signature'];

  const body = JSON.stringify(req.body);

  const baseString = `v0:${timestamp}:${body}`;
  const mySignature =
    'v0=' +
    crypto.createHmac('sha256', signingSecret)
      .update(baseString)
      .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(signature)
  );
}