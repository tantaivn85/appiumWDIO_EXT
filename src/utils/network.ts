const DEFAULT_CONNECTIVITY_URLS = [
  "https://www.google.com/generate_204",
  "https://www.cloudflare.com/cdn-cgi/trace",
];

async function canReachUrl(url: string, timeoutMs: number): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Validates internet connectivity before test execution.
 *
 * Environment overrides:
 * - INTERNET_CHECK_URLS: comma-separated URLs
 * - INTERNET_CHECK_TIMEOUT_MS: timeout for each URL probe in milliseconds
 */
export async function assertInternetConnection(): Promise<void> {
  const timeoutMs = Number(process.env.INTERNET_CHECK_TIMEOUT_MS ?? "5000");
  const configuredUrls = process.env.INTERNET_CHECK_URLS
    ?.split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  const probeUrls = configuredUrls?.length
    ? configuredUrls
    : DEFAULT_CONNECTIVITY_URLS;

  for (const url of probeUrls) {
    const reachable = await canReachUrl(url, timeoutMs);
    if (reachable) {
      return;
    }
  }

  throw new Error(
    [
      "No internet connection detected.",
      `Checked URLs: ${probeUrls.join(", ")}`,
      `Timeout per URL: ${timeoutMs}ms`,
      "Set INTERNET_CHECK_URLS to customize probes.",
    ].join(" "),
  );
}
