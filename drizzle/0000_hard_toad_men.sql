CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`connection_id` text NOT NULL,
	`simplefin_account_id` text NOT NULL,
	`name` text NOT NULL,
	`currency` text NOT NULL,
	`balance` text NOT NULL,
	`available_balance` text,
	`balance_date` integer NOT NULL,
	`org_name` text,
	`org_domain` text,
	`org_sfin_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`connection_id`) REFERENCES `simplefin_connections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `simplefin_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`access_url` text NOT NULL,
	`created_at` integer NOT NULL,
	`revoked_at` integer
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`simplefin_transaction_id` text NOT NULL,
	`posted` integer NOT NULL,
	`amount` text NOT NULL,
	`description` text NOT NULL,
	`pending` integer DEFAULT 0,
	`transacted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_account_txn_unique` ON `transactions` (`account_id`,`simplefin_transaction_id`);