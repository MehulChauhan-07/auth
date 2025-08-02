# Testing MERN Auth API with CSRF Protection in Postman

## Overview

Your API has CSRF (Cross-Site Request Forgery) protection enabled. This means you need to include a valid CSRF token with state-changing requests (POST, PUT, DELETE).

## Method 1: Disable CSRF for Testing (Development Only)

1. Add `DISABLE_CSRF=true` to your `.env` file
2. Restart your server
3. Test normally in Postman without CSRF tokens

## Method 2: Use CSRF Tokens (Recommended)

### Step 1: Set up Postman Environment

1. Create a new environment in Postman
2. Add variables:
   - `baseURL`: `http://localhost:5000` (or your server URL)
   - `csrfToken`: (leave empty, will be set automatically)

### Step 2: Get CSRF Token (Pre-request Script Method)

#### Option A: Manual Token Retrieval

1. **GET CSRF Token First**

   ```
   GET {{baseURL}}/api/auth/csrf-token
   ```

   Response:

   ```json
   {
     "success": true,
     "csrfToken": "abc123xyz..."
   }
   ```

2. **Copy the token and use it in subsequent requests**
   - Add header: `X-CSRF-Token: abc123xyz...`
   - Or add to request body: `_csrf: abc123xyz...`

#### Option B: Automatic Token Retrieval (Recommended)

**Pre-request Script for all POST/PUT/DELETE requests:**

```javascript
// Pre-request script to automatically get CSRF token
const baseURL = pm.environment.get("baseURL");

if (!pm.environment.get("csrfToken")) {
  pm.sendRequest(
    {
      url: baseURL + "/api/auth/csrf-token",
      method: "GET",
    },
    function (err, response) {
      if (err) {
        console.error("Error getting CSRF token:", err);
      } else {
        const jsonData = response.json();
        if (jsonData.success && jsonData.csrfToken) {
          pm.environment.set("csrfToken", jsonData.csrfToken);
          console.log("CSRF token set:", jsonData.csrfToken);
        }
      }
    }
  );
}
```

### Step 3: Include CSRF Token in Requests

For **POST/PUT/DELETE requests**, add the CSRF token as a header:

**Headers:**

```
X-CSRF-Token: {{csrfToken}}
Content-Type: application/json
```

**Or include in request body:**

```json
{
  "_csrf": "{{csrfToken}}",
  "email": "user@example.com",
  "password": "password123"
}
```

## Example Postman Collection Setup

### 1. Register User

```
POST {{baseURL}}/api/auth/register

Headers:
X-CSRF-Token: {{csrfToken}}
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login User

```
POST {{baseURL}}/api/auth/login

Headers:
X-CSRF-Token: {{csrfToken}}
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Send Reset Password OTP

```
POST {{baseURL}}/api/auth/forgot-password

Headers:
X-CSRF-Token: {{csrfToken}}
Content-Type: application/json

Body:
{
  "email": "john@example.com"
}
```

## Troubleshooting

### Common Issues:

1. **"Invalid or missing CSRF token" error**

   - Make sure you're including the `X-CSRF-Token` header
   - Ensure the token is valid and not expired
   - Check that cookies are enabled in Postman

2. **Token expires**

   - CSRF tokens are session-based and may expire
   - Clear the `csrfToken` environment variable and get a new one

3. **Cookies not working**
   - Enable "Send cookies" in Postman request settings
   - Make sure your server's CORS settings allow credentials

### Postman Settings:

1. **Enable cookies**: Settings → General → Send cookies
2. **Disable SSL verification** (for local testing): Settings → General → SSL certificate verification: OFF

## Alternative: Create a Testing Route (Development Only)

Add this route to temporarily bypass CSRF for testing:

```javascript
// In auth.routes.js - ONLY for development
if (process.env.NODE_ENV === "development") {
  authRouter.post("/test-login", validateLogin, login);
  authRouter.post("/test-register", validateRegister, register);
  // ... other test routes
}
```

Then use `/test-login` instead of `/login` during development.

## Environment Variables for Testing

Add to your `.env` file:

```
NODE_ENV=development
DISABLE_CSRF=true  # Only for testing
```

Remember to remove `DISABLE_CSRF=true` when deploying to production!
