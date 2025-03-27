# AI Lead Management System for Hotels

A full-stack application designed to manage and score hotel booking leads for improved conversion rates and personalized customer service.

## Project Structure

This project consists of two main components:

1. **Frontend (hotel-lead-management)**: A React-based web application for hotel staff and administrators.
2. **Backend (hotel-lead-scoring)**: An Express.js API that handles lead scoring, user authentication, and notifications.

## Features

### Frontend

- User authentication (login/signup)
- Hotel browsing and filtering
- Wishlist management for potential bookings
- Admin dashboard for lead management
- Real-time lead scoring visualization
- Responsive design with Tailwind CSS

### Backend

- JWT-based authentication and authorization
- Role-based access control
- Lead scoring algorithm
- Email notifications
- Call scheduling for high-value leads
- MongoDB database integration
- API endpoints for lead management

## Security Features

- Secure JWT authentication
- Protected admin routes
- Environment variable configuration
- Consistent error handling
- Proper password hashing

## Technologies Used

### Frontend
- React 19
- React Router
- Tailwind CSS
- Axios for API requests
- Radix UI components
- Vite.js build system

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for email notifications
- Twilio for WhatsApp notifications and call scheduling
- Gemini API integration

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB instance
- NPM or Yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/krishna-nishant/lead-management.git
cd lead-management
```

2. Setup the backend:
```bash
cd hotel-lead-scoring
npm install
cp .env.example .env  # Create and configure your .env file
npm run dev
```

3. Setup the frontend:
```bash
cd ../hotel-lead-management
npm install
cp .env.example .env  # Create and configure your .env file
npm run dev
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login existing user
- `GET /api/auth/me` - Get current authenticated user

### Leads
- `GET /api/leads` - Get leads for current user
- `POST /api/leads/send-booking-email` - Send booking confirmation
- `POST /api/leads/update-score` - Update user score

### Admin Routes
- `GET /api/leads/all` - Get all leads (admin only)
- `POST /api/leads/check-score` - Send alerts (admin only)
- `POST /api/leads/assign-lead` - Assign lead to representative (admin only)
- `POST /api/calls/trigger-calls` - Trigger calls to high-score leads (admin only)

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/hotel-leads
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@example.com
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
OPENAI_API_KEY=your_openai_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
