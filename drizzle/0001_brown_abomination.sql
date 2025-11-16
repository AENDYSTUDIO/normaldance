CREATE TABLE `donations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memorialId` int NOT NULL,
	`donorUserId` int,
	`amount` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`transactionHash` varchar(128),
	`paymentMethod` enum('crypto','telegram_stars','card') NOT NULL,
	`walletAddress` varchar(128),
	`message` text,
	`donorName` varchar(255),
	`isAnonymous` boolean NOT NULL DEFAULT false,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `donations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listeningHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackId` int NOT NULL,
	`playedDuration` int NOT NULL,
	`completionRate` int NOT NULL,
	`source` varchar(64),
	`playedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listeningHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memorials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistName` varchar(255) NOT NULL,
	`artistBio` text,
	`birthDate` timestamp,
	`deathDate` timestamp,
	`vinylImageUrl` text,
	`profileImageUrl` text,
	`smartContractAddress` varchar(128),
	`blockchainNetwork` enum('ethereum','polygon','solana'),
	`metadataIpfsCid` varchar(128),
	`totalDonations` int NOT NULL DEFAULT 0,
	`donationCount` int NOT NULL DEFAULT 0,
	`createdBy` int NOT NULL,
	`beneficiaryAddresses` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memorials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlistTracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playlistId` int NOT NULL,
	`trackId` int NOT NULL,
	`position` int NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `playlistTracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`coverImageUrl` text,
	`userId` int NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackId` int NOT NULL,
	`score` int NOT NULL,
	`reason` text,
	`wasPlayed` boolean NOT NULL DEFAULT false,
	`wasLiked` boolean NOT NULL DEFAULT false,
	`wasSkipped` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `telegramTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`telegramUserId` varchar(64) NOT NULL,
	`amount` int NOT NULL,
	`purpose` varchar(128) NOT NULL,
	`relatedMemorialId` int,
	`relatedTrackId` int,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `telegramTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`artist` varchar(255) NOT NULL,
	`album` varchar(255),
	`duration` int NOT NULL,
	`ipfsCid` varchar(128) NOT NULL,
	`coverImageUrl` text,
	`genre` varchar(64),
	`releaseYear` int,
	`description` text,
	`uploadedBy` int NOT NULL,
	`playCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `solanaAddress` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `tonAddress` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `ethereumAddress` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `telegramUserId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `telegramUsername` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `preferredWallet` enum('solana','ton','ethereum');