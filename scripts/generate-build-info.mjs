import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const buildDate = process.env.BUILD_DATE || new Date().toISOString();
const gitSha = process.env.GIT_SHA || process.env.GITHUB_SHA || 'dev';
const shortSha = gitSha.slice(0, 7);

const outFile = resolve(process.cwd(), 'src/generated/build-info.ts');
mkdirSync(dirname(outFile), { recursive: true });

const content = `export const buildInfo = ${JSON.stringify(
  { buildDate, gitSha, shortSha },
  null,
  2
)} as const;\n`;

writeFileSync(outFile, content, 'utf8');
console.log(`Generated build metadata at ${outFile}`);
