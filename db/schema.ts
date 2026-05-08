import { relations } from "drizzle-orm";
import { blob, index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const programSourceValues = ["bizinfo", "kstartup", "semas", "kosmes"] as const;
export const programStatusValues = ["upcoming", "active", "closed"] as const;
export const contentStatusValues = ["draft", "review", "published", "rejected"] as const;

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
    createdAt: integer("created_at", { mode: "timestamp" }).notNull()
  },
  (table) => [
    index("idx_programs_status").on(table.status),
    index("idx_programs_application_end").on(table.applicationEnd),
    index("idx_programs_source").on(table.source),
    index("idx_programs_slug").on(table.slug)
  ]
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
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
});

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
  publishedStatus: text("published_status", { enum: contentStatusValues }).notNull(),
  lastGeneratedAt: integer("last_generated_at", { mode: "timestamp" })
});

export const regions = sqliteTable("regions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").unique().notNull(),
  name: text("name").notNull()
});

export const industries = sqliteTable("industries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").unique().notNull(),
  name: text("name").notNull()
});

export const targets = sqliteTable("targets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").unique().notNull(),
  name: text("name").notNull()
});

export const programsRegions = sqliteTable(
  "programs_regions",
  {
    programId: integer("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    regionId: integer("region_id")
      .notNull()
      .references(() => regions.id, { onDelete: "cascade" })
  },
  (table) => [primaryKey({ columns: [table.programId, table.regionId] })]
);

export const programsIndustries = sqliteTable(
  "programs_industries",
  {
    programId: integer("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    industryId: integer("industry_id")
      .notNull()
      .references(() => industries.id, { onDelete: "cascade" })
  },
  (table) => [primaryKey({ columns: [table.programId, table.industryId] })]
);

export const programsTargets = sqliteTable(
  "programs_targets",
  {
    programId: integer("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    targetId: integer("target_id")
      .notNull()
      .references(() => targets.id, { onDelete: "cascade" })
  },
  (table) => [primaryKey({ columns: [table.programId, table.targetId] })]
);

export const programRelations = relations(programs, ({ one, many }) => ({
  meta: one(programMeta),
  content: one(programContent),
  regions: many(programsRegions),
  industries: many(programsIndustries),
  targets: many(programsTargets)
}));

export const regionRelations = relations(regions, ({ many }) => ({
  programs: many(programsRegions)
}));

export const industryRelations = relations(industries, ({ many }) => ({
  programs: many(programsIndustries)
}));

export const targetRelations = relations(targets, ({ many }) => ({
  programs: many(programsTargets)
}));
