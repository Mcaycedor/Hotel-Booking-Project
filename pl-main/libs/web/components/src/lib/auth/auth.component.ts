import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/web-data-access';

type AuthMode = 'login' | 'register' | 'welcome';

/**
 * Authentication component with guest, employee, and registered login
 */
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <!-- Logo -->
        <div class="logo-section">
          <img src="https://www.cgi.com/en/-/media/cgi/images/logos/logo-cgi-share-image.png" 
               alt="CGI Logo" 
               class="cgi-logo">
          <h1>GEN Platform</h1>
        </div>

        <!-- Welcome Tab -->
        <div *ngIf="authMode === 'welcome'" class="auth-form welcome-form">
          <h2>Welcome to GEN Platform</h2>
          <p class="subtitle">AI-Powered Profile Matching & Assessment</p>

          <div class="button-group">
            <button (click)="authMode = 'login'" class="btn btn-primary btn-lg">
              👤 Employee Login
            </button>
            <button (click)="authMode = 'register'" class="btn btn-secondary btn-lg">
              📝 Register
            </button>
            <button (click)="loginAsGuest()" class="btn btn-outline btn-lg">
              👥 Continue as Guest
            </button>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <h3>👨‍💼 Employee</h3>
              <p>Access company-specific assessments and evaluations</p>
            </div>
            <div class="info-card">
              <h3>📋 Registered User</h3>
              <p>Create an account to track your assessments</p>
            </div>
            <div class="info-card">
              <h3>👥 Guest</h3>
              <p>Try the platform without creating an account</p>
            </div>
          </div>
        </div>

        <!-- Login Form -->
        <div *ngIf="authMode === 'login'" class="auth-form">
          <h2>Employee Login</h2>

          <div class="form-group">
            <label for="login-email">Email</label>
            <input
              id="login-email"
              [(ngModel)]="loginForm.email"
              type="email"
              placeholder="your.email@company.com"
              class="form-control"
              [disabled]="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="login-password">Password</label>
            <input
              id="login-password"
              [(ngModel)]="loginForm.password"
              type="password"
              placeholder="••••••••"
              class="form-control"
              [disabled]="isLoading"
            />
          </div>

          <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

          <button (click)="loginWithCredentials()" [disabled]="isLoading" class="btn btn-primary btn-block">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>

          <div class="form-footer">
            <button (click)="authMode = 'welcome'" class="btn-link">
              ← Back
            </button>
          </div>
        </div>

        <!-- Register Form -->
        <div *ngIf="authMode === 'register'" class="auth-form">
          <h2>Create Account</h2>

          <div class="form-group">
            <label for="register-name">Full Name</label>
            <input
              id="register-name"
              [(ngModel)]="registerForm.name"
              type="text"
              placeholder="John Doe"
              class="form-control"
              [disabled]="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="register-email">Email</label>
            <input
              id="register-email"
              [(ngModel)]="registerForm.email"
              type="email"
              placeholder="john@example.com"
              class="form-control"
              [disabled]="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="register-password">Password</label>
            <input
              id="register-password"
              [(ngModel)]="registerForm.password"
              type="password"
              placeholder="••••••••"
              class="form-control"
              [disabled]="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="register-type">User Type</label>
            <select
              id="register-type"
              [(ngModel)]="registerForm.userType"
              class="form-control"
              [disabled]="isLoading"
            >
              <option value="registered">Registered User</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

          <button (click)="registerNewUser()" [disabled]="isLoading" class="btn btn-primary btn-block">
            {{ isLoading ? 'Creating account...' : 'Create Account' }}
          </button>

          <div class="form-footer">
            <button (click)="authMode = 'welcome'" class="btn-link">
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .auth-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 100%;
      overflow: hidden;
    }

    .logo-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }

    .cgi-logo {
      width: 120px;
      height: auto;
      margin-bottom: 1rem;
      background: white;
      padding: 0.5rem;
      border-radius: 8px;
    }

    .logo-section h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .auth-form {
      padding: 2rem;
    }

    .welcome-form {
      text-align: center;
    }

    .auth-form h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      color: #333;
    }

    .subtitle {
      color: #666;
      margin-bottom: 2rem;
      font-size: 0.875rem;
    }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
      font-size: 0.875rem;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #dee2e6;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      font-size: 1rem;
    }

    .btn-primary {
      background-color: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background-color: #764ba2;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #63398d;
      transform: translateY(-2px);
    }

    .btn-outline {
      background-color: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-outline:hover:not(:disabled) {
      background-color: #f8f9fa;
      transform: translateY(-2px);
    }

    .btn-lg {
      padding: 1rem 1.5rem;
      font-size: 1rem;
    }

    .btn-block {
      width: 100%;
    }

    .btn-link {
      background: none;
      border: none;
      color: #667eea;
      cursor: pointer;
      font-weight: 500;
      padding: 0;
      text-decoration: underline;
    }

    .btn-link:hover {
      color: #5568d3;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .alert {
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .alert-danger {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }

    .info-card {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }

    .info-card h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
    }

    .info-card p {
      margin: 0;
      font-size: 0.75rem;
      color: #666;
    }

    .form-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }
  `],
})
export class AuthComponent implements OnInit {
  authMode: AuthMode = 'welcome';
  isLoading = false;
  error: string | null = null;

  loginForm = {
    email: '',
    password: '',
  };

  registerForm = {
    name: '',
    email: '',
    password: '',
    userType: 'registered' as 'employee' | 'registered',
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if already authenticated
    this.authService.isAuthenticated().subscribe((isAuth) => {
      if (isAuth) {
        this.router.navigate(['/']);
      }
    });
  }

  loginAsGuest(): void {
    this.isLoading = true;
    this.authService.loginAsGuest().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = 'Failed to login as guest';
        this.isLoading = false;
      },
    });
  }

  loginWithCredentials(): void {
    this.isLoading = true;
    this.error = null;
    this.authService.login(this.loginForm).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = 'Login failed. Please check your credentials.';
        this.isLoading = false;
      },
    });
  }

  registerNewUser(): void {
    this.isLoading = true;
    this.error = null;
    this.authService.register(this.registerForm).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = 'Registration failed. Please try again.';
        this.isLoading = false;
      },
    });
  }
}
