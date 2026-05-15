import { z } from "zod";

export const kstartupSyncQuerySchema = z.object({
  pageNo: z.coerce.number().int().min(1).default(1),
  numOfRows: z.coerce.number().int().min(1).max(100).default(50),
});

export type KstartupRawItem = Record<string, unknown>;

export type KstartupFetchResult = {
  items: KstartupRawItem[];
  totalCount: number;
  requestedUrl: string;
};
