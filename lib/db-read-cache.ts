import { unstable_cache } from "next/cache";

export const DB_READ_REVALIDATE_SECONDS = 3600;

export function isMissingIncrementalCacheError(error: unknown) {
  return error instanceof Error && error.message.includes("incrementalCache missing");
}

export async function cacheDbRead<T>(
  keyParts: readonly string[],
  query: () => Promise<T>,
  revalidate = DB_READ_REVALIDATE_SECONDS,
): Promise<T> {
  try {
    return await unstable_cache(query, ["db-read", ...keyParts], { revalidate })();
  } catch (error) {
    if (isMissingIncrementalCacheError(error)) {
      return query();
    }

    throw error;
  }
}

export function dateBucket(date: Date, bucketMs = 60 * 60 * 1000) {
  return String(Math.floor(date.getTime() / bucketMs));
}
