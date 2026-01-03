# SharePlate Backend API

Backend API for SharePlate food donation platform built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT-based authentication
- 👥 Role-based access control (Donor, Recipient, Admin)
- 🍽️ Donation management
- 📋 Request management
- 🤖 Gemini API integration for AI features
- 🛡️ Protected routes and middleware
- ✅ Input validation

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Google Gemini API** - AI features
- **bcryptjs** - Password hashing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/shareplate
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Donations
- `GET /api/donations` - Get all donations
- `GET /api/donations/:id` - Get single donation
- `POST /api/donations` - Create donation (Donor/Admin)
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation
- `GET /api/donations/my/list` - Get my donations

### Requests
- `POST /api/requests` - Create request (Recipient)
- `GET /api/requests/my` - Get my requests
- `GET /api/requests/donations` - Get requests for my donations
- `GET /api/requests/:id` - Get single request
- `PUT /api/requests/:id/status` - Update request status

### AI Features
- `POST /api/ai/safety-tips` - Get food safety tips
- `POST /api/ai/analyze-image` - Analyze food image
- `POST /api/ai/recipes` - Generate recipes
- `POST /api/ai/chat` - Chat with AI assistant

## Authentication

Include JWT token in request headers:
```
Authorization: Bearer <token>
```

## Roles

- **donor** - Can create donations
- **recipient** - Can request donations
- **admin** - Full access

## Project Structure

```
Backend/
├── config/
│   └── database.js
├── controllers/
│   ├── auth.controller.js
│   ├── donation.controller.js
│   ├── request.controller.js
│   └── ai.controller.js
├── middleware/
│   ├── auth.middleware.js
│   └── errorHandler.js
├── models/
│   ├── User.model.js
│   ├── Donation.model.js
│   └── Request.model.js
├── routes/
│   ├── auth.routes.js
│   ├── donation.routes.js
│   ├── request.routes.js
│   ├── ai.routes.js
│   └── user.routes.js
├── utils/
│   └── generateToken.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

