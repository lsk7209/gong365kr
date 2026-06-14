CREATE TABLE `facet_counts` (
	`facet_type` text NOT NULL,
	`facet_key` text NOT NULL,
	`label` text,
	`count` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`facet_type`, `facet_key`)
);
