-- CREATE TABLE IF NOT EXISTS `users` (
-- 	`id` INTEGER PRIMARY KEY AUTOINCREMENT,
-- 	`username` TEXT UNIQUE NOT NULL,
-- 	`password` TEXT NOT NULL
-- );
CREATE TABLE IF NOT EXISTS `users` (
	`id` INTEGER PRIMARY KEY AUTOINCREMENT,
	`nickname` TEXT UNIQUE NOT NULL,
	`password` TEXT, -- Nullable pour les utilisateurs OAuth
	`email` TEXT NOT NULL UNIQUE,
	`picture` TEXT, -- URL de l'avatar
	`givenName` TEXT, -- Prénom
	`familyName` TEXT, -- Nom de famille
	`provider` TEXT DEFAULT 'local' NOT NULL, -- 'local', 'google', 'auth0', etc.
	`provider_id` TEXT UNIQUE, -- ID Auth0 unique
	`status` TEXT DEFAULT 'connected' NOT NULL  -- 'connected', 'deconnected'
);


CREATE TABLE IF NOT EXISTS `players` (
	`id` INTEGER PRIMARY KEY AUTOINCREMENT,
	`username` TEXT UNIQUE NOT NULL
);


CREATE TABLE IF NOT EXISTS `tournaments` (
	`id` INTEGER PRIMARY KEY,
	`data` TEXT NOT NULL
);
