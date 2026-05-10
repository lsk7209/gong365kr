export function isAuthorizedCronRequest(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  const token = request.headers.get("authorization");
  if (token === `Bearer ${cronSecret}`) {
    return true;
  }

  return request.headers.get("x-vercel-cron") === "1" || request.headers.get("x-vercel-cron") === "true";
}
