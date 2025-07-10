# 🔐 Auth Backend API

<div align="center">

![Auth Backend](https://img.shields.io/badge/Auth-Backend-blue?style=for-the-badge&logo=nodejs)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-16+-brightgreen?style=for-the-badge&logo=node.js)

**🚀 A complete, production-ready authentication backend with JWT, OTP verification, and secure user management**

[📚 Documentation](#-api-documentation) • [🛠️ Quick Start](#-quick-start) • [🔧 Installation](#-installation) • [📋 API Reference](#-api-endpoints) • [🧪 Testing](#-testing-with-postman)

</div>

##

> ⚠️ This branch contains **only the backend** code for the authentication system.  
> For the full-stack version, [switch to the `main` branch](https://github.com/MehulChauhan-07/auth/tree/main).

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🏗️ Tech Stack](#-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [🔧 Installation](#-installation)
- [⚙️ Configuration](#-configuration)
- [📋 API Endpoints](#-api-endpoints)
- [🧪 Testing with Postman](#-testing-with-postman)
- [🔐 Complete Authentication Flow](#-complete-authentication-flow)
- [📧 Email Templates](#-email-templates)
- [🚨 Error Handling](#-error-handling)
- [🔒 Security](#-security)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📞 Support](#-support)

---

## ✨ Features

<div align="center">

| 🔐 **Authentication** | 📧 **Email Integration** | 🛡️ **Security** | 📱 **User Management** |
|:---:|:---:|:---:|:---:|
| JWT-based auth | OTP verification | Password hashing | Profile management |
| Secure sessions | Password reset | Input validation | Account verification |
| Cookie handling | Welcome emails | Rate limiting | Data protection |

</div>

### 🎯 **Core Features**

- ✅ **User Registration & Login** - Secure JWT authentication
- ✅ **Email Verification** - OTP-based account verification
- ✅ **Password Reset** - Secure password recovery with OTP
- ✅ **Profile Management** - Update user information
- ✅ **Input Validation** - Comprehensive request validation with Joi
- ✅ **Security First** - Bcrypt hashing, secure cookies, CORS protection
- ✅ **Professional Emails** - Beautiful, responsive email templates
- ✅ **Error Handling** - Consistent, detailed error responses
- ✅ **Production Ready** - Optimized for deployment

---

## 🏗️ Tech Stack

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Brevo](https://img.shields.io/badge/Brevo-0078D4?style=for-the-badge&logo=microsoft-outlook&logoColor=white)

</div>

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | 16+ |
| **Express.js** | Web framework | Latest |
| **MongoDB** | Database | Latest |
| **Mongoose** | ODM | Latest |
| **JWT** | Authentication tokens | Latest |
| **Bcrypt** | Password hashing | Latest |
| **Joi** | Input validation | Latest |
| **Brevo API** | Email service | Latest |

---

## 🚀 Quick Start

Get your authentication backend running in 5 minutes!

### 🔥 **One-Click Setup**

```bash
# 1. Clone the repository
git clone -b backend https://github.com/MehulChauhan-07/auth.git
cd auth/backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start the server
npm run dev
```

🎉 **Your API is now running at `http://localhost:5000`**

---

## 🔧 Installation

### 📋 **Prerequisites**

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Brevo account (for email services)

### 🛠️ **Detailed Setup**

<details>
<summary>📦 <strong>Step-by-step installation</strong></summary>

#### 1. **Clone Repository**
```bash
git clone -b backend https://github.com/MehulChauhan-07/auth.git
cd auth/backend
```

#### 2. **Install Dependencies**
```bash
npm install
```

#### 3. **Environment Setup**
Create a `.env` file in the backend directory:
```bash
touch .env
```

#### 4. **Database Setup**
- **Local MongoDB**: Install and start MongoDB
- **Cloud MongoDB**: Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

#### 5. **Email Service Setup**
- Create a [Brevo account](https://www.brevo.com/)
- Get your SMTP credentials
- Verify your sender email

#### 6. **Start Development Server**
```bash
npm run dev
```

</details>

---

## ⚙️ Configuration

### 🔐 **Environment Variables**

Create a `.env` file with the following configuration:

```env
# 🚀 Server Configuration
PORT=5000
NODE_ENV=development

# 🗄️ Database
MONGODB_URI=mongodb://localhost:27017/auth-db
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auth-db

# 🔑 JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# 📧 Email Configuration (Brevo SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-smtp-user
SMTP_PASS=your-brevo-smtp-password
SENDER_EMAIL=noreply@yourdomain.com

# 🌐 CORS (Optional)
FRONTEND_URL=http://localhost:5173
```

### 🔧 **Configuration Tips**

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Strong secret for JWT signing | Use a 32+ character random string |
| `MONGODB_URI` | Database connection string | Local or Atlas connection |
| `SENDER_EMAIL` | Verified sender email | Must be verified with Brevo |

---

## 📋 API Endpoints

### 🎯 **Base URL**: `http://localhost:5000/api`

<details>
<summary>🔐 <strong>Authentication Endpoints</strong></summary>

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register new user | ❌ |
| `POST` | `/auth/login` | User login | ❌ |
| `POST` | `/auth/logout` | User logout | ❌ |
| `POST` | `/auth/send-verify-otp` | Send verification OTP | ✅ |
| `POST` | `/auth/verify` | Verify email with OTP | ✅ |
| `POST` | `/auth/is-authenticated` | Check auth status | ✅ |
| `POST` | `/auth/forgot-password` | Send reset OTP | ❌ |
| `POST` | `/auth/reset-password` | Reset password | ❌ |

</details>

<details>
<summary>👤 <strong>User Management Endpoints</strong></summary>

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/user/data` | Get user profile | ✅ |
| `PUT` | `/user/update` | Update profile | ✅ |

</details>

---

## 🧪 Testing with Postman

### 📋 **Postman Collection Setup**

Create a new collection called "Auth Backend API" with the following environment variables:

**Environment Variables:**
- `baseUrl`: `http://localhost:5000/api`
- `token`: (will be set automatically from login response)

### 🔑 **Complete Authentication Flow Tests**

#### 1. **User Registration**

**Method:** `POST`  
**URL:** `{{baseUrl}}/auth/register`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "name": "Mehul Chauhan",
  "email": "mehul@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "64a1b2c3d4e5f6789012345",
    "name": "Mehul Chauhan",
    "email": "mehul@example.com",
    "isVerified": false,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```


---

#### 2. **User Login**

**Method:** `POST`  
**URL:** `{{baseUrl}}/auth/login`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "email": "mehul@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6789012345",
    "name": "Mehul Chauhan",
    "email": "mehul@example.com",
    "isVerified": true
  }
}
```

**Test Scripts:**
```javascript
// Save token to environment
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
}



---

#### 3. **Send Verification OTP**

**Method:** `POST`  
**URL:** `{{baseUrl}}/auth/send-verify-otp`  
**Headers:**
```json
{
  "Content-Type": "application/json",
  "Cookie": "token={{token}}"
}
```

**Body:** (Empty)

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Verification OTP sent to your email"
}
```


---

#### 4. **Verify Email with OTP**

**Method:** `POST`  
**URL:** `{{baseUrl}}/auth/verify`  
**Headers:**
```json
{
  "Content-Type": "application/json",
  "Cookie": "token={{token}}"
}
```

**Body (JSON):**
```json
{
  "otp": "123456"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Account verified successfully"
}
```


---

#### 5. **Check Authentication Status**

**Method:** `POST`  
**URL:** `{{baseUrl}}/auth/is-authenticated`  
**Headers:**
```json
{
  "Content-Type": "application/json",
  "Cookie": "token={{token}}"
}
```

**Body:** (Empty)

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User is authenticated",
  "user": {
    "id": "64a1b2c3d4e5f6789012345",
    "name": "Mehul Chauhan",
    "email": "mehul@example.com",
    "isVerified": true
  }
}
```

---

#### 6. **Forgot Password**

**Method:** `POST`  
**URL:** `{{baseUrl}}/auth/forgot-password`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "email": "mehul@example.com"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Password reset OTP sent to your email"
}
```

---

#### 7. **Reset Password**

**Method:** `POST`  
**URL:** `{{baseUrl}}/auth/reset-password`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "email": "mehul@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

#### 8. **Get User Profile**

**Method:** `GET`  
**URL:** `{{baseUrl}}/user/data`  
**Headers:**
```json
{
  "Cookie": "token={{token}}"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "64a1b2c3d4e5f6789012345",
    "name": "Mehul Chauhan",
    "email": "mehul@example.com",
    "isVerified": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### 9. **Update User Profile**

**Method:** `PUT`  
**URL:** `{{baseUrl}}/user/update`  
**Headers:**
```json
{
  "Content-Type": "application/json",
  "Cookie": "token={{token}}"
}
```

**Body (JSON):**
```json
{
  "name": "Mehul Chauhan Updated",
  "email": "mehul.updated@example.com"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "64a1b2c3d4e5f6789012345",
    "name": "Mehul Chauhan Updated",
    "email": "mehul.updated@example.com",
    "isVerified": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:45:00Z"
  }
}
```

---

#### 10. **User Logout**

**Method:** `POST`  
**URL:** `{{baseUrl}}/auth/logout`  
**Headers:**
```json
{
  "Cookie": "token={{token}}"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Test Scripts:**
```javascript
// Clear token from environment
if (pm.response.code === 200) {
    pm.environment.unset("token");
}

pm.test("Logout successful", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
});
```

---

## 🔐 Complete Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Postman
    participant Backend
    participant Database
    participant Email

    User->>Postman: Register Request
    Postman->>Backend: POST /auth/register
    Backend->>Database: Create user
    Backend->>Email: Send welcome email
    Backend->>Postman: Return JWT token
    Postman->>User: Registration success

    User->>Postman: Login Request
    Postman->>Backend: POST /auth/login
    Backend->>Database: Verify credentials
    Backend->>Postman: Return JWT token
    Postman->>User: Login success

    User->>Postman: Request verification
    Postman->>Backend: POST /auth/send-verify-otp
    Backend->>Email: Send OTP
    Backend->>Postman: OTP sent confirmation

    User->>Postman: Enter OTP
    Postman->>Backend: POST /auth/verify
    Backend->>Database: Verify user
    Backend->>Postman: Verification success

    User->>Postman: Get Profile
    Postman->>Backend: GET /user/data
    Backend->>Database: Fetch user data
    Backend->>Postman: User profile data

    User->>Postman: Logout
    Postman->>Backend: POST /auth/logout
    Backend->>Postman: Logout success
```

---

## 📧 Email Templates

Your API sends beautiful, professional emails:

### 📨 **Welcome Email**
- Modern, responsive design
- Personalized greeting
- Clear call-to-action
- Professional branding

### 🔐 **OTP Verification**
- Large, easy-to-copy OTP code
- Security warnings
- Expiry notifications
- Mobile-friendly design

### 🔄 **Password Reset**
- Secure reset instructions
- Time-sensitive warnings
- Support contact information

---

## 🚨 Error Handling

All API responses follow a consistent format:

### ✅ **Success Response**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* relevant data */ }
}
```

### ❌ **Error Response**
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Specific error 1", "Specific error 2"]
}
```

### 🔍 **Common Error Codes**

| Status | Code | Description |
|--------|------|-------------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 500 | Server Error | Internal server error |

---

## 🔒 Security

### 🛡️ **Security Features**

- ✅ **Password Hashing** - Bcrypt with salt rounds
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **HTTP-Only Cookies** - XSS protection
- ✅ **Input Validation** - Comprehensive validation with Joi
- ✅ **CORS Protection** - Cross-origin request security
- ✅ **Rate Limiting** - Prevent abuse (recommended)
- ✅ **Environment Variables** - Secure configuration

### 🔐 **Best Practices**

1. **Use HTTPS in production**
2. **Strong JWT secrets** (32+ characters)
3. **Regular security updates**
4. **Monitor authentication attempts**
5. **Implement rate limiting**
6. **Validate all inputs**
7. **Use secure headers**

---

## 🚀 Deployment

### 🌐 **Production Deployment**

<details>
<summary>🚀 <strong>Deploy to Railway</strong></summary>

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway up
```

</details>

<details>
<summary>🌊 <strong>Deploy to Heroku</strong></summary>

```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-auth-api

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set MONGODB_URI=your-mongodb-uri

# Deploy
git push heroku main
```

</details>

<details>
<summary>☁️ <strong>Deploy to Vercel</strong></summary>

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

</details>

### 📋 **Production Checklist**

- [✅] Set strong JWT secret
- [✅] Configure MongoDB Atlas
- [✅] Set up email service
- [ ] Enable HTTPS
- [ ] Configure CORS
- [ ] Set up monitoring
- [ ] Configure error logging
- [ ] Set up backups

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 🔧 **Development Setup**

```bash
# Fork and clone
git clone https://github.com/your-username/auth.git
cd auth/backend

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git commit -m "Add your feature"

# Push and create PR
git push origin feature/your-feature
```

### 📋 **Contribution Guidelines**

1. **Follow code style** - Use ESLint and Prettier
2. **Write tests** - Add tests for new features
3. **Document changes** - Update README and comments
4. **Small commits** - Make focused, atomic commits
5. **Clear PR descriptions** - Explain what and why

---

## 📞 Support

### 🆘 **Need Help?**

<div align="center">

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-red?style=for-the-badge&logo=github)](https://github.com/MehulChauhan-07/auth/issues)
[![Discord](https://img.shields.io/badge/Discord-Chat-blue?style=for-the-badge&logo=discord)](https://discord.gg/your-discord)
[![Email](https://img.shields.io/badge/Email-Support-green?style=for-the-badge&logo=gmail)](mailto:support@yourdomain.com)

</div>

### 🤖 **Common Issues**

<details>
<summary>❓ <strong>Authentication not working</strong></summary>

- Check JWT secret is set
- Verify cookie settings
- Ensure CORS is configured
- Check token expiry

</details>

<details>
<summary>❓ <strong>Emails not sending</strong></summary>

- Verify Brevo credentials
- Check sender email verification
- Review SMTP settings
- Check email templates

</details>

<details>
<summary>❓ <strong>Database connection issues</strong></summary>

- Verify MongoDB URI
- Check network connectivity
- Ensure database exists
- Review connection settings

</details>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏆 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Brevo](https://www.brevo.com/) - Email service
- [JWT](https://jwt.io/) - Authentication tokens
- [Joi](https://joi.dev/) - Input validation

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/MehulChauhan-07/auth?style=social)](https://github.com/MehulChauhan-07/auth)
[![GitHub forks](https://img.shields.io/github/forks/MehulChauhan-07/auth?style=social)](https://github.com/MehulChauhan-07/auth)

**Made with ❤️ by [Mehul Chauhan](https://github.com/MehulChauhan-07)**

</div>