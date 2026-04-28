# Authentication System

## Overview

The GEN Platform includes a comprehensive authentication system supporting three user types: **Guest**, **Employee**, and **Registered Users**.

---

## User Types

### Guest User 👥
- Try platform without account creation
- Access to home page and one assessment
- Session-only (cleared on logout)
- No account persistence

### Employee 👨‍💼
- Company-specific access
- Persistent account
- Multiple assessments
- Advanced analytics

### Registered User 📋
- Individual accounts
- Unlimited assessments
- Assessment history & tracking
- Progress trends

---

## Components

**AuthComponent** (`libs/web/components/src/lib/auth/`)
- Multi-mode form (welcome, login, register)
- CGI branding with logo
- Form validation and error handling

**AuthService** (`libs/web/data-access/src/lib/services/auth.service.ts`)
- Injectable service with observable state
- Methods: `loginAsGuest()`, `login()`, `register()`, `logout()`
- localStorage persistence

**Auth Models** (`libs/web/data-access/src/lib/models/auth.model.ts`)
- `AuthUser` interface
- `LoginCredentials` and `RegisterCredentials` interfaces

---

## Usage in Components

```typescript
import { AuthService } from '@app/web-data-access';

@Component({
  selector: 'app-example',
  standalone: true,
})
export class ExampleComponent {
  currentUser$ = this.authService.getCurrentUser();
  isAuth$ = this.authService.isAuthenticated();

  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
```

---

## Session Management

- **Storage**: localStorage with key `'user'`
- **Persistence**: Survives page refresh
- **Cleanup**: Cleared on logout
- **Recovery**: Auto-loads on service init

---

## Security Notes (Demo)

⚠️ Current implementation is for demo/development:
- No server-side validation
- Passwords not encrypted
- Mock delays (1s guest, 1.5s login/register)

**Production Requirements**:
- Backend API validation
- HTTPS only
- JWT tokens in HttpOnly cookies
- Rate limiting
- Password hashing (bcrypt)
- Session timeout
- 2FA support
