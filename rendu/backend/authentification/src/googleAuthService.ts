import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { GoogleUser, User, AuthResponse } from './types.js';
import { UserService } from './userService.js';

export class GoogleAuthService {
  private oauth2Client: any;
  private readonly JWT_SECRET: string;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback'
    );
  }

  // Générer l'URL d'autorisation Google
  getAuthUrl(action: 'login' | 'register' = 'login'): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      state: action // Utiliser le paramètre state pour différencier login/register
    });
  }

  // Échanger le code d'autorisation contre les tokens
  async exchangeCodeForTokens(code: string, action: 'login' | 'register' = 'login'): Promise<AuthResponse> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Obtenir les informations de l'utilisateur
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();

      const googleUser: GoogleUser = {
        id: data.id!,
        email: data.email!,
        name: data.name!,
        picture: data.picture || '',
        verified_email: data.verified_email || false
      };

      // Vérifier si l'utilisateur existe déjà
      let user = await UserService.findByGoogleId(googleUser.id);
      
      if (action === 'register') {
        // Pour l'enregistrement, vérifier que l'utilisateur n'existe pas déjà
        if (user) {
          return {
            success: false,
            message: 'Un compte avec ce Google ID existe déjà. Utilisez la connexion à la place.'
          };
        }
        
        // Vérifier si un utilisateur avec le même email existe
        const existingUser = await UserService.findByEmail(googleUser.email);
        if (existingUser) {
          return {
            success: false,
            message: 'Un compte avec cet email existe déjà. Utilisez la connexion à la place.'
          };
        }
        
        // Créer un nouveau utilisateur pour l'enregistrement
        user = await UserService.createFromGoogle(googleUser);
      } else {
        // Pour la connexion (logic existante)
        if (!user) {
          // Vérifier si un utilisateur avec le même email existe
          const existingUser = await UserService.findByEmail(googleUser.email);
          
          if (existingUser) {
            // Lier le compte Google au compte existant
            user = await UserService.updateUser(existingUser.id, {
              googleId: googleUser.id,
              picture: googleUser.picture,
              provider: 'google'
            });
          } else {
            return {
              success: false,
              message: 'Aucun compte trouvé. Veuillez vous enregistrer d\'abord.'
            };
          }
        } else {
          // Mettre à jour les informations de l'utilisateur existant
          user = await UserService.updateUser(user.id, {
            name: googleUser.name,
            picture: googleUser.picture,
            email: googleUser.email
          });
        }
      }

      if (!user) {
        return {
          success: false,
          message: 'Erreur lors de la création/mise à jour de l\'utilisateur'
        };
      }

      // Générer un JWT token
      const token = this.generateJWT(user);

      return {
        success: true,
        user,
        token,
        action
      };

    } catch (error) {
      console.error('Erreur lors de l\'authentification Google:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'authentification Google'
      };
    }
  }

  // Générer un token JWT
  private generateJWT(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name
      },
      this.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Vérifier un token JWT
  verifyJWT(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}
