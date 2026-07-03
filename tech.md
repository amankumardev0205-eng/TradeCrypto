# CryptoMarket - Technical Documentation

## Overall Architecture

**Project Type:** Full Stack Cryptocurrency Platform

**Architecture Pattern:** Client-Server Architecture (REST API)

**Current Stack:**
- React + Vite Frontend
- Express.js Backend
- Firebase Firestore Database
- Firebase Storage
- JWT Authentication

---

# Project Overview

CryptoMarket is a cryptocurrency platform where users can:

- Register and login securely
- Complete KYC verification
- Access a personalized dashboard
- View cryptocurrency market information
- Upload verification documents
- Manage their profile

Administrators can:

- Review submitted KYC requests
- Approve or reject verification
- Manage platform users

---

# System Architecture

```
                   Browser
                      │
                      ▼
          React + Vite Frontend
                      │
                 Axios Requests
                      │
                      ▼
             Express REST API
                      │
        JWT Authentication Layer
                      │
         Business Logic & Routes
          ┌───────────┴───────────┐
          ▼                       ▼
 Firebase Firestore      Firebase Storage
   User Information       KYC Documents
```

---

# Frontend Technologies

| Technology | Purpose |
|------------|---------|
| React.js | User Interface |
| Vite | Development Server & Build Tool |
| React Router DOM | Routing |
| Axios | API Communication |
| Context API | Global State |
| CSS | Styling |
| Firebase Hosting | Deployment |

---

# Backend Technologies

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | REST API |
| JWT | Authentication |
| bcryptjs | Password Encryption |
| Multer | File Upload |
| dotenv | Environment Variables |
| CORS | Cross-Origin Requests |

---

# Database

| Technology | Purpose |
|------------|---------|
| Firebase Firestore | User Data |
| Firebase Storage | Image & Document Storage |

---

# Folder Structure

```
Crypto/

│
├── backend/
│
│   ├── middleware/
│   │      Authentication Middleware
│   │
│   ├── models/
│   │      Firestore Models
│   │
│   ├── routes/
│   │      Authentication APIs
│   │      User APIs
│   │      KYC APIs
│   │
│   ├── uploads/
│   │
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── CryptoMarket/
│
│   ├── public/
│   │
│   ├── src/
│   │
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   │
│   │   ├── pages/
│   │   │
│   │   │── LandingPage.jsx
│   │   │── Login.jsx
│   │   │── Register.jsx
│   │   │── KYCScreen.jsx
│   │   │── UserDashboard.jsx
│   │   │── AdminDashboard.jsx
│   │
│   │── App.jsx
│   │── main.jsx
│   │── App.css
│   │── index.css
│   │
│   ├── firebase.json
│   ├── vite.config.js
│   └── package.json
│
├── README.md
├── tech.md
└── todo.md
```

---

# Authentication Flow

```
User Registration
        │
        ▼
Password Hashing (bcrypt)
        │
        ▼
Save User to Firestore
        │
        ▼
User Login
        │
        ▼
Verify Password
        │
        ▼
Generate JWT Token
        │
        ▼
Protected Routes
```

---

# KYC Workflow

```
User Uploads Document
          │
          ▼
    Multer Middleware
          │
          ▼
 Firebase Storage Upload
          │
          ▼
Store File URL
          │
          ▼
Save Status in Firestore
          │
          ▼
Admin Verification
```

---

# Frontend Modules

## Landing Page

Responsibilities

- Welcome users
- Show platform overview
- Navigation

---

## Login

Responsibilities

- User Authentication
- JWT Storage
- Error Handling

---

## Register

Responsibilities

- User Registration
- Validation
- Account Creation

---

## User Dashboard

Responsibilities

- Display User Information
- KYC Status
- Navigation

---

## Admin Dashboard

Responsibilities

- View Users
- Manage KYC
- Verification Controls

---

## KYC Screen

Responsibilities

- Upload Documents
- Submit Verification
- View Status

---

# Backend Modules

## Authentication

Endpoints

- Register User
- Login User
- Generate JWT
- Verify Token

---

## User Module

Endpoints

- Get Profile
- Update User

---

## KYC Module

Endpoints

- Upload Documents
- Save Verification
- Update Status

---

# Middleware

Authentication Middleware

Responsibilities

- Verify JWT
- Protect Routes
- Validate Users

---

Upload Middleware

Responsibilities

- Receive Files
- Validate Uploads
- Store Files

---

# Security Features

- JWT Authentication
- Password Hashing
- Environment Variables
- Secure File Upload
- Protected Routes
- CORS Configuration

---

# Deployment

Frontend

- Firebase Hosting

Backend

- Express Server

Database

- Firebase Firestore

Storage

- Firebase Storage

---

# Future Enhancements

- Live Cryptocurrency API
- Buy & Sell Crypto
- Wallet Integration
- Transaction History
- Charts & Analytics
- Two-Factor Authentication
- Email Verification
- Notifications
- Admin Analytics
- Portfolio Tracking

---

# Technology Summary

| Layer | Technology |
|--------|------------|
| Frontend | React, Vite, Context API, Axios |
| Backend | Node.js, Express.js |
| Authentication | JWT, bcryptjs |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Deployment | Firebase Hosting |
| Version Control | Git & GitHub |

---

# Complete Data Flow

```
                User
                  │
                  ▼
          React Frontend
                  │
           Axios API Calls
                  │
                  ▼
          Express Backend
                  │
      Authentication Layer
                  │
        Business Logic Layer
          ┌────────┴─────────┐
          ▼                  ▼
 Firebase Firestore   Firebase Storage
          │                  │
          └──────────┬───────┘
                     ▼
                Response
                     │
                     ▼
              React Dashboard
```

---

# Conclusion

CryptoMarket follows a modern full-stack architecture using React, Express, and Firebase. Authentication is secured using JWT and bcrypt, while Firebase Firestore and Firebase Storage provide scalable cloud-based data and file management. The modular folder structure ensures maintainability, scalability, and ease of future feature integration such as cryptocurrency trading, wallet management, and real-time market analytics.