# JWT Authentication & User Management System

A comprehensive Node.js backend application featuring JWT authentication, user management, email verification, password reset, mobile OTP verification, and file upload capabilities.

## 🚀 Features

### Authentication & Security

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Email Verification** - Account verification via email
- **Password Reset** - Secure password reset with email tokens
- **Mobile OTP Verification** - SMS-based OTP verification using Twilio
- **Refresh Tokens** - Extended session management

### User Management

- **User Registration** - Complete user signup with validation
- **User Login** - Secure authentication with JWT tokens
- **Profile Management** - Update user profile information
- **Image Upload** - Profile picture upload with validation
- **Account Verification** - Email and mobile verification

### Communication

- **Email Service** - Nodemailer integration for email notifications
- **SMS Service** - Twilio integration for OTP delivery
- **Template System** - HTML email templates

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Email Service**: Nodemailer (SMTP)
- **SMS Service**: Twilio
- **File Upload**: Multer
- **Validation**: express-validator
- **Environment**: dotenv

## 📁 Project Structure

```
├── config/
│   └── database.js          # MongoDB connection configuration
├── controller/
│   ├── userController.js    # User-related business logic
│   └── mobileController.js  # Mobile OTP functionality
├── helper/
│   ├── mailer.js           # Email service configuration
│   ├── validations.js      # Input validation rules
│   └── mobileValidation.js # Mobile OTP validation rules
├── middleware/
│   └── auth.js             # JWT authentication middleware
├── models/
│   ├── userModel.js        # User schema definition
│   ├── password.js         # Password reset schema
│   └── mobileOTP.js        # Mobile OTP schema
├── routes/
│   ├── userRoutes.js       # User-related endpoints
│   ├── authRoutes.js       # Authentication endpoints
│   └── mobileRoutes.js     # Mobile OTP endpoints
├── public/
│   └── images/             # Uploaded user images
├── view/                   # View templates (if any)
├── server.js               # Main application entry point
├── .env                    # Environment variables
└── package.json            # Project dependencies
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Twilio Account (for SMS)
- SMTP Email Service (Gmail recommended)

# Database Configuration

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT= ***
SMTP_MAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Twilio Configuration (for SMS OTP)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 4. Start the Application

```bash
# Development mode with nodemon
npm start

# Production mode
node server.js
```

The server will start on `http://localhost:4000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/register
Content-Type: multipart/form-data

Form Data:
- name: string (required)
- email: string (required)
- mobile: string (required, 10 digits)
- password: string (required, strong password)
- image: file (required, jpg/png/jpeg)
```

#### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "userpassword"
}
```

#### Verify Email

```http
GET /auth/verify-email?email=user@example.com
```

#### Forgot Password

```http
POST /api/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password

```http
GET /auth/reset-password?token=reset_token
```

#### Update Password

```http
POST /auth/update-password?token=reset_token
Content-Type: application/json

{
  "newPassword": "newpassword",
  "confirmPassword": "newpassword"
}
```

### User Management Endpoints

#### Get User Profile

```http
GET /api/profile
Authorization: Bearer <jwt_token>
```

#### Update User Profile

```http
POST /api/update-profile
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
- name: string (optional)
- mobile: string (optional, 10 digits)
- image: file (optional, jpg/png/jpeg)
```

### Mobile OTP Endpoints

#### Send OTP

```http
POST /api/mobile/send-otp
Content-Type: application/json

{
  "mobileNumber": "9876543210"
}
```

#### Verify OTP

```http
POST /api/mobile/verify-otp
Content-Type: application/json

{
  "mobileNumber": "9876543210",
  "otp": "123456"
}
```



## 🗄️ Database Schema

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  mobile: String (required),
  password: String (required, hashed),
  isVerified: Boolean (default: false),
  isMobileVerified: Boolean (default: false),
  image: String,
  refreshToken: String,
  refreshTokenExpiry: Date,
  timestamps: true
}
```

### Password Reset Model

```javascript
{
  userId: ObjectId (ref: User),
  resetToken: String (required),
  expiresAt: Date (required),
  timestamps: true
}
```

### Mobile OTP Model

```javascript
{
  mobileNumber: String (required),
  otp: String (required, hashed),
  attempts: Number (default: 0),
  expiresAt: Date (required),
  timestamps: true
}
```

## 🔒 Security Features

### Password Security

- **bcrypt Hashing**: All passwords are hashed with salt rounds
- **Strong Password Policy**: Enforced via validation
- **Secure Reset**: Time-limited password reset tokens

### JWT Security

- **Token Expiration**: 24-hour token validity
- **Secure Headers**: Proper authorization header handling
- **Refresh Tokens**: Extended session management

### OTP Security

- **Hashed Storage**: OTPs are hashed before database storage
- **Attempt Limiting**: Maximum 3 verification attempts
- **Rate Limiting**: 1-minute cooldown between requests
- **Auto Expiry**: 5-minute OTP validity

### Input Validation

- **express-validator**: Comprehensive input validation
- **File Upload Security**: MIME type and size validation
- **SQL Injection Prevention**: Mongoose ODM protection

## 🚨 Error Handling

### Common HTTP Status Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request / Validation errors
- **401**: Unauthorized / Invalid token
- **404**: Resource not found
- **429**: Rate limited
- **500**: Internal server error

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error array"],
  "error": "Technical error message"
}
```

## 🔧 Configuration

### Email Setup (Gmail)

1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in SMTP_PASSWORD

### Twilio Setup

1. Create Twilio account
2. Get Account SID and Auth Token
3. Purchase/verify phone number
4. Add credentials to environment variables

### MongoDB Setup

1. Create MongoDB Atlas account (or use local MongoDB)
2. Create database and get connection string
3. Add connection string to MONGO_URI

## 📈 Performance Considerations

### Database Optimization

- **Indexes**: Email and mobile number indexes for faster queries
- **TTL Indexes**: Automatic cleanup of expired OTPs and tokens
- **Connection Pooling**: Mongoose connection optimization

### Security Optimization

- **Rate Limiting**: Prevents brute force attacks
- **Input Sanitization**: Prevents injection attacks
- **File Size Limits**: Prevents DoS via large uploads


## 🔄 Version History

- **v1.0.0**: Initial release with complete authentication system
  - JWT authentication
  - Email verification
  - Password reset
  - Mobile OTP verification
  - File upload
  - Profile management

---

**Built with ❤️ using Node.js and Express.js**
