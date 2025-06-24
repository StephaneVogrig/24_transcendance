import HTML_home from './html/home.html?raw';
import HTML_login from './html/login.html?raw';

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
    this.renderLogin();
    await this.loadServerStatus();
  }

  private renderLogin() {
	this.appContainer.innerHTML = HTML_login;
	this.bindEvents();
  }

  private renderHome() {
    this.appContainer.innerHTML = HTML_home;
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
    }
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