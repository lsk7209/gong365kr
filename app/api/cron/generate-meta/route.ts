import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { hasRequiredEnv } from "@/lib/env";
import { isAuthorizedCronRequest } from "@/lib/http/cron-auth";
import { defaultMetaPipelineDeps, processProgramMetaBatch } from "@/lib/programs/meta-pipeline";
import { listProgramsPendingMeta, saveProgramMetaExtraction } from "@/lib/programs/repository";

const REQUIRED_RUNTIME_ENV = ["TURSO_DATABASE_URL", "GEMINI_API_KEY"];
const DEFAULT_BATCH_LIMIT = 5;
const MAX_BATCH_LIMIT = 20;

const generateMetaQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_BATCH_LIMIT).default(DEFAULT_BATCH_LIMIT)
});

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

  const parsedQuery = generateMetaQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));

  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        error: "invalid_query",
        issues: parsedQuery.error.issues
      },
      { status: 400 }
    );
  }

  const db = getDb();
  const pendingPrograms = await listProgramsPendingMeta(db, parsedQuery.data.limit);
  const summary = await processProgramMetaBatch(pendingPrograms, {
    ...defaultMetaPipelineDeps,
    saveMetaExtraction: (input) => saveProgramMetaExtraction(db, input)
  });

  return NextResponse.json({
    ok: true,
    requested: parsedQuery.data.limit,
    selected: pendingPrograms.length,
    ...summary
  });
}
