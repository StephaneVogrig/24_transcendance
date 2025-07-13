CREATE TABLE IF NOT EXISTS `users` (
	`id` INTEGER PRIMARY KEY AUTOINCREMENT,
	`username` TEXT UNIQUE NOT NULL,
	`password` TEXT, -- Nullable pour les utilisateurs OAuth
	`email` TEXT,
	`auth0_id` TEXT UNIQUE, -- ID Auth0 unique
	`picture` TEXT, -- URL de l'avatar
	`provider` TEXT DEFAULT 'local', -- 'local', 'google', 'auth0', etc.
	`created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `tournaments` (
	`id` INTEGER PRIMARY KEY,
	`data` TEXT NOT NULL
);
