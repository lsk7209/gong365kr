export function isAuthorizedCronRequest(request: Request) {
  if (
    request.headers.get("x-vercel-cron") === "1" ||
    request.headers.get("x-vercel-cron") === "true"
  ) {
    return true;
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}
