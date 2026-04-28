import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { IAuthService } from '../models/auth.interface';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements IAuthService {
  private currentUser$ = new BehaviorSubject<AuthUser | null>(null);
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private authError$ = new BehaviorSubject<string | null>(null);

  constructor() {
    // Check for existing session on init
    this.checkSession();
  }

  private checkSession(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUser$.next(user);
        this.isAuthenticated$.next(true);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }

  loginAsGuest(): Observable<AuthUser> {
    const guestUser: AuthUser = {
      id: `guest-${Date.now()}`,
      email: 'guest@example.com',
      name: 'Guest User',
      userType: 'guest',
      createdAt: new Date(),
    };

    return of(guestUser).pipe(
      delay(1000),
      tap((user) => this.persistUser(user))
    );
  }

  login(credentials: LoginCredentials): Observable<AuthUser> {
    // Mock authentication
    if (!credentials.email || !credentials.password) {
      this.authError$.next('Email and password are required');
      return of(null as any);
    }

    const user: AuthUser = {
      id: `emp-${Date.now()}`,
      email: credentials.email,
      name: credentials.email.split('@')[0],
      userType: 'employee',
      createdAt: new Date(),
    };

    return of(user).pipe(
      delay(1500),
      tap((user) => this.persistUser(user))
    );
  }

  register(credentials: RegisterCredentials): Observable<AuthUser> {
    if (!credentials.email || !credentials.password || !credentials.name) {
      this.authError$.next('All fields are required');
      return of(null as any);
    }

    const user: AuthUser = {
      id: `user-${Date.now()}`,
      email: credentials.email,
      name: credentials.name,
      userType: credentials.userType,
      createdAt: new Date(),
    };

    return of(user).pipe(
      delay(1500),
      tap((user) => this.persistUser(user))
    );
  }

  logout(): void {
    this.currentUser$.next(null);
    this.isAuthenticated$.next(false);
    this.authError$.next(null);
    localStorage.removeItem('user');
  }

  getCurrentUser(): Observable<AuthUser | null> {
    return this.currentUser$.asObservable();
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  getAuthError(): Observable<string | null> {
    return this.authError$.asObservable();
  }

  setError(error: string | null): void {
    this.authError$.next(error);
  }

  private persistUser(user: AuthUser): void {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUser$.next(user);
      this.isAuthenticated$.next(true);
      this.authError$.next(null);
    }
  }
}
