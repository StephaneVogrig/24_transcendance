#!/usr/bin/env node

/**
 * Script de test pour les APIs de tournoi
 */

const API_URL = 'http://localhost:3007';

async function testTournamentAPI() {
    console.log('🧪 Test des APIs de tournoi...\n');

    try {
        // Test 1: Vérifier que le service est en marche
        console.log('1️⃣ Test de connexion au service...');
        const statusResponse = await fetch(`${API_URL}/api/tournament`);
        if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log('✅ Service accessible:', statusData.message);
        } else {
            console.log('❌ Service non accessible:', statusResponse.status);
            return;
        }

        // Test 2: Récupérer tous les tournois
        console.log('\n2️⃣ Test récupération de tous les tournois...');
        const allTournamentsResponse = await fetch(`${API_URL}/api/tournament/getAll`);
        if (allTournamentsResponse.ok) {
            const tournaments = await allTournamentsResponse.json();
            console.log('✅ Tournois récupérés:', tournaments.length, 'tournoi(s)');
            if (tournaments.length > 0) {
                console.log('   Premier tournoi:', tournaments[0]);
            }
        } else {
            const error = await allTournamentsResponse.json();
            console.log('❌ Erreur récupération tournois:', error);
        }

        // Test 3: Récupérer un tournoi spécifique
        console.log('\n3️⃣ Test récupération d\'un tournoi spécifique...');
        const specificTournamentResponse = await fetch(`${API_URL}/api/tournament/get?id=0`);
        if (specificTournamentResponse.ok) {
            const tournament = await specificTournamentResponse.json();
            console.log('✅ Tournoi spécifique récupéré:', tournament);
        } else {
            const error = await specificTournamentResponse.json();
            console.log('❌ Erreur récupération tournoi spécifique:', error);
        }

        // Test 4: Créer un nouveau tournoi
        console.log('\n4️⃣ Test création d\'un nouveau tournoi...');
        const createResponse = await fetch(`${API_URL}/api/tournament/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'TestPlayerAPI' })
        });
        if (createResponse.ok) {
            const newTournament = await createResponse.json();
            console.log('✅ Nouveau tournoi créé:', newTournament);
        } else {
            const error = await createResponse.json();
            console.log('❌ Erreur création tournoi:', error);
        }

        console.log('\n🎉 Tests terminés !');

    } catch (error) {
        console.error('❌ Erreur générale:', error);
    }
}

// Exécuter les tests
testTournamentAPI();
