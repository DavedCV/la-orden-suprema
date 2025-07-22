# La Orden Suprema - Assassin Management System

A comprehensive management system for The Continental inspired by the John Wick universe. This application allows administrators to manage assassins, missions, and blood markers (debts) within the organization.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Admin can create and manage assassin profiles
- **Mission Management**: Create, assign, and track mission progress
- **Blood Markers**: Debt/favor tracking system between assassins
- **Dashboard**: Role-specific dashboards for admins and assassins
- **Profile Management**: User profile editing and skill management

## Tech Stack

### Backend
- **Node.js** with **Express.js** and **TypeScript**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Joi** for validation
- **Security**: Helmet, CORS, rate limiting

### Frontend
- **React 19** with **TypeScript**
- **Vite** for development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Hook Form** with **Zod** validation
- **React Query** for API state management

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### 1️⃣ Clone the Repository
```bash
git clone <repository-url>
cd la-orden-suprema
```

### 2️⃣ Install Dependencies

**Option A: Install all dependencies at once (Recommended)**
```bash
# From the root directory
npm run install:all
```

**Option B: Install manually**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
cd ..
```

### 3️⃣ Set Up Environment Variables

Create a `.env` file in the `server` directory:
```bash
cd server
touch .env
```

Add the following content to `server/.env`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/la-orden-suprema
# For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/la-orden-suprema

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# CORS (Frontend URL)
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 4️⃣ Start MongoDB

**If using local MongoDB:**
```bash
# Make sure MongoDB is installed and start it
mongod

# Or on macOS with Homebrew:
brew services start mongodb-community
```

**If using MongoDB Atlas:**
- Make sure to update the `MONGODB_URI` in your `.env` file with your connection string

### 5️⃣ Seed the Database (Optional but Recommended)

Create initial data including an admin user:
```bash
# From the root directory
npm run seed

# Or from the server directory
cd server
npm run seed
```

This will create:
- An admin user: `admin@laorden.com` / password: `admin123`
- Sample assassins
- Sample missions
- Sample blood markers

### 6️⃣ Run the Application

**Option A: Start both frontend and backend together (Recommended)**
```bash
# From the root directory
npm run dev
```

**Option B: Start separately in different terminals**
```bash
# Terminal 1 - Backend (from root)
npm run dev:server

# Terminal 2 - Frontend (from root)
npm run dev:client
```

**Option C: Start from individual directories**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 7️⃣ Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **API Health Check**: http://localhost:3001/health

### 8️⃣ Login Credentials

After seeding, you can login with:
- **Admin**: `admin@laorden.com` / `admin123`
- **Assassin**: Check the console output after seeding for assassin credentials

## 📁 Project Structure

```
la-orden-suprema/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── features/      # Feature-based modules
│   │   ├── shared/        # Shared components, hooks, services
│   │   └── ...
├── server/                # Express backend API
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── ...
├── docs/                  # Documentation
├── scripts/              # Utility scripts
└── shared/               # Shared types/utilities between frontend and backend
```

## 🛠️ Development Commands

### Root Directory Commands
```bash
npm run dev              # Start both frontend and backend
npm run build            # Build both applications
npm run install:all      # Install all dependencies
npm run seed             # Seed the database
```

### Frontend Commands (from `client/` directory)
```bash
npm run dev              # Start development server (port 5173)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

### Backend Commands (from `server/` directory)
```bash
npm run dev              # Start development server (port 3001)
npm run build            # Compile TypeScript
npm start                # Start production server
npm run seed             # Seed database with sample data
npm run lint             # Run ESLint
```

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`
   - Check if the MongoDB URI in `.env` is correct
   - For MongoDB Atlas, ensure your IP is whitelisted

2. **Port Already in Use**
   - Frontend default port: 5173
   - Backend default port: 3001
   - Kill the process using the port or change it in the configuration

3. **CORS Errors**
   - Ensure `CORS_ORIGIN` in backend `.env` matches your frontend URL
   - Default frontend URL is `http://localhost:5173`

4. **Authentication Issues**
   - Clear browser localStorage
   - Ensure JWT_SECRET is set in backend `.env`
   - Check if the token is being sent in requests

5. **Dependencies Issues**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   rm -rf client/node_modules client/package-lock.json
   rm -rf server/node_modules server/package-lock.json
   npm run install:all
   ```

## 🚢 Production Deployment

### Backend Deployment
1. Set production environment variables
2. Build: `npm run build:server`
3. Start: `npm run start:server`

### Frontend Deployment
1. Update API URL in frontend configuration
2. Build: `npm run build:client`
3. Serve the `client/dist` folder with a static server

### Environment Variables for Production
- Use strong, unique `JWT_SECRET`
- Set `NODE_ENV=production`
- Use proper MongoDB connection string with authentication
- Update `CORS_ORIGIN` to match your frontend domain

## 📝 API Documentation

### Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Main Endpoints
- **Auth**: `/api/auth/*`
- **Dashboard**: `/api/dashboard/*`
- **Assassins**: `/api/assassins/*`
- **Missions**: `/api/missions/*`
- **Blood Markers**: `/api/blood-markers/*`
- **Profile**: `/api/profile/*`

For detailed API documentation, see the backend README or API docs.

## 📌 Additional Resources

- [Frontend Documentation](./client/README.md)
- [Backend Documentation](./server/README.md)
- [API Endpoints Reference](./docs/api-reference.md)

## 🤝 Contributing

1. Follow the existing code style and structure
2. Ensure all types are properly defined (TypeScript)
3. Add proper error handling
4. Write meaningful commit messages
5. Test your changes thoroughly

## 📄 License

This project is for educational purposes as part of a university assignment.
