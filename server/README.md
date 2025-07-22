# La Orden Suprema - Backend API

Backend API for the La Orden Suprema assassin management system, built with Express.js, TypeScript, and MongoDB.

## Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Admin and Assassin roles with different permissions
- **User Management** - Create and manage assassin profiles
- **Mission System** - Create, assign, and track missions
- **Blood Markers** - Debt tracking system between assassins
- **Dashboard Analytics** - Statistics and activity feeds
- **Input Validation** - Comprehensive request validation with Joi
- **Error Handling** - Centralized error handling and logging
- **Rate Limiting** - Protection against abuse
- **Security** - CORS, Helmet, and other security middleware

## Tech Stack

- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Joi** for validation
- **bcryptjs** for password hashing
- **CORS**, **Helmet** for security

## Prerequisites

- Node.js 18+
- MongoDB 6+ (local or MongoDB Atlas)
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# From the server directory
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the server directory:

```bash
# Create the file
touch .env
```

Add the following configuration to `.env`:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/la-orden-suprema
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/la-orden-suprema

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 3. Start MongoDB

**Option A: Local MongoDB**

```bash
# Start MongoDB service
mongod

# Or on macOS with Homebrew:
brew services start mongodb-community

# Or on Ubuntu/Debian:
sudo systemctl start mongod
```

**Option B: MongoDB Atlas**

- Ensure your connection string in `.env` is correct
- Whitelist your IP address in MongoDB Atlas

### 4. Seed the Database (Recommended)

Create initial data including an admin user:

```bash
# Run the seeding script
npm run seed
```

This creates:

- **Admin user**: `admin@laorden.com` / password: `admin123`
- 5 sample assassins with various skills and statuses
- 10 sample missions in different states
- Sample blood markers between assassins

### 5. Run the Development Server

```bash
# Start the development server with hot reload
npm run dev
```

The API will be available at: **http://localhost:3001**

### 6. Verify Installation

Test the API health endpoint:

```bash
curl http://localhost:3001/health
```

You should see:

```json
{
  "status": "OK",
  "message": "La Orden Suprema API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📦 Available Scripts

```bash
npm run dev                  # Start development server with hot reload
npm run build                # Compile TypeScript to JavaScript
npm start                    # Start production server
npm run lint                 # Run ESLint
npm run test                 # Run tests (when available)
npm run seed                 # Seed database with sample data
npm run clean-blood-markers  # Clean up old blood marker data
```

## 🔧 Environment Variables

| Variable            | Description                 | Default                                      | Required |
| ------------------- | --------------------------- | -------------------------------------------- | -------- |
| `MONGODB_URI`       | MongoDB connection string   | `mongodb://localhost:27017/la-orden-suprema` | Yes      |
| `JWT_SECRET`        | Secret key for JWT tokens   | -                                            | Yes      |
| `JWT_EXPIRES_IN`    | JWT token expiration time   | `7d`                                         | No       |
| `PORT`              | Server port                 | `3001`                                       | No       |
| `NODE_ENV`          | Environment mode            | `development`                                | No       |
| `CORS_ORIGIN`       | Allowed CORS origin         | `http://localhost:5173`                      | Yes      |
| `RATE_LIMIT_WINDOW` | Rate limit window (minutes) | `15`                                         | No       |
| `RATE_LIMIT_MAX`    | Max requests per window     | `100`                                        | No       |

## 📁 Project Structure

```
server/
├── src/
│   ├── app.ts              # Express app setup and middleware
│   ├── config/             # Configuration files
│   │   └── database.ts     # MongoDB connection
│   ├── controllers/        # Route controllers
│   │   ├── auth.ts         # Authentication logic
│   │   ├── assassins.ts    # Assassin management
│   │   ├── missions.ts     # Mission management
│   │   ├── bloodMarkers.ts # Blood marker system
│   │   ├── dashboard.ts    # Dashboard data
│   │   └── profile.ts      # User profile management
│   ├── middleware/         # Custom middleware
│   │   ├── auth.ts         # JWT verification
│   │   └── validation.ts   # Request validation
│   ├── models/             # Mongoose models
│   │   ├── User.ts         # User/Assassin model
│   │   ├── Mission.ts      # Mission model
│   │   └── BloodMarker.ts  # Blood marker model
│   ├── routes/             # API routes
│   │   └── ...             # Route definitions
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
│       ├── errors.ts       # Custom error classes
│       └── jwt.ts          # JWT helpers
├── scripts/                # Utility scripts
│   ├── seed.js             # Database seeding
│   └── clean-blood-markers.js # Cleanup script
├── dist/                   # Compiled JavaScript (after build)
├── .env                    # Environment variables (create this)
├── .env.example            # Example environment file
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 🔐 API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/validate` - Validate JWT token
- `POST /api/auth/refresh` - Refresh JWT token

### Dashboard

- `GET /api/dashboard/admin` - Get admin dashboard data
- `GET /api/dashboard/assassin` - Get assassin dashboard data

### User Management (Admin only)

- `GET /api/assassins` - Get paginated assassins list
- `POST /api/assassins` - Create new assassin
- `GET /api/assassins/search` - Search assassins
- `GET /api/assassins/:id` - Get assassin details
- `PATCH /api/assassins/:id/status` - Update assassin status
- `DELETE /api/assassins/:id` - Delete/excommunicate assassin

### Missions

- `GET /api/missions` - Get missions (Admin)
- `GET /api/missions/available` - Get available missions (Assassin)
- `POST /api/missions` - Create mission (Admin)
- `PUT /api/missions/:id` - Update mission (Admin)
- `PATCH /api/missions/:id/assign` - Assign mission (Admin)
- `POST /api/missions/:id/apply` - Take mission (Assassin)
- `PATCH /api/missions/:id/status` - Update mission status
- `DELETE /api/missions/:id` - Delete mission (Admin)

### Blood Markers (Debts)

- `GET /api/blood-markers` - Get blood markers
- `POST /api/blood-markers` - Create blood marker request
- `GET /api/blood-markers/user/:userId` - Get user's blood markers
- `PATCH /api/blood-markers/:id/respond` - Accept/reject request
- `PATCH /api/blood-markers/:id/pay` - Mark as paid
- `PATCH /api/blood-markers/:id/confirm` - Confirm payment
- `DELETE /api/blood-markers/:id` - Delete blood marker (Admin)

### Profile Management

- `GET /api/profile` - Get current user profile
- `PATCH /api/profile` - Update profile
- `PATCH /api/profile/password` - Change password
- `GET /api/profile/assassin/:id` - Get assassin profile
- `PATCH /api/profile/assassin/:id` - Update assassin profile
- `POST /api/profile/assassin/:id/reset-password` - Reset password (Admin)

## Data Models

### User/Assassin

- Basic user information (alias, email, role)
- Assassin-specific fields (goldCoins, skills, status, missions completed)
- Authentication fields (password hash, first login flags)

### Mission

- Mission details (title, description, target, reward)
- Assignment tracking (assignedTo, assignedAt, status)
- Deadlines and priority levels

### Blood Marker

- Debt relationship between assassins
- Status tracking (pending, paid, confirmed, settled)
- Request/response workflow

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin/Assassin permission system
- **Input Validation**: Joi schema validation
- **Rate Limiting**: Express rate limiter
- **CORS Protection**: Configurable CORS policy
- **Security Headers**: Helmet middleware

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Database Seeding

Default admin account:

- Email: `admin@orden.com`
- Password: `admin123`
- Role: `admin`

## 📝 API Response Format

All API responses follow this format:

```typescript
{
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**

   ```
   Error: connect ECONNREFUSED 127.0.0.1:27017
   ```

   - Solution: Ensure MongoDB is running
   - Check: `mongod --version` to verify installation
   - Start: `mongod` or `brew services start mongodb-community`

2. **JWT_SECRET Not Set**

   ```
   Error: JWT_SECRET is required
   ```

   - Solution: Create `.env` file with JWT_SECRET
   - Never commit `.env` to version control

3. **Port Already in Use**

   ```
   Error: listen EADDRINUSE: address already in use :::3001
   ```

   - Solution: Kill the process or use a different port

   ```bash
   lsof -ti:3001 | xargs kill -9
   # Or change PORT in .env
   ```

4. **CORS Issues**

   ```
   Access to fetch at 'http://localhost:3001' from origin 'http://localhost:5173' has been blocked by CORS
   ```

   - Solution: Update CORS_ORIGIN in `.env` to match frontend URL

5. **TypeScript Build Errors**
   ```bash
   # Clear and rebuild
   rm -rf dist
   npm run build
   ```

## 🧪 Testing the API

### Using cURL

Login:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@laorden.com", "password": "admin123"}'
```

Get Dashboard (with token):

```bash
curl http://localhost:3001/api/dashboard/admin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman or Insomnia

1. Import the API collection (if available)
2. Set up environment variables
3. Use the login endpoint to get a token
4. Add token to Authorization header for protected routes

## 🚢 Production Deployment

### 1. Environment Setup

Create production `.env`:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://prod-user:password@cluster.mongodb.net/la-orden-suprema
JWT_SECRET=use-a-very-strong-secret-key-here
CORS_ORIGIN=https://your-frontend-domain.com
```

### 2. Build the Application

```bash
npm run build
```

### 3. Start Production Server

```bash
npm start
```

## 🔒 Security Best Practices

1. **Environment Variables**

   - Never commit `.env` files
   - Use different secrets for each environment
   - Rotate JWT secrets regularly

2. **Database Security**

   - Enable MongoDB authentication
   - Use connection string with credentials
   - Restrict network access

3. **API Security**
   - Rate limiting enabled
   - Helmet.js for security headers
   - Input validation with Joi
   - Parameterized queries (Mongoose)
