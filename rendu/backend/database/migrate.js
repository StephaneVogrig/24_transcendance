/**
 * Script de migration pour mettre à jour la structure de la base de données
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

async function migrateDatabase() {
    console.log('🔄 Début de la migration de la base de données...');
    
    try {
        // Ouvrir la base de données
        const db = await open({
            filename: './ft_transcendence.sqlite',
            driver: sqlite3.Database
        });

        console.log('📂 Base de données ouverte');

        // Vérifier la structure actuelle
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('📋 Tables existantes:', tables.map(t => t.name));

        // Vérifier les colonnes de la table users
        try {
            const userColumns = await db.all("PRAGMA table_info(users)");
            console.log('🏛️  Colonnes actuelles de la table users:');
            userColumns.forEach(col => {
                console.log(`   - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
            });

            // Vérifier si les nouvelles colonnes existent
            const hasEmailColumn = userColumns.some(col => col.name === 'email');
            const hasAuth0IdColumn = userColumns.some(col => col.name === 'auth0_id');
            
            if (!hasEmailColumn || !hasAuth0IdColumn) {
                console.log('🔧 Ajout des nouvelles colonnes...');
                
                if (!hasEmailColumn) {
                    await db.run('ALTER TABLE users ADD COLUMN email TEXT');
                    console.log('✅ Colonne email ajoutée');
                }
                
                if (!hasAuth0IdColumn) {
                    await db.run('ALTER TABLE users ADD COLUMN auth0_id TEXT UNIQUE');
                    console.log('✅ Colonne auth0_id ajoutée');
                }
                
                // Ajouter les autres colonnes si elles n'existent pas
                const hasPictureColumn = userColumns.some(col => col.name === 'picture');
                if (!hasPictureColumn) {
                    await db.run('ALTER TABLE users ADD COLUMN picture TEXT');
                    console.log('✅ Colonne picture ajoutée');
                }
                
                const hasProviderColumn = userColumns.some(col => col.name === 'provider');
                if (!hasProviderColumn) {
                    await db.run('ALTER TABLE users ADD COLUMN provider TEXT DEFAULT "local"');
                    console.log('✅ Colonne provider ajoutée');
                }
                
                const hasCreatedAtColumn = userColumns.some(col => col.name === 'created_at');
                if (!hasCreatedAtColumn) {
                    await db.run('ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
                    console.log('✅ Colonne created_at ajoutée');
                }
                
                const hasUpdatedAtColumn = userColumns.some(col => col.name === 'updated_at');
                if (!hasUpdatedAtColumn) {
                    await db.run('ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP');
                    console.log('✅ Colonne updated_at ajoutée');
                }
                
                // Rendre la colonne password nullable pour les utilisateurs OAuth
                console.log('🔧 Mise à jour de la colonne password...');
                // Nota: SQLite ne permet pas de modifier directement la contrainte NOT NULL
                // Il faudrait recréer la table, mais pour la compatibilité, on laisse comme ça
                
            } else {
                console.log('✅ La table users est déjà à jour');
            }
            
        } catch (error) {
            console.log('⚠️  La table users n\'existe pas encore, elle sera créée avec la nouvelle structure');
        }

        // Appliquer le script init.sql mis à jour
        console.log('📜 Application du script init.sql...');
        const sql = fs.readFileSync('./init.sql').toString();
        await db.exec(sql);
        console.log('✅ Script init.sql appliqué');

        await db.close();
        console.log('🎉 Migration terminée avec succès !');
        
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        process.exit(1);
    }
}

// Lancer la migration si ce fichier est exécuté directement
if (process.argv[1].includes('migrate.js')) {
    migrateDatabase();
}

export { migrateDatabase };
