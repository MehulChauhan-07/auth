# 🔒 Postman CSRF Testing Guide

## Problem
Getting `Invalid or missing CSRF token` error when testing with Postman.

## Root Cause
CSRF tokens require session-based validation. Postman needs to maintain session cookies AND get the CSRF token first.

## Solutions

### 🚀 Option 1: Disable CSRF for Testing (Recommended)

Add to your `.env` file:
```env
DISABLE_CSRF=true
```

Then restart your server:
```bash
cd server && npm run dev
```

### 🔧 Option 2: Proper CSRF Flow in Postman

#### Step 1: Setup Postman Environment
Create environment variables:
- `baseUrl`: `http://localhost:5000/api`
- `csrfToken`: (will be set automatically)

#### Step 2: Configure Postman for Cookie Management
**CRITICAL:** Enable cookie persistence in Postman:
1. Go to Postman Settings (⚙️)
2. Under "General" tab, turn ON "Automatically follow redirects"
3. Under "Cookies" section, make sure cookies are enabled
4. Or use Postman Interceptor/Agent for better session handling

#### Step 3: Get CSRF Token (With Session)
**Request 1: Get CSRF Token**
- Method: `GET`
- URL: `{{baseUrl}}/csrf-token`
- Headers: None needed
- **Important:** This creates a session and sets cookies

**Response:**
```json
{
  "success": true,
  "csrfToken": "bIu2US6W-oMBYV6qJdIgZKXN"
}
```

**Test Script (Save token AND verify session):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("csrfToken", response.csrfToken);
    
    // Check if session cookie was set
    const cookies = pm.cookies.all();
    console.log('Session cookies:', cookies.map(c => c.name));
    
    // Verify CSRF token format
    console.log('CSRF Token:', response.csrfToken.substring(0, 10) + '...');
}
```

#### Step 4: Use Token in Same Session
**Request 2: Register/Login/Any POST** 
- Method: `POST`
- URL: `{{baseUrl}}/auth/register`
- Headers:
```json
{
  "Content-Type": "application/json",
  "X-CSRF-Token": "{{csrfToken}}"
}
```
- **Cookies:** Postman should automatically include session cookies

**Body:**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "TestPass123!"
}
```

**Test Script (Debug session):**
```javascript
// Debug session info
console.log('Request headers:', JSON.stringify(pm.request.headers.toObject()));
console.log('Response status:', pm.response.code);
if (pm.response.code !== 200) {
    console.log('Error response:', pm.response.json());
}
```

## 🎯 Complete Testing Sequence

### 1. Get CSRF Token
```bash
GET http://localhost:5000/api/csrf-token
```

### 2. Register User
```bash
POST http://localhost:5000/api/auth/register
Headers:
- Content-Type: application/json
- X-CSRF-Token: [token-from-step-1]
```

### 3. Continue with other requests using the same token

## ⚠️ Important Notes

1. **Session Persistence**: Make sure Postman cookies are enabled
2. **Token Reuse**: CSRF tokens can be reused within the same session
3. **Server Restart**: New CSRF tokens needed after server restart
4. **Environment**: Ensure `NODE_ENV=development` in your `.env`

## 🐛 Troubleshooting

### Error: "Invalid or missing CSRF token"
- Check if `X-CSRF-Token` header is set
- Verify token was obtained from `/csrf-token` endpoint
- Ensure cookies are enabled in Postman

### Error: Session not found
- Get a fresh CSRF token
- Check if server was restarted

### Error: CORS issues
- Verify `FRONTEND_URL` in `.env`
- Check CORS configuration in `server.js`

## 🔥 Quick Fix for Testing
Add this to your `.env` and restart server:
```env
DISABLE_CSRF=true
```

This bypasses all CSRF validation for development/testing purposes.
