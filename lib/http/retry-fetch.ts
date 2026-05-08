const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 300;

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1] & {
  next?: {
    revalidate?: number | false;
  };
};

export type RetryFetchOptions = {
  maxAttempts?: number;
  retryDelayMs?: number;
  fetcher?: typeof fetch;
};

export async function retryFetch(input: FetchInput, init?: FetchInit, options: RetryFetchOptions = {}) {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  const fetcher = options.fetcher ?? fetch;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetcher(input, init);

      if (!shouldRetryResponse(response) || attempt === maxAttempts) {
        return response;
      }
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        throw error;
      }
    }

    await delay(retryDelayMs * attempt);
  }

  throw lastError instanceof Error ? lastError : new Error("fetch 재시도 실패");
}

function shouldRetryResponse(response: Response) {
  return response.status >= 500;
}

function delay(ms: number) {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
