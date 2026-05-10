import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { hasRequiredEnv } from "@/lib/env";
import { refreshEventStatuses } from "@/lib/events/repository";
import { isAuthorizedCronRequest } from "@/lib/http/cron-auth";
import { refreshProgramStatuses } from "@/lib/programs/repository";

const REQUIRED_RUNTIME_ENV = ["TURSO_DATABASE_URL"];

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!hasRequiredEnv(REQUIRED_RUNTIME_ENV)) {
    return NextResponse.json(
      {
        error: "missing_runtime_env",
        required: REQUIRED_RUNTIME_ENV
      },
      { status: 503 }
    );
  }

  const db = getDb();
  const [programs, events] = await Promise.all([refreshProgramStatuses(db), refreshEventStatuses(db)]);

  return NextResponse.json({
    ok: true,
    refreshed: {
      programs,
      events
    }
  });
}
