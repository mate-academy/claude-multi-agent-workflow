const { spawnSync } = require('child_process');
const fs = require('fs');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  let filePath;
  try {
    filePath = JSON.parse(input).tool_input?.file_path;
  } catch {
    process.exit(0);
  }

  if (!filePath || !/\.(js|cjs|mjs)$/i.test(filePath) || !fs.existsSync(filePath)) {
    process.exit(0);
  }

  const result = spawnSync(process.execPath, ['--check', filePath], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(`Syntax error in ${filePath}:\n${result.stderr}`);
    process.exit(2);
  }
  process.exit(0);
});
