function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchBuildInfo(baseUrl) {
  const url = `${baseUrl.replace(/\/$/, '')}/build-info.json`;
  const response = await fetch(url, {
    headers: { 'accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url} with status ${response.status}`);
  }

  return response.json();
}

const expectedSha = process.env.EXPECTED_SHA || process.env.GITHUB_SHA;
const urls = (process.env.URLS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const retries = Number(process.env.SHA_CHECK_RETRIES || 5);
const delayMs = Number(process.env.SHA_CHECK_DELAY_MS || 15000);

if (!expectedSha) {
  throw new Error('EXPECTED_SHA (or GITHUB_SHA) is required.');
}

if (urls.length === 0) {
  throw new Error('URLS environment variable is required (comma-separated).');
}

let hasFailure = false;

for (const baseUrl of urls) {
  let success = false;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const data = await fetchBuildInfo(baseUrl);
      if (data.gitSha !== expectedSha) {
        throw new Error(
          `${baseUrl} returned gitSha=${String(data.gitSha)} but expected ${expectedSha}`
        );
      }

      console.log(`SHA validated for ${baseUrl}: ${data.gitSha}`);
      success = true;
      break;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Attempt ${attempt}/${retries} failed for ${baseUrl}: ${message}`);
      if (attempt < retries) {
        await sleep(delayMs);
      }
    }
  }

  if (!success) {
    hasFailure = true;
  }
}

if (hasFailure) {
  process.exitCode = 1;
}
