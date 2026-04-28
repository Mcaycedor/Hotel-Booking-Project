export interface AuthUser {
  id: string;
  email: string;
  name: string;
  userType: 'guest' | 'employee' | 'registered';
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  userType: 'employee' | 'registered';
  company?: string;
}
