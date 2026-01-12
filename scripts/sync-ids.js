import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, relative, resolve } from 'path';

const ROOT = resolve(__dirname, '..');
const OUT = resolve(__dirname, 'sync-ids-report.json');
const UUID_REGEX = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', 'out', 'dist'].includes(e.name)) continue;
      files.push(...walk(full));
    } else if (e.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function scan() {
  const files = walk(ROOT);
  const report = [];
  for (const f of files) {
    // scan only text files of interest
    if (!f.match(/\.(ts|tsx|js|jsx|md|mdx|json|jsonc)$/i)) continue;
    const raw = readFileSync(f, 'utf8');
    const lines = raw.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const m = line.match(UUID_REGEX);
      if (m) {
        for (const uuid of m) {
          report.push({ file: relative(ROOT, f), line: i + 1, uuid, snippet: line.trim() });
        }
      }
    }
  }
  return report;
}

function main() {
  const report = scan();
  writeFileSync(
    OUT,
    JSON.stringify({ generated: new Date().toISOString(), root: ROOT, items: report }, null, 2),
    'utf8'
  );
  console.warn(`Scanned ${ROOT}`);
  console.warn(`Found ${report.length} UUID matches. Report written to ${OUT}`);
}

main();
