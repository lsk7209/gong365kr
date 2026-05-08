CREATE TABLE `industries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `industries_code_unique` ON `industries` (`code`);--> statement-breakpoint
CREATE TABLE `program_content` (
	`program_id` integer PRIMARY KEY NOT NULL,
	`summary_long` text,
	`who_should_apply` text,
	`cautions` text,
	`how_to_apply` text,
	`faq` text,
	`critic_score` integer,
	`critic_report` text,
	`published_status` text NOT NULL,
	`last_generated_at` integer,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `program_meta` (
	`program_id` integer PRIMARY KEY NOT NULL,
	`eligibility_structured` text,
	`similarity_embedding` blob,
	`fitness_axes` text,
	`last_year_diff` text,
	`competition_score` real,
	`difficulty_score` integer,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pblanc_id` text NOT NULL,
	`source` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`summary_short` text,
	`agency` text,
	`executor` text,
	`category_code` text,
	`application_start` integer,
	`application_end` integer,
	`status` text NOT NULL,
	`raw_url` text NOT NULL,
	`detail_pdf_url` text,
	`raw_json` text,
	`last_synced_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `programs_pblanc_id_unique` ON `programs` (`pblanc_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `programs_slug_unique` ON `programs` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_programs_status` ON `programs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_programs_application_end` ON `programs` (`application_end`);--> statement-breakpoint
CREATE INDEX `idx_programs_source` ON `programs` (`source`);--> statement-breakpoint
CREATE INDEX `idx_programs_slug` ON `programs` (`slug`);--> statement-breakpoint
CREATE TABLE `programs_industries` (
	`program_id` integer NOT NULL,
	`industry_id` integer NOT NULL,
	PRIMARY KEY(`program_id`, `industry_id`),
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`industry_id`) REFERENCES `industries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `programs_regions` (
	`program_id` integer NOT NULL,
	`region_id` integer NOT NULL,
	PRIMARY KEY(`program_id`, `region_id`),
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `programs_targets` (
	`program_id` integer NOT NULL,
	`target_id` integer NOT NULL,
	PRIMARY KEY(`program_id`, `target_id`),
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_id`) REFERENCES `targets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `regions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `regions_code_unique` ON `regions` (`code`);--> statement-breakpoint
CREATE TABLE `targets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `targets_code_unique` ON `targets` (`code`);