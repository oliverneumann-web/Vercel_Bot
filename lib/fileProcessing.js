import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { WebClient } from "@slack/web-api";

export async function processFiles(files, channel, botToken) {
  const slackClient = new WebClient(botToken);

  let combinedText = '';

  for (const file of files) {
    if (
      file.mimetype !== 'application/pdf' &&
      file.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) continue;

    const response = await fetch(file.url_private, {
      headers: {
        Authorization: `Bearer ${botToken}`
      }
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    let text = '';

    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(buffer);
      text = data.text;
    } else {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }

    combinedText += `\n\n===== ${file.name} =====\n\n${text}`;
  }

  // Upload as file (no disk usage)
  await slackClient.files.uploadV2({
    channel_id: channel,
    content: combinedText,
    filename: 'combined_output.txt',
    title: 'Combined File Output'
  });
}