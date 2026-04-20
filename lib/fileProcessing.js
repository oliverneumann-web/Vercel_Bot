import fs from 'fs';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';

export async function processFiles(files, channel, token) {
  console.log('Processing files safely...');

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

// download stays same as yours
async function downloadFile(file, token) {
  const response = await fetch(file.url_private, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  const path = `/tmp/${file.name}`;

  fs.writeFileSync(path, buffer);
  return path;
}

// ✅ SERVERLESS SAFE PDF PARSER
async function extractPDF(path) {
  const data = new Uint8Array(fs.readFileSync(path));

  const pdf = await pdfjsLib.getDocument({ data }).promise;

  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    text += strings.join(' ') + '\n';
  }

  return text;
}

// DOCX stays unchanged
async function extractDOCX(path) {
  const result = await mammoth.extractRawText({ path });
  return result.value;
}
