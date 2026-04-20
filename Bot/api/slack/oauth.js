import axios from 'axios';

export default async function handler(req, res) {
  const code = req.query.code;

  try {
    const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
      params: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code
      }
    });

    const data = response.data;

    if (!data.ok) {
      console.error(data);
      return res.status(500).send('OAuth failed');
    }

    console.log('✅ Installed workspace:', data.team.id);
    console.log('🔑 Bot token:', data.access_token);

    // 🚨 TODO: store in DB for multi-workspace support

    res.send('App installed successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('OAuth error');
  }
}