export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'local';
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  action?: 'login' | 'register';
}
