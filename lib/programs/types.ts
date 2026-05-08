import type { programSourceValues, programStatusValues } from "@/db/schema";

export type ProgramSource = (typeof programSourceValues)[number];
export type ProgramStatus = (typeof programStatusValues)[number];

export type ProgramUpsertInput = {
  pblancId: string;
  source: ProgramSource;
  slug: string;
  title: string;
  summaryShort: string | null;
  agency: string | null;
  executor: string | null;
  categoryCode: string | null;
  applicationStart: Date | null;
  applicationEnd: Date | null;
  status: ProgramStatus;
  rawUrl: string;
  detailPdfUrl: string | null;
  rawJson: string;
  lastSyncedAt: Date;
  createdAt: Date;
};
