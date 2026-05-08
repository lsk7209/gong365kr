import { z } from "zod";

export const bizinfoSyncQuerySchema = z.object({
  pageIndex: z.coerce.number().int().min(1).default(1),
  pageUnit: z.coerce.number().int().min(1).max(50).default(50),
  hashtags: z.string().trim().optional()
});

export type BizinfoRawItem = Record<string, unknown>;

export type BizinfoFetchResult = {
  items: BizinfoRawItem[];
  requestedUrl: string;
};
