// Hook PostToolUse (Edit|Write): depois que o Claude altera um arquivo,
// roda `eslint --fix` nele, se for JavaScript.
//
// Recebe pelo stdin um JSON com tool_input.file_path.
// Nunca bloqueia o fluxo: sempre termina com código 0.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// Sobe a partir da pasta do arquivo até achar o eslint.config.js do projeto.
function findProjectRoot(startDir) {
  let dir = startDir;
  while (true) {
    if (fs.existsSync(path.join(dir, 'eslint.config.js'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function lintFile(file) {
  const root = findProjectRoot(path.dirname(file));
  if (!root) {
    console.log(`[lint-on-edit] Sem eslint.config.js acima de ${file}; nada feito.`);
    return;
  }

  // Usa o eslint instalado no próprio projeto (course-api/node_modules).
  const eslintBin = path.join(root, 'node_modules', 'eslint', 'bin', 'eslint.js');
  if (!fs.existsSync(eslintBin)) {
    console.log(`[lint-on-edit] eslint não instalado em ${root}. Rode "npm install" nessa pasta.`);
    return;
  }

  const name = path.basename(file);
  try {
    // Sai com 0 quando não há erros (warnings podem aparecer na saída).
    const output = execFileSync(process.execPath, [eslintBin, '--fix', file], {
      cwd: root,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    console.log(output.trim()
      ? `[lint-on-edit] Avisos em ${name}:\n${output.trim()}`
      : `[lint-on-edit] ${name} formatado, sem avisos de lint.`);
  } catch (err) {
    // Sai com 1 quando sobram erros que o --fix não corrige.
    const output = (err.stdout || '') + (err.stderr || '');
    console.log(`[lint-on-edit] Erros restantes em ${name}:\n${output.trim()}`);
  }
}

let data = '';
process.stdin.on('data', (chunk) => (data += chunk));
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(data).tool_input?.file_path;
  } catch {
    process.exit(0); // entrada inesperada: não atrapalha o fluxo
  }

  if (!file || !file.endsWith('.js') || !fs.existsSync(file)) process.exit(0);

  lintFile(path.resolve(file));
  process.exit(0);
});
