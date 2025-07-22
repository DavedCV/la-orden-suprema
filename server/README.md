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
- MongoDB 6+
- npm or yarn

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. **Start MongoDB** (if running locally):
```bash
mongod
```

4. **Run the development server**:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/la-orden-suprema` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-jwt-key` |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW` | Rate limit window (minutes) | `15` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

## API Endpoints

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

## Deployment

1. **Build the application**:
```bash
npm run build
```

2. **Set production environment variables**

3. **Start the production server**:
```bash
npm start
```

## API Response Format

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

## Error Handling

The API uses custom error classes and centralized error handling:

- `400` - Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Contributing

1. Follow TypeScript best practices
2. Use Joi for input validation
3. Add proper error handling
4. Include JSDoc comments for API endpoints
5. Test your changes thoroughly

## License

This project is part of a university assignment for Web Development course.
