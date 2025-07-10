# Auth

A professional and production-ready authentication backend system built with Node.js, Express, and MongoDB. This API supports secure user registration, login, email verification, password reset, and profile management, following industry best practices for code structure and security.

---

## 🚀 Features

- User registration & login with JWT authentication
- Email verification with OTP
- Password reset via OTP
- Profile management
- Modular, neat, and readable codebase
- Input validation with descriptive error messages
- Secure password hashing with bcrypt
- Environment-aware cookie configuration
- Clear, consistent API responses

---

## 📦 Setup & Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/MehulChauhan-07/auth.git
   cd auth
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**  
   Create a `.env` file in the root directory and add:

   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000/` by default.

---

## 🔑 API Endpoints Guide

All endpoints return a consistent JSON response:

```json
{
  "success": true | false,
  "message": "Description of the result",
  // Optional: "user", "token", or "errors"
}
```

### **Authentication**

| Method | Endpoint                     | Description                    | Auth Required |
| ------ | ---------------------------- | ------------------------------ | ------------- |
| POST   | `/api/auth/register`         | Register a new user            | No            |
| POST   | `/api/auth/login`            | Login and receive JWT token    | No            |
| POST   | `/api/auth/logout`           | Logout user (clear cookie)     | No            |
| POST   | `/api/auth/send-verify-otp`  | Send email verification OTP    | Yes           |
| POST   | `/api/auth/verify`           | Verify email with OTP          | Yes           |
| POST   | `/api/auth/is-authenticated` | Check if user is authenticated | Yes           |
| POST   | `/api/auth/forgot-password`  | Send OTP for password reset    | No            |
| POST   | `/api/auth/reset-password`   | Reset password with OTP        | No            |

### **User**

| Method | Endpoint           | Description         | Auth Required |
| ------ | ------------------ | ------------------- | ------------- |
| GET    | `/api/user/data`   | Get user profile    | Yes           |
| PUT    | `/api/user/update` | Update user profile | Yes           |

---

## 🗂️ Example Request & Response

### **Register**

**Request:**

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "..."
  }
}
```

**Validation Error Response:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ]
}
```

---

## 🔐 Authentication

- **JWT** is used for authentication.
- Authenticated endpoints require the `token` cookie to be present.
- Use a tool like [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) to test endpoints interactively.

---

## 📝 Best Practices

- Use strong, unique passwords.
- Never share your JWT secret or database credentials.
- Set `NODE_ENV=production` for secure cookie handling on deployed environments.

---

## 🧑‍💻 Maintainer

- [Mehul Chauhan](https://github.com/MehulChauhan-07)

## 📚 API Endpoints Details

Below is a detailed guide to each endpoint, including request/response examples and required fields.

---

### 1. **POST `/api/auth/register`**

Register a new user.

**Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password@123"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "user_id",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "token": "..."
  }
}
```

---

### 2. **POST `/api/auth/login`**

Login an existing user.

**Body:**

```json
{
  "email": "jane@example.com",
  "password": "Password@123"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "...",
  "user": {
    "id": "user_id",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

---

### 3. **POST `/api/auth/logout`**

Logout the authenticated user (clears JWT cookie).

**No body required.**

**Success Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 4. **POST `/api/auth/send-verify-otp`**

Send a verification OTP email.  
**Requires authentication (JWT cookie).**

**No body required.**

**Success Response:**

```json
{
  "success": true,
  "message": "Account Verification OTP sent successfully"
}
```

---

### 5. **POST `/api/auth/verify`**

Verify account with OTP.  
**Requires authentication (JWT cookie).**

**Body:**

```json
{
  "otp": "123456"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Account verified successfully"
}
```

---

### 6. **POST `/api/auth/is-authenticated`**

Check if the user session is valid.  
**Requires authentication (JWT cookie).**

**No body required.**

**Success Response:**

```json
{
  "success": true
}
```

---

### 7. **POST `/api/auth/forgot-password`**

Request a password reset OTP.

**Body:**

```json
{
  "email": "jane@example.com"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

---

### 8. **POST `/api/auth/reset-password`**

Reset password with OTP.

**Body:**

```json
{
  "email": "jane@example.com",
  "otp": "123456",
  "newPassword": "NewPassword@123"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Password has been reset successful"
}
```

---

### 9. **GET `/api/user/data`**

Get the current authenticated user's profile.  
**Requires authentication (JWT cookie).**

**Success Response:**

```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

---

### 10. **PUT `/api/user/update`**

Update user profile fields.  
**Requires authentication (JWT cookie).**

**Body:**

```json
{
  "name": "Jane Smith",
  "email": "newemail@example.com"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "name": "Jane Smith",
    "email": "newemail@example.com"
  }
}
```

---

## 🛠️ Error Handling

- All errors return `success: false` and provide a clear `message` and, if validation fails, an `errors` array.
- Example:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Email is required",
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ]
}
```

---

## 💡 Tips for Using This API

- Always use HTTPS in production.
- Authenticated endpoints require the `token` cookie (set on login/registration).
- Use tools like Postman or Insomnia for testing.
- On the frontend, send credentials (`withCredentials: true` in Axios/fetch) to ensure cookies flow with requests.

---

## 📬 Contact & Support

For questions, suggestions, or support, please open an [issue](https://github.com/MehulChauhan-07/auth/issues) or contact [Mehul Chauhan](https://github.com/MehulChauhan-07).

---
