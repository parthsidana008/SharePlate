# 🍽️ SharePlate - Food Donation Platform

<div align="center">

**Connecting communities through food - Zero hunger, zero waste**

**[Live Demo]()**

[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2.1-blue)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 🎯 About

SharePlate connects food donors with recipients to combat food waste and hunger. Donors can post surplus food, recipients can request it, and AI helps with food safety and image analysis.

---

## ✨ Key Features

- 🔐 **JWT Authentication** - Role-based access (Donor/Recipient/Admin)
- 🍲 **Donation Management** - Post, edit, delete donations with image upload
- 🤖 **AI-Powered** - Gemini AI for image analysis, safety tips, and chatbot
- 📋 **Request Tracking** - Real-time status updates (Pending → Confirmed → Pickup → Completed)
- 🔔 **Live Notifications** - Socket.IO for instant updates
- 📍 **Location Search** - Auto-detect and filter by location
- 💬 **Smart Chat** - AI assistant for food safety queries

---

## 🛠️ Tech Stack

**Frontend:** React, Vite, React Router, Socket.IO Client, Axios, Tailwind CSS, Gemini AI  
**Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs  
**Deployment:** Vercel (Frontend), Backend(Render), MongoDB Atlas (Database)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Gemini API Key ([Get here](https://makersuite.google.com/app/apikey))

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/shareplate.git
cd shareplate

# Backend setup
cd Backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev

# Frontend setup (new terminal)
cd Frontend
npm install
npm run dev
```

**Access:** Frontend at `http://localhost:5173`, Backend at `http://localhost:5000`

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Donations
- `GET /api/donations` - Get all donations
- `GET /api/donations/:id` - Get single donation
- `POST /api/donations` - Create donation (donor/admin)
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation
- `GET /api/donations/my/list` - Get my donations (donor)

### Requests
- `POST /api/requests` - Create request (recipient/admin)
- `GET /api/requests/my` - Get my requests
- `GET /api/requests/donations` - Get donation requests (donor/admin)
- `GET /api/requests/:id` - Get single request
- `PUT /api/requests/:id/status` - Update request status

### AI Features
- `GET /api/ai/status` - Check AI availability
- `POST /api/ai/safety-tips` - Get food safety tips
- `POST /api/ai/analyze-image` - Analyze food image
- `POST /api/ai/chat` - Chat with AI assistant

### Messages
- `POST /api/messages` - Save message
- `GET /api/messages/:requestId` - Get messages for request

### Health
- `GET /api/health` - API health check

---

## 🔌 Socket.IO Events

### Client → Server
- `joinRequest` - Join request room
- `sendMessage` - Send chat message
- `updateRequestStatus` - Update request status

### Server → Client
- `newMessage` - New message received
- `requestStatusUpdated` - Status updated
- `newRequest` - New request created
- `notification` - General notification
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Icon library
- **Tailwind CSS** - Utility-first CSS framework
- **Google Generative AI** - Gemini AI integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - WebSocket server
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Google Generative AI** - Gemini AI API
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment configuration

### Deployment
- **Frontend**: Vercel
- **Backend**: Render/Railway (or your hosting platform)
- **Database**: MongoDB Atlas

---

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-backend-url.com/api`

---

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shareplate
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env - optional)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📁 Project Structure

```
shareplate/
├── Backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── ai.controller.js     # AI/Gemini logic
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── donation.controller.js
│   │   ├── message.controller.js
│   │   └── request.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Donation.model.js
│   │   ├── Request.model.js
│   │   └── Message.model.js
│   ├── routes/
│   │   ├── ai.routes.js
│   │   ├── auth.routes.js
│   │   ├── donation.routes.js
│   │   ├── message.routes.js
│   │   ├── request.routes.js
│   │   └── user.routes.js
│   ├── socket/
│   │   ├── socketServer.js      # Socket.IO initialization
│   │   ├── socketHandlers.js    # Event handlers
│   │   ├── handlers/
│   │   │   ├── chatHandler.js
│   │   │   └── requestHandler.js
│   │   └── middleware/
│   │       └── socketAuth.js    # Socket authentication
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env
│   ├── package.json
│   └── server.js                # Entry point
│
├── Frontend/
│   ├── components/
│   │   ├── AddDonation.jsx      # Donation form with AI
│   │   ├── AIChat.jsx           # Chat assistant
│   │   ├── DonationCard.jsx     # Donation item display
│   │   ├── DonationRequests.jsx # Donor's request management
│   │   ├── EditDonation.jsx     # Edit donation form
│   │   ├── ErrorBoundary.jsx    # Error handling
│   │   ├── Hero.jsx             # Landing hero section
│   │   ├── LandingNavbar.jsx    # Public navbar
│   │   ├── Login.jsx            # Login form
│   │   ├── MyDonations.jsx      # Donor's donations list
│   │   ├── MyRequests.jsx       # Recipient's requests list
│   │   ├── Navbar.jsx           # Authenticated navbar
│   │   ├── ProtectedRoute.jsx   # Route protection
│   │   └── Register.jsx         # Registration form
│   ├── context/
│   │   ├── AuthContext.jsx      # Auth state management
│   │   └── SocketContext.jsx    # Socket.IO state
│   ├── pages/
│   │   ├── HomePage.jsx         # Main dashboard
│   │   └── LandingPage.jsx      # Public landing page
│   ├── services/
│   │   ├── geminiService.js     # Gemini AI client
│   │   ├── locationService.js   # Geolocation
│   │   ├── messageService.js    # Message API
│   │   └── socketService.js     # Socket.IO client
│   ├── utils/
│   │   └── api.js               # Axios instance
│   ├── .env (optional)
│   ├── index.html
│   ├── index.jsx                # React entry point
│   ├── App.jsx                  # Main app component
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json              # Vercel deployment config
│
└── README.md                    # This file


---

## 🚀 Deployment

**Frontend (Vercel):** Connect repo → Select `Frontend` folder → Deploy  
**Backend:** Deploy to Render with environment variables  
**Database:** MongoDB Atlas cluster

---

## 📝 License

MIT License - Free to use and modify

---

<div align="center">

**Made with ❤️ to combat food waste**

[⭐ Star this repo](https://github.com/yourusername/shareplate) • [Live Demo](s)

</div>
