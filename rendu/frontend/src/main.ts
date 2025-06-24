interface GameInfo {
  name: string;
  version: string;
  players: number;
  activeGames: number;
}

interface HealthStatus {
  status: string;
  service: string;
  uptime: number;
}

// API Helper
class API {
  private baseUrl = '/api';

  async getHealth(): Promise<HealthStatus> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }

  async getGameInfo(): Promise<GameInfo> {
    const response = await fetch(`${this.baseUrl}/game/info`);
    return response.json();
  }
}

// App Class
class TranscendanceApp {
  private api: API;
  private appContainer: HTMLElement;

  constructor() {
    this.api = new API();
    this.appContainer = document.getElementById('app')!;
    this.init();
  }

  private async init() {
    this.render();
    await this.loadServerStatus();
  }

  private render() {
    this.appContainer.innerHTML = `
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <header class="text-center mb-12">
          <h1 class="text-6xl font-bold mb-4 title-glow text-pong-blue">
            TRANSCENDENCE
          </h1>
          <p class="text-xl text-gray-300 mb-8">
            Le Pong ultime en temps réel
          </p>
          <div class="flex justify-center space-x-2">
            <div class="w-3 h-3 bg-pong-green rounded-full animate-pulse"></div>
            <div class="w-3 h-3 bg-pong-blue rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
            <div class="w-3 h-3 bg-pong-purple rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
          </div>
        </header>

        <!-- Status Cards -->
        <div class="grid md:grid-cols-2 gap-6 mb-12">
          <div class="card-pong">
            <h3 class="text-xl font-bold mb-4 text-pong-green">🚀 Statut du Serveur</h3>
            <div id="server-status" class="space-y-2">
              <div class="animate-pulse">Chargement...</div>
            </div>
          </div>
          
          <div class="card-pong">
            <h3 class="text-xl font-bold mb-4 text-pong-purple">🎮 Informations du Jeu</h3>
            <div id="game-info" class="space-y-2">
              <div class="animate-pulse">Chargement...</div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="text-center">
          <h2 class="text-3xl font-bold mb-8">Prêt à jouer ?</h2>
          <div class="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <button id="play-btn" class="btn-pong block md:inline-block">
              🏓 Jouer au Pong
            </button>
            <button id="tournament-btn" class="btn-pong block md:inline-block bg-pong-purple hover:bg-purple-600">
              🏆 Tournoi
            </button>
            <button id="scores-btn" class="btn-pong block md:inline-block bg-pong-green hover:bg-green-600">
              📊 Scores
            </button>
          </div>
        </div>

        <!-- Footer -->
        <footer class="text-center mt-16 text-gray-500">
          <p>&copy; 2025 Transcendence - Architecture Microservices</p>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents() {
    document.getElementById('play-btn')?.addEventListener('click', () => {
      this.showNotification('🎮 Mode jeu à venir !', 'info');
    });

    document.getElementById('tournament-btn')?.addEventListener('click', () => {
      this.showNotification('🏆 Tournois à venir !', 'info');
    });

    document.getElementById('scores-btn')?.addEventListener('click', () => {
      this.showNotification('📊 Système de scores à venir !', 'info');
    });
  }

  private async loadServerStatus() {
    try {
      const [health, gameInfo] = await Promise.all([
        this.api.getHealth(),
        this.api.getGameInfo()
      ]);

      // Mise à jour du statut serveur
      const statusElement = document.getElementById('server-status');
      if (statusElement) {
        statusElement.innerHTML = `
          <div class="flex justify-between">
            <span>Statut:</span>
            <span class="text-green-400 font-bold">${health.status.toUpperCase()}</span>
          </div>
          <div class="flex justify-between">
            <span>Service:</span>
            <span class="text-blue-400">${health.service}</span>
          </div>
          <div class="flex justify-between">
            <span>Uptime:</span>
            <span class="text-yellow-400">${Math.floor(health.uptime)}s</span>
          </div>
        `;
      }

      // Mise à jour des infos jeu
      const gameElement = document.getElementById('game-info');
      if (gameElement) {
        gameElement.innerHTML = `
          <div class="flex justify-between">
            <span>Nom:</span>
            <span class="text-pong-blue font-bold">${gameInfo.name}</span>
          </div>
          <div class="flex justify-between">
            <span>Version:</span>
            <span class="text-green-400">${gameInfo.version}</span>
          </div>
          <div class="flex justify-between">
            <span>Joueurs en ligne:</span>
            <span class="text-yellow-400">${gameInfo.players}</span>
          </div>
          <div class="flex justify-between">
            <span>Parties actives:</span>
            <span class="text-purple-400">${gameInfo.activeGames}</span>
          </div>
        `;
      }

      this.showNotification('✅ Connexion au serveur aétablie !', 'success');

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      this.showNotification('❌ Erreur de connexion au serveur', 'error');
    }a
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-600' : 
                   type === 'error' ? 'bg-red-600' : 'bg-blue-600';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Suppression après 3 secondes
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialisation de l'application
new TranscendanceApp();