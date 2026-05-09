CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_info_id` text NOT NULL,
	`source` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`summary_short` text,
	`area_name` text,
	`event_type` text,
	`origin_org` text,
	`category_code` text,
	`reception_start` integer,
	`reception_end` integer,
	`event_start` integer,
	`event_end` integer,
	`status` text NOT NULL,
	`raw_url` text NOT NULL,
	`origin_url` text,
	`attachment_url` text,
	`attachment_name` text,
	`print_file_url` text,
	`print_file_name` text,
	`raw_json` text,
	`last_synced_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_event_info_id_unique` ON `events` (`event_info_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_events_status` ON `events` (`status`);--> statement-breakpoint
CREATE INDEX `idx_events_event_end` ON `events` (`event_end`);--> statement-breakpoint
CREATE INDEX `idx_events_source` ON `events` (`source`);--> statement-breakpoint
CREATE INDEX `idx_events_slug` ON `events` (`slug`);