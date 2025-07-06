import { User, GoogleUser } from './types';

// Simulation d'une base de données en mémoire
// En production, ceci devrait être remplacé par une vraie base de données
const users: Map<string, User> = new Map();

export class UserService {
  static async findByEmail(email: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  static async findByGoogleId(googleId: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.googleId === googleId) {
        return user;
      }
    }
    return null;
  }

  static async findById(id: string): Promise<User | null> {
    return users.get(id) || null;
  }

  static async createFromGoogle(googleUser: GoogleUser): Promise<User> {
    const user: User = {
      id: this.generateId(),
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      provider: 'google',
      googleId: googleUser.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.set(user.id, user);
    return user;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = users.get(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };

    users.set(id, updatedUser);
    return updatedUser;
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Méthode pour obtenir tous les utilisateurs (pour le debug)
  static getAllUsers(): User[] {
    return Array.from(users.values());
  }
}
