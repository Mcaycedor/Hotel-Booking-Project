# Feature Testing Guide

## Quick Start

```bash
pnpm nx serve web
# Opens http://localhost:4300
```

---

## Testing Scenarios

### Guest Login
1. Open http://localhost:4300
2. Click "Continue as Guest"
3. Verify: Redirects to home page, shows "Guest User" with GUEST badge
4. Click logout → Returns to /auth

### Employee Login
1. Click "Employee Login" tab
2. Enter any email and password (e.g., `employee@company.com` / `password123`)
3. Verify: Shows as EMPLOYEE, persists in navbar
4. Refresh page → Session persists
5. Logout → Returns to /auth

### User Registration
1. Click "Register" button
2. Fill form: Name, Email, Password, Account Type
3. Click "Create Account"
4. Verify: Auto-login, shows REGISTERED badge
5. Refresh page → Session persists

---

## Verification Checklist

### Home Page
- [ ] CGI logo visible (top-left)
- [ ] Navbar sticky/fixed
- [ ] Hero section with CTA buttons
- [ ] 6 feature cards in responsive grid
- [ ] 3 user type cards (current user's highlighted)
- [ ] Footer with links

### Navigation
- [ ] "Start Assessment" button navigates to /assessment
- [ ] Logo/brand clicks redirect home
- [ ] User menu shows logout
- [ ] All links functional

### Responsive Design
- [ ] Mobile (480px): Single column layout
- [ ] Tablet (768px): 2 column grid
- [ ] Desktop (1920px): 3 column grid
- [ ] No horizontal scrolling on mobile

### Styling
- [ ] Purple gradient theme visible
- [ ] Buttons have hover effects
- [ ] User type badges show correct colors
- [ ] Professional appearance

---

## localStorage Inspection

**DevTools** (F12):
1. Application → Storage → Local Storage
2. Look for `user` key
3. Contains JSON with: id, email, name, userType, createdAt

**Clear session**:
- Delete `user` key → Page redirects to /auth on next load
