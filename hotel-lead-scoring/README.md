# Hotel Lead Scoring API

Backend API for the Hotel Lead Management System with enhanced security.

## Security Features

### Authentication and Authorization

- **JWT Authentication**: All API endpoints are protected with JWT-based authentication
- **Admin Protection**: Admin-specific routes are protected with additional middleware
- **Role-Based Access**: Only specified admin email(s) can access admin routes
- **Token Expiry**: Automatic logout when JWT token expires
- **Token Verification**: Proper handling of Bearer tokens in Authorization header

### Secure Configuration

- **Environment Variables**: All sensitive configurations stored in .env files 
- **No Hardcoded Secrets**: JWT secret and other sensitive data stored securely
- **Consistent Error Responses**: Standardized API error response format

## API Routes

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login existing user
- `GET /api/auth/me` - Get current authenticated user

### Leads (User Routes)
- `GET /api/leads` - Get leads for current user
- `POST /api/leads/send-booking-email` - Send booking confirmation
- `POST /api/leads/update-score` - Update user score

### Admin Routes (Restricted Access)
- `GET /api/leads/all` - Get all leads (admin only)
- `POST /api/leads/check-score` - Send alerts (admin only)
- `POST /api/leads/assign-lead` - Assign lead to representative (admin only)
- `POST /api/calls/trigger-calls` - Trigger calls to high-score leads (admin only)

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file with required environment variables 
4. Run in development mode with `npm run dev`
5. For production, use `npm start` 