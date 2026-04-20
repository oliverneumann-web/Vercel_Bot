import fs from 'fs';
import mammoth from 'mammoth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse'); // pdf-parse is CJS, must use require in ESM

export async function processFiles(files, channel, token) {
  let combinedText = '';

  for (const file of files) {
    const path = await downloadFile(file, token);
    let text = '';

    if (file.mimetype === 'application/pdf') {
      text = await extractPDF(path);
    } else {
      text = await extractDOCX(path);
    }

    combinedText += `\n\n===== ${file.name} =====\n\n${text}`;
  }

  fs.writeFileSync('/tmp/combined_output.txt', combinedText);
}

async function downloadFile(file, token) {
  const response = await fetch(file.url_private, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  const path = `/tmp/${file.name}`;
  fs.writeFileSync(path, buffer);
  return path;
}

async function extractPDF(path) {
  const buffer = fs.readFileSync(path);
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractDOCX(path) {
  const result = await mammoth.extractRawText({ path });
  return result.value;
}
