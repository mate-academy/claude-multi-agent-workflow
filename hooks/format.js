const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let filePath;
  try {
    filePath = JSON.parse(input).tool_input.file_path;
  } catch {
    return;
  }
  if (!filePath) return;

  spawnSync('npx', ['prettier', '--write', filePath], {
    stdio: 'ignore',
    shell: true,
  });
});
