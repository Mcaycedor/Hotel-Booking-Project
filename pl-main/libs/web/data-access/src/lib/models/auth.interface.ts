import { Observable } from 'rxjs';
import { AuthUser, LoginCredentials, RegisterCredentials } from './auth.model';

/**
 * Interface for authentication service.
 */
export interface IAuthService {
  /**
   * Logs in a user as a guest.
   */
  loginAsGuest(): Observable<AuthUser>;

  /**
   * Logs in a user with credentials.
   */
  login(credentials: LoginCredentials): Observable<AuthUser>;

  /**
   * Registers a new user.
   */
  register(credentials: RegisterCredentials): Observable<AuthUser>;

  /**
   * Logs out the current user.
   */
  logout(): void;

  /**
   * Gets the current authenticated user.
   */
  getCurrentUser(): Observable<AuthUser | null>;

  /**
   * Checks if the user is authenticated.
   */
  isAuthenticated(): Observable<boolean>;

  /**
   * Gets the current authentication error.
   */
  getAuthError(): Observable<string | null>;

  /**
   * Sets an authentication error.
   */
  setError(error: string | null): void;
}
