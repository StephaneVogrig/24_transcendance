import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

export function initDatabase()
{
	return open({
		filename: './ft_transcendence.sqlite',
		driver: sqlite3.Database
	});
}
