// Concatenates the server simulation + client modules and inlines CSS/JS into dist/index.html.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root, p), 'utf8');

const clientFiles = readdirSync(join(root, 'src/client')).filter(f => f.endsWith('.js')).sort();
const js = ['src/server/core.js', ...clientFiles.map(f => 'src/client/' + f)].map(read).join('\n');
const css = read('src/styles/main.css');

// function replacers: the JS contains "$" sequences that String.replace would otherwise interpret
const html = read('src/template.html')
  .replace('/*__STYLES__*/', () => css)
  .replace('/*__SCRIPT__*/', () => js);

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/index.html'), html);
console.log(`Built dist/index.html (${(html.length / 1024).toFixed(0)} KB) from ${clientFiles.length + 1} script files`);
