# Developer Reference - Authentication

## File Structure

```
libs/web/
├── components/
│   └── src/lib/auth/
│       └── auth.component.ts          ← Main auth UI
├── data-access/
│   └── src/lib/
│       ├── services/
│       │   └── auth.service.ts        ← Auth logic
│       └── models/
│           └── auth.model.ts          ← Types
```

---

## AuthService Methods

```typescript
loginAsGuest(): Observable<AuthUser>
// Creates temporary guest session (1s delay)

login(credentials: LoginCredentials): Observable<AuthUser>
// Employee/registered login (1.5s delay)

register(credentials: RegisterCredentials): Observable<AuthUser>
// New user registration (1.5s delay)

logout(): void
// Clears session and localStorage

getCurrentUser(): Observable<AuthUser | null>
// Returns current user observable

isAuthenticated(): Observable<boolean>
// Returns auth status

getAuthError(): Observable<string | null>
// Returns error message if any
```

---

## AuthComponent Modes

- `welcome`: Shows three auth options + user type info
- `login`: Email/password login form
- `register`: Registration form with user type selector

---

## Using in Components

```typescript
// Inject AuthService
constructor(private authService: AuthService) {}

// Subscribe to current user
this.authService.getCurrentUser().subscribe(user => {
  if (user) {
    console.log('Logged in as:', user.name);
  }
});

// Check authentication
this.authService.isAuthenticated().subscribe(isAuth => {
  if (!isAuth) {
    this.router.navigate(['/auth']);
  }
});

// Logout
logout() {
  this.authService.logout();
  this.router.navigate(['/auth']);
}
```

---

## Template Usage

```html
<!-- Show user info if authenticated -->
<div *ngIf="(authService.getCurrentUser() | async) as user">
  <p>Welcome, {{ user.name }}</p>
  <span class="badge" [class]="'badge-' + user.userType">
    {{ user.userType | uppercase }}
  </span>
</div>

<!-- Show loading state -->
<div *ngIf="(authService.isAuthenticated() | async); else notAuth">
  <app-dashboard></app-dashboard>
</div>
<ng-template #notAuth>
  <p>Please log in</p>
</ng-template>
```

---

## Route Guards (Optional)

```typescript
// Protect authenticated routes
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    take(1),
    map(isAuth => isAuth ? true : (router.navigate(['/auth']), false))
  );
};

// Usage in routes
{ path: 'assessment', component: AssessmentComponent, canActivate: [authGuard] }
```

---

## Data Models

```typescript
interface AuthUser {
  id: string;
  email: string;
  name: string;
  userType: 'guest' | 'employee' | 'registered';
  createdAt: Date;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
  userType: 'employee' | 'registered';
  company?: string;
}
```

---

## Testing Utilities

```typescript
// Mock implementation for tests
@Injectable()
export class MockAuthService {
  private mockUser = new BehaviorSubject<AuthUser | null>(null);

  getCurrentUser() {
    return this.mockUser.asObservable();
  }

  setMockUser(user: AuthUser | null) {
    this.mockUser.next(user);
  }

  isAuthenticated() {
    return of(this.mockUser.value !== null);
  }
}

// Provide in test
TestBed.configureTestingModule({
  providers: [{ provide: AuthService, useClass: MockAuthService }]
});
```

---

## Common Patterns

### Display Current User in Navbar
```typescript
currentUser$ = this.authService.getCurrentUser();

logout() {
  this.authService.logout();
  this.router.navigate(['/auth']);
}
```

### Combine Auth with Other Observables
```typescript
userWithPermissions$ = combineLatest([
  this.authService.getCurrentUser(),
  this.permissionsService.getPermissions()
]).pipe(
  map(([user, permissions]) => ({ user, permissions }))
);
```

### Auto-logout on Inactivity
```typescript
this.userActivity$ = merge(
  fromEvent(document, 'click'),
  fromEvent(document, 'keydown')
).pipe(
  debounceTime(900000), // 15 minutes
  switchMap(() => this.authService.logout())
);
```

---

## Debugging

```javascript
// In browser console
localStorage.getItem('user')           // View stored user
JSON.parse(localStorage.getItem('user')) // Parse JSON
localStorage.removeItem('user')         // Clear session
```

---

## Future Enhancements

- Email verification
- Password reset
- OAuth integration (Google, GitHub)
- Two-factor authentication
- User profile management
- Session analytics
- Role-based access control (RBAC)
