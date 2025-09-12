# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development Setup
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies  
cd client && npm install

# Setup environment variables (server)
cd server && cp .env.example .env
# Edit .env with your configuration
```

### Running the Application
```bash
# Start backend server (development)
cd server && npm run dev

# Start backend server (production)
cd server && npm start

# Start frontend client
cd client && npm run dev

# Build frontend for production
cd client && npm run build

# Preview production build
cd client && npm run preview
```

### Code Quality
```bash
# Lint frontend code
cd client && npm run lint
```

### Testing & Verification
```bash
# Check server status
curl http://localhost:5000/api/status

# Test authentication flow (requires proper .env setup)
node check-server.js
node test-auth.js
```

### Single Test/Route Testing
```bash
# Test specific API endpoint using curl
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123!"}'

# For individual component testing, navigate to specific files and run relevant checks
```

## Architecture Overview

### Project Structure
This is a **full-stack MERN authentication application** with a **monorepo structure**:

- `server/` - Express.js REST API backend with comprehensive auth features
- `client/` - React.js frontend with Vite build system  
- Root level contains shared configuration and testing utilities

### Backend Architecture (server/)

**Layered Architecture Pattern:**
- **Models** (`models/`) - Mongoose schemas with built-in methods for user management, sessions, MFA
- **Controllers** (`controllers/`) - Business logic handlers for auth, user, MFA, OAuth, sessions
- **Services** (`services/`) - Core business logic (auth operations, email sending, MFA handling)
- **Routes** (`routes/`) - Express route definitions with middleware integration
- **Middleware** (`middleware/`) - Authentication, CSRF protection, rate limiting, analytics
- **Repository** (`repository/`) - Data access layer abstraction
- **Validators** (`validators/`) - Joi-based input validation schemas
- **Config** (`config/`) - Database, email, Passport, Redis configurations

**Key Backend Features:**
- **JWT + Refresh Token Authentication** with secure HTTP-only cookies
- **Multi-Factor Authentication (MFA)** with TOTP and backup codes
- **OAuth Integration** (Google, GitHub, Facebook) via Passport.js
- **Session Management** with device tracking and concurrent session limits
- **Account Security** - Failed login attempts, account locking, rate limiting
- **Email Service** - OTP verification, password reset, welcome emails via Nodemailer + Brevo
- **CSRF Protection** with session-based tokens
- **Comprehensive Security** - Helmet, CORS, rate limiting, input validation

### Frontend Architecture (client/)

**React Component Architecture:**
- **Context Providers** (`context/`) - Global state management for auth, theme, app state
- **Custom Hooks** (`hooks/`) - Authentication logic, session management
- **Components** (`components/`) - Reusable UI components (Header, ThemeToggle)
- **Pages** (`pages/`) - Route-specific page components
- **API Layer** (`lib/api.js`) - Centralized HTTP client with interceptors
- **Utilities** (`lib/utils.js`) - Helper functions and common utilities

**Frontend Tech Stack:**
- **React 19** with modern hooks and context patterns
- **Vite** for fast development and optimized production builds
- **React Router** for client-side routing
- **Tailwind CSS** with shadcn/ui components
- **Axios** for HTTP requests with authentication interceptors
- **Clerk** integration for enhanced authentication flows

### Database Schema

**User Model** - Comprehensive user management:
- Basic auth (email, password with bcrypt)
- Account verification (OTP-based email verification)
- Password reset functionality
- Account security (login attempts, account locking)
- MFA support (TOTP secrets, backup codes)
- Session tracking (device info, IP addresses, user agents)
- Social auth integration (Google, GitHub profiles)
- Refresh token management

**Session Model** - Device and session tracking with MongoDB TTL indexes

### Security Implementation

**Multi-layered Security Approach:**
- **Authentication** - JWT access tokens (30min) + refresh tokens (7 days)
- **Session Security** - HTTP-only cookies, secure flags, SameSite protection
- **CSRF Protection** - Session-based CSRF tokens with configurable bypass
- **Rate Limiting** - API-wide and login-specific rate limiting
- **Account Protection** - Brute force protection, account locking mechanisms
- **Input Validation** - Comprehensive Joi schemas for all inputs
- **Security Headers** - Helmet.js for production security headers

### Email System

**Professional Email Templates:**
- Welcome emails for new registrations
- OTP verification emails (account verification, password reset)
- Responsive HTML templates with security warnings
- Brevo SMTP integration with fallback handling

### Development Environment

**Environment Configuration:**
- Development CORS allowing any origin for flexibility
- Production CORS with specific allowlisted origins
- Environment-specific cookie settings (secure flags, SameSite)
- Conditional CSRF protection (can be disabled for testing)
- MongoDB session store with TTL cleanup

### API Design

**RESTful API Structure:**
- `/api/auth/*` - Authentication endpoints (register, login, verify, reset)  
- `/api/user/*` - User management (profile, update)
- `/api/mfa/*` - Multi-factor authentication endpoints
- `/api/session/*` - Session management endpoints
- `/api/oauth/*` - Social authentication endpoints

**Consistent Response Format:**
```json
{
  "success": boolean,
  "message": string,
  "data": object, // when applicable
  "errors": array // when applicable
}
```

### Testing Strategy

**Built-in Testing Utilities:**
- `check-server.js` - Server connectivity and configuration verification
- `test-auth.js` - Complete authentication flow testing
- Postman collection (`MERN_Auth_API.postman_collection.json`) with full API documentation
- JSON test files for register/login flows

### Key Design Patterns

1. **Service Layer Pattern** - Business logic abstracted into reusable services
2. **Repository Pattern** - Data access layer separation
3. **Middleware Chain** - Composable request processing (auth, validation, rate limiting)
4. **Factory Pattern** - Token generation and email template creation
5. **Observer Pattern** - Session tracking and device management
6. **Strategy Pattern** - Multiple OAuth providers via Passport strategies

### Performance Considerations

- **Database Indexing** - Optimized indexes for auth lookups, social auth, and TTL cleanup
- **Session Optimization** - Limited concurrent sessions (10 per user) with automatic cleanup
- **Token Management** - Short-lived access tokens with secure refresh mechanism
- **Rate Limiting** - Prevents abuse while maintaining good UX
- **Caching Strategy** - Session store with MongoDB for persistence and Redis configuration

This codebase follows **enterprise-level security practices** and **scalable architecture patterns**, making it production-ready for authentication systems requiring high security standards.
