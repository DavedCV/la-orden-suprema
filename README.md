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

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd la-orden-suprema
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. **Environment Setup**

Create a `.env` file in the `server` directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/la-orden-suprema

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

4. **Start the applications**

**Option 1: Start both servers manually**
```bash
# Terminal 1: Start the backend
cd server
npm run dev

# Terminal 2: Start the frontend
cd client
npm run dev
```

**Option 2: Start both from root (if configured)**
```bash
npm run dev
```

### Creating Initial Admin User

Since the application uses a closed registration system, you'll need to create an initial admin user. You can do this by:

1. **Direct database insertion** (MongoDB):
```javascript
// Connect to your MongoDB and run:
db.users.insertOne({
  alias: "El Director",
  email: "admin@laorden.com",
  password: "$2a$12$hashedPasswordHere", // Use bcrypt to hash "admin123"
  role: "admin",
  isFirstLogin: false,
  temporaryPassword: false,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

2. **Using MongoDB Compass or similar tools** to insert the initial admin user.

3. **Create a seeding script** (recommended for development).

### Default Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/validate` - Validate JWT token
- `POST /api/auth/refresh` - Refresh JWT token

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard data
- `GET /api/dashboard/assassin` - Assassin dashboard data

### User Management (Admin only)
- `GET /api/assassins` - List assassins with pagination
- `POST /api/assassins` - Create new assassin
- `GET /api/assassins/:id` - Get assassin details
- `PATCH /api/assassins/:id` - Update assassin
- `PATCH /api/assassins/:id/status` - Update assassin status

### Missions
- `GET /api/missions` - List missions with filters
- `POST /api/missions` - Create new mission (Admin)
- `GET /api/missions/available` - Available missions for assassins
- `POST /api/missions/:id/assign` - Assign mission (Admin)
- `PATCH /api/missions/:id/status` - Update mission status

### Blood Markers (Debts)
- `GET /api/blood-markers` - List blood markers
- `POST /api/blood-markers` - Create new blood marker request
- `POST /api/blood-markers/:id/respond` - Accept/reject blood marker
- `POST /api/blood-markers/:id/pay` - Mark as paid
- `POST /api/blood-markers/:id/confirm` - Confirm payment

### Profile
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update profile
- `PATCH /api/profile/password` - Change password

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable CORS origins
- **Input Validation**: Joi schema validation
- **Role-based Access**: Admin and Assassin roles with different permissions
- **Excommunication**: Ability to block access for specific users

## Business Rules

### User Roles
- **Admin ("La Orden")**: Can manage all assassins, missions, and view global data
- **Assassin**: Can view their own data, apply to missions, manage blood markers

### Mission Lifecycle
1. **No Asignada**: Available for assignment
2. **Asignada**: Assigned to an assassin
3. **En Progreso**: Assassin is working on it
4. **Completada**: Successfully completed
5. **Fallida**: Mission failed

### Blood Marker System
1. **Solicitud Pendiente**: Initial request requiring acceptance
2. **Pendiente**: Active debt
3. **Pago Pendiente de Confirmación**: Debtor marked as paid, awaiting creditor confirmation
4. **Saldado**: Debt settled and confirmed
5. **Rechazada**: Request was rejected

## Development

### Project Structure
```
la-orden-suprema/
├── client/                 # React frontend
│   ├── src/
│   │   ├── features/      # Feature-based modules
│   │   ├── shared/        # Shared components, hooks, services
│   │   └── ...
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── ...
├── docs/                  # Documentation
└── shared/               # Shared types/utilities
```

### Key Technologies

- **Monorepo Structure**: Organized as a monorepo with separate client/server
- **TypeScript**: Full type safety across the stack
- **Feature-Sliced Design**: Frontend organized by features
- **API-First**: RESTful API design with proper HTTP status codes
- **Real-time Ready**: Architecture supports future WebSocket integration

## Contributing

1. Follow the existing code style and structure
2. Ensure all types are properly defined
3. Add proper error handling
4. Write meaningful commit messages
5. Test your changes thoroughly

## License

This project is for educational purposes only.
