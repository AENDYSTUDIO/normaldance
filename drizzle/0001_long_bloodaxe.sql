CREATE TABLE `graveMemorials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int NOT NULL,
	`creatorId` int NOT NULL,
	`dedicatedTo` varchar(255) NOT NULL,
	`message` text,
	`vinylColor` varchar(7) NOT NULL DEFAULT '#8B5CF6',
	`candleCount` int NOT NULL DEFAULT 27,
	`smartContractAddress` varchar(128),
	`ipfsMetadataUri` text,
	`totalDonations` int NOT NULL DEFAULT 0,
	`platformFee` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `graveMemorials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nfts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int,
	`ownerId` int NOT NULL,
	`creatorId` int NOT NULL,
	`tokenId` varchar(128),
	`contractAddress` varchar(128),
	`blockchain` enum('ethereum','solana','polygon') NOT NULL,
	`mintPrice` int NOT NULL DEFAULT 0,
	`currentPrice` int NOT NULL DEFAULT 0,
	`metadataUri` text,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nfts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlistTracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playlistId` int NOT NULL,
	`trackId` int NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `playlistTracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`userId` int NOT NULL,
	`coverImageUrl` text,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stakingPositions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stakedAmount` int NOT NULL DEFAULT 0,
	`rewardAmount` int NOT NULL DEFAULT 0,
	`stakingPeriod` enum('30days','90days','180days','365days') NOT NULL,
	`apy` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp NOT NULL,
	`lastClaimDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stakingPositions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`artist` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`ipfsCid` varchar(128),
	`ipfsMetadataCid` varchar(128),
	`duration` int NOT NULL DEFAULT 0,
	`genre` varchar(64),
	`coverImageUrl` text,
	`playCount` int NOT NULL DEFAULT 0,
	`likeCount` int NOT NULL DEFAULT 0,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('deposit','withdrawal','transfer','stake','unstake','nft_purchase','donation') NOT NULL,
	`amount` int NOT NULL DEFAULT 0,
	`currency` varchar(16) NOT NULL DEFAULT 'NDT',
	`txHash` varchar(128),
	`blockchain` varchar(32),
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`relatedEntityType` varchar(32),
	`relatedEntityId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userActivity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackId` int,
	`activityType` enum('play','like','share','comment','upload') NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userActivity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `solanaAddress` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `ethereumAddress` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `tonAddress` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `telegramId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `telegramUsername` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `userLevel` enum('BRONZE','SILVER','GOLD','PLATINUM') DEFAULT 'BRONZE' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalListens` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalUploads` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `ndtBalance` int DEFAULT 0 NOT NULL;