// Warns when a freshly edited file contains console.log calls.
const fs = require('fs');
const file = process.env.CLAUDE_TOOL_OUTPUT_FILE;
if (!file) process.exit(0);

let output;
try { output = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { process.exit(0); }

const filePath = output && (output.file_path || output.path);
if (!filePath) process.exit(0);

const src = fs.readFileSync(filePath, 'utf8');
const lines = src.split('\n');
lines.forEach((line, i) => {
  if (/console\.log/.test(line)) {
    console.warn(`[code-quality] console.log on line ${i + 1} of ${filePath}`);
  }
});
