const { execFileSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const file = data.tool_input && data.tool_input.file_path;
    if (!file || !file.endsWith('.js')) process.exit(0);
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    process.exit(0);
  } catch (err) {
    if (err.stderr) {
      process.stderr.write(`Syntax error after edit:\n${err.stderr}`);
      process.exit(2); // exit 2 sends the error back to Claude to fix
    }
    process.exit(0);
  }
});