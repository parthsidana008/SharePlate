# SharePlate Setup Guide

## Project Structure

```
shareplate (1) final/
├── Frontend/          # React + Vite frontend
└── Backend/           # Node.js + Express backend
```

## Backend Setup

1. Navigate to Backend folder:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/shareplate
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
```

4. Start MongoDB (if using local MongoDB):
```bash
# Make sure MongoDB is running on your system
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

## Frontend Setup

1. Navigate to Frontend folder:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend dev server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Features Implemented

### Backend
- ✅ JWT-based authentication
- ✅ Role-based access control (Donor, Recipient, Admin)
- ✅ MongoDB integration ready
- ✅ Gemini API integration for AI features
- ✅ Protected routes middleware
- ✅ Donation management
- ✅ Request management
- ✅ User management

### Frontend
- ✅ Login/Signup pages with similar UI
- ✅ Protected routes (requires login)
- ✅ Axios integration for API calls
- ✅ Authentication context
- ✅ User profile display in navbar
- ✅ Logout functionality
- ✅ Role-based UI (donors can donate, recipients can request)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)

### Donations
- `GET /api/donations` - Get all donations (Protected)
- `GET /api/donations/:id` - Get single donation (Protected)
- `POST /api/donations` - Create donation (Protected, Donor/Admin)
- `PUT /api/donations/:id` - Update donation (Protected)
- `DELETE /api/donations/:id` - Delete donation (Protected)
- `GET /api/donations/my/list` - Get my donations (Protected, Donor)

### Requests
- `POST /api/requests` - Create request (Protected, Recipient)
- `GET /api/requests/my` - Get my requests (Protected)
- `GET /api/requests/donations` - Get requests for my donations (Protected, Donor)
- `PUT /api/requests/:id/status` - Update request status (Protected)

### AI Features
- `POST /api/ai/safety-tips` - Get food safety tips (Protected)
- `POST /api/ai/analyze-image` - Analyze food image (Protected)
- `POST /api/ai/recipes` - Generate recipes (Protected)
- `POST /api/ai/chat` - Chat with AI assistant (Protected)

## User Roles

- **donor** - Can create donations
- **recipient** - Can request donations
- **admin** - Full access

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are automatically stored in localStorage after login and included in all API requests.

## Next Steps

1. Set up MongoDB (local or MongoDB Atlas)
2. Add your Gemini API key to Backend/.env (get it from https://makersuite.google.com/app/apikey)
3. Update JWT_SECRET in Backend/.env
4. Start both servers and test the application

## Notes

- Without login, users cannot access any features
- All routes are protected except `/login` and `/register`
- Frontend automatically redirects to login if not authenticated
- Backend validates all requests and enforces role-based access

