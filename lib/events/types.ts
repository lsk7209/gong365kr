import type { eventSourceValues, eventStatusValues } from "@/db/schema";

export type EventSource = (typeof eventSourceValues)[number];
export type EventStatus = (typeof eventStatusValues)[number];

export type EventUpsertInput = {
  eventInfoId: string;
  source: EventSource;
  slug: string;
  title: string;
  summaryShort: string | null;
  areaName: string | null;
  eventType: string | null;
  originOrg: string | null;
  categoryCode: string | null;
  receptionStart: Date | null;
  receptionEnd: Date | null;
  eventStart: Date | null;
  eventEnd: Date | null;
  status: EventStatus;
  rawUrl: string;
  originUrl: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  printFileUrl: string | null;
  printFileName: string | null;
  rawJson: string;
  lastSyncedAt: Date;
  createdAt: Date;
};
