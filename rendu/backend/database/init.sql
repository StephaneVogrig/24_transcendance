
CREATE TABLE IF NOT EXISTS `users` (
	`id` INTEGER PRIMARY KEY AUTOINCREMENT,
	`nickname` TEXT UNIQUE NOT NULL,
	`email` TEXT NOT NULL UNIQUE,
	`picture` TEXT, -- URL avatar
	`givenName` TEXT, -- Prénom
	`familyName` TEXT, -- Nom de famille
	`provider` TEXT DEFAULT 'local' NOT NULL, -- 'local', 'google', 'auth0' ...
	`provider_id` TEXT UNIQUE, -- ID Auth0 unique
	`status` TEXT DEFAULT 'connected' NOT NULL  -- 'connected', 'deconnected'
);


CREATE TABLE IF NOT EXISTS `players` (
	`id` INTEGER PRIMARY KEY AUTOINCREMENT,
	`username` TEXT UNIQUE NOT NULL
);


CREATE TABLE IF NOT EXISTS `tournaments` (
	`id` INTEGER PRIMARY KEY AUTOINCREMENT,
	`data` TEXT NOT NULL
);
