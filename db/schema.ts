import { relations } from "drizzle-orm";
import {
  blob,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const programSourceValues = [
  "bizinfo",
  "kstartup",
  "semas",
  "kosmes",
] as const;
export const eventSourceValues = ["bizinfo"] as const;
export const programStatusValues = ["upcoming", "active", "closed"] as const;
export const eventStatusValues = ["upcoming", "active", "closed"] as const;
export const contentStatusValues = [
  "draft",
  "review",
  "published",
  "rejected",
] as const;

export const programs = sqliteTable(
  "programs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pblancId: text("pblanc_id").unique().notNull(),
    source: text("source", { enum: programSourceValues }).notNull(),
    slug: text("slug").unique().notNull(),
    title: text("title").notNull(),
    summaryShort: text("summary_short"),
    agency: text("agency"),
    executor: text("executor"),
    categoryCode: text("category_code"),
    applicationStart: integer("application_start", { mode: "timestamp" }),
    applicationEnd: integer("application_end", { mode: "timestamp" }),
    status: text("status", { enum: programStatusValues }).notNull(),
    rawUrl: text("raw_url").notNull(),
    detailPdfUrl: text("detail_pdf_url"),
    rawJson: text("raw_json"),
    lastSyncedAt: integer("last_synced_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("idx_programs_status").on(table.status),
    index("idx_programs_application_end").on(table.applicationEnd),
    index("idx_programs_source").on(table.source),
    index("idx_programs_slug").on(table.slug),
  ],
);

export const programMeta = sqliteTable("program_meta", {
  programId: integer("program_id")
    .primaryKey()
    .references(() => programs.id, { onDelete: "cascade" }),
  eligibilityStructured: text("eligibility_structured"),
  similarityEmbedding: blob("similarity_embedding", { mode: "buffer" }),
  fitnessAxes: text("fitness_axes"),
  lastYearDiff: text("last_year_diff"),
  competitionScore: real("competition_score"),
  difficultyScore: integer("difficulty_score"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const events = sqliteTable(
  "events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventInfoId: text("event_info_id").unique().notNull(),
    source: text("source", { enum: eventSourceValues }).notNull(),
    slug: text("slug").unique().notNull(),
    title: text("title").notNull(),
    summaryShort: text("summary_short"),
    areaName: text("area_name"),
    eventType: text("event_type"),
    originOrg: text("origin_org"),
    categoryCode: text("category_code"),
    receptionStart: integer("reception_start", { mode: "timestamp" }),
    receptionEnd: integer("reception_end", { mode: "timestamp" }),
    eventStart: integer("event_start", { mode: "timestamp" }),
    eventEnd: integer("event_end", { mode: "timestamp" }),
    status: text("status", { enum: eventStatusValues }).notNull(),
    rawUrl: text("raw_url").notNull(),
    originUrl: text("origin_url"),
    attachmentUrl: text("attachment_url"),
    attachmentName: text("attachment_name"),
    printFileUrl: text("print_file_url"),
    printFileName: text("print_file_name"),
    rawJson: text("raw_json"),
    lastSyncedAt: integer("last_synced_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("idx_events_status").on(table.status),
    index("idx_events_event_end").on(table.eventEnd),
    index("idx_events_source").on(table.source),
    index("idx_events_slug").on(table.slug),
  ],
);

export const programContent = sqliteTable("program_content", {
  programId: integer("program_id")
    .primaryKey()
    .references(() => programs.id, { onDelete: "cascade" }),
  summaryLong: text("summary_long"),
  whoShouldApply: text("who_should_apply"),
  cautions: text("cautions"),
  howToApply: text("how_to_apply"),
  faq: text("faq"),
  criticScore: integer("critic_score"),
  criticReport: text("critic_report"),
  publishedStatus: text("published_status", {
    enum: contentStatusValues,
  }).notNull(),
  lastGeneratedAt: integer("last_generated_at", { mode: "timestamp" }),
});

// facet 사전계산 결과 저장 테이블.
// 지역/카테고리 건수는 LIKE 풀스캔이라 페이지 요청마다 집계하면 rows_read가 폭주한다.
// sync cron(6시간 1회)이 여기에 결과를 적재하고, 페이지는 이 가벼운 테이블만 읽는다.
export const facetCounts = sqliteTable(
  "facet_counts",
  {
    // facet 종류: 'region' | 'category'
    facetType: text("facet_type").notNull(),
    // region.code 또는 카테고리 라벨(코드)
    facetKey: text("facet_key").notNull(),
    // region.name 또는 카테고리 라벨(표시용)
    label: text("label"),
    count: integer("count").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.facetType, table.facetKey] })],
);

export const regions = sqliteTable("regions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").unique().notNull(),
  name: text("name").notNull(),
});

export const industries = sqliteTable("industries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").unique().notNull(),
  name: text("name").notNull(),
});

export const targets = sqliteTable("targets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").unique().notNull(),
  name: text("name").notNull(),
});

export const programsRegions = sqliteTable(
  "programs_regions",
  {
    programId: integer("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    regionId: integer("region_id")
      .notNull()
      .references(() => regions.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.programId, table.regionId] })],
);

export const programsIndustries = sqliteTable(
  "programs_industries",
  {
    programId: integer("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    industryId: integer("industry_id")
      .notNull()
      .references(() => industries.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.programId, table.industryId] })],
);

export const programsTargets = sqliteTable(
  "programs_targets",
  {
    programId: integer("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    targetId: integer("target_id")
      .notNull()
      .references(() => targets.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.programId, table.targetId] })],
);

export const programRelations = relations(programs, ({ one, many }) => ({
  meta: one(programMeta),
  content: one(programContent),
  regions: many(programsRegions),
  industries: many(programsIndustries),
  targets: many(programsTargets),
}));

export const regionRelations = relations(regions, ({ many }) => ({
  programs: many(programsRegions),
}));

export const industryRelations = relations(industries, ({ many }) => ({
  programs: many(programsIndustries),
}));

export const targetRelations = relations(targets, ({ many }) => ({
  programs: many(programsTargets),
}));
