import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const reportDir = resolve(process.cwd(), process.env.REPORT_DIR || 'report');
const resultsPath = resolve(
  process.cwd(),
  process.env.TEST_RESULTS_FILE || 'artifacts/test-results.json'
);

const buildDate = process.env.BUILD_DATE || new Date().toISOString();
const gitSha = process.env.GIT_SHA || process.env.GITHUB_SHA || 'dev';

let raw;
try {
  raw = JSON.parse(readFileSync(resultsPath, 'utf8'));
} catch {
  raw = {};
}

const numPassed = Number(raw.numPassedTests || 0);
const numFailed = Number(raw.numFailedTests || 0);
const numTotal = Number(raw.numTotalTests || numPassed + numFailed);
const durationMs = Number(raw.testResults?.[0]?.endTime && raw.testResults?.[0]?.startTime
  ? raw.testResults[0].endTime - raw.testResults[0].startTime
  : 0);

mkdirSync(reportDir, { recursive: true });

const summary = {
  buildDate,
  gitSha,
  tests: {
    total: numTotal,
    passed: numPassed,
    failed: numFailed,
    durationMs
  }
};

writeFileSync(resolve(reportDir, 'build-report.json'), JSON.stringify(summary, null, 2), 'utf8');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Build Report</title>
  <style>
    body { font-family: "IBM Plex Sans", "Segoe UI", sans-serif; margin: 0; padding: 24px; background: #f4f6f8; color: #111827; }
    .card { max-width: 740px; margin: 0 auto; background: #fff; border: 1px solid #d1d5db; border-radius: 12px; padding: 20px; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 6px; }
    .pass { color: #047857; }
    .fail { color: #b91c1c; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Build Report</h1>
    <p><strong>Build date (UTC):</strong> ${summary.buildDate}</p>
    <p><strong>Git SHA:</strong> <code>${summary.gitSha}</code></p>
    <h2>Unit Tests</h2>
    <p><strong>Total:</strong> ${summary.tests.total}</p>
    <p class="pass"><strong>Passed:</strong> ${summary.tests.passed}</p>
    <p class="fail"><strong>Failed:</strong> ${summary.tests.failed}</p>
    <p><strong>Duration:</strong> ${summary.tests.durationMs} ms</p>
  </div>
</body>
</html>`;

writeFileSync(resolve(reportDir, 'index.html'), html, 'utf8');
console.log(`Build report written to ${reportDir}`);
