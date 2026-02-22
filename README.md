# CuraOne - Therapy Management Platform

A comprehensive therapy management platform built with React and Node.js for Ayurvedic therapy centers.

## 🌟 Features

- **Patient Management** - Book sessions, track wellness progress, view treatment history
- **Practitioner Dashboard** - Manage schedules, patient bookings, and feedback responses  
- **Admin Panel** - Complete system management, user administration, and analytics
- **Real-time Notifications** - Live updates via Socket.IO for bookings and system events
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Terminal/Command Line** access

### Step 1: Navigate to Project Directory

```bash
cd /path/to/curaone-app
```

### Step 2: Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Install dependencies (only needed first time)
npm install

# Start the backend server on port 5001
PORT=5001 npm start
```

You should see:
```
🚀 CuraOne Backend Server is running!
📍 Port: 5001
🌐 Environment: development
📊 Database: Connected
⚡ Socket.IO: Enabled
```

**Keep this terminal window open!**

### Step 3: Start the Frontend (New Terminal Window)

Open a **new terminal window** and run:

```bash
# Navigate to frontend directory
cd /path/to/curaone-app/frontend

# Install dependencies (only needed first time)
npm install

# Start the frontend development server
npm run dev
```

You should see:
```
VITE v7.1.5  ready in 238 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Keep this terminal window open too!**

### Step 4: Open in Browser

Open your web browser and go to:
```
http://localhost:5173/
```

## 🔐 Test User Accounts

Use these pre-created accounts to test different user roles:

### Patient Account
- **Email:** `test@example.com`  
- **Password:** `Test123!`
- **Features:** Book sessions, track wellness, view progress

### Practitioner Account
- **Email:** `practitioner@test.com`
- **Password:** `Test123!`
- **Features:** Manage schedule, confirm bookings, patient management

### Admin Account  
- **Email:** `admin@test.com`
- **Password:** `Test123!`
- **Features:** Full system management, user admin, analytics

## 🎯 What You Can Do

### As a Patient:
1. **Dashboard** - View treatment progress and upcoming sessions
2. **Book Sessions** - Select therapy, practitioner, date, and time
3. **Wellness Tracking** - Daily check-ins and progress monitoring
4. **Notifications** - Real-time updates about bookings

### As a Practitioner:
1. **Schedule Management** - View and manage your appointments
2. **Patient Management** - Access patient information and history  
3. **Booking Confirmations** - Approve or reschedule appointments
4. **Session Notes** - Add notes and feedback after sessions

### As an Admin:
1. **System Overview** - Dashboard with key metrics and analytics
2. **User Management** - Add, edit, and manage user accounts
3. **Therapy Management** - Add, edit, and delete therapy offerings
4. **Booking Management** - View all bookings, export reports
5. **System Settings** - Configure notifications, payments, security
6. **System Maintenance** - Backups, updates, and health monitoring

## 🛠️ Development Commands

### Backend Commands
```bash
cd backend

# Start server
npm start

# Start with specific port
PORT=5001 npm start

# Install new packages
npm install package-name
```

### Frontend Commands
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install new packages
npm install package-name
```

## 📁 Project Structure

```
curaone-app/
├── backend/                 # Node.js API server
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Authentication & validation
│   ├── routes/             # API route definitions  
│   ├── services/           # Business logic
│   ├── utils/              # Helper functions
│   ├── config/             # Database & server config
│   ├── db.json             # File-based database
│   └── server.js           # Main server file
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React Context providers
│   │   ├── services/       # API service classes
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Helper utilities
│   │   └── App.jsx         # Main app component
│   └── public/             # Static assets
│
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env` file):
```bash
VITE_API_URL=http://localhost:5001/api
```

**Backend** (environment or command line):
```bash
PORT=5001              # Server port
NODE_ENV=development   # Environment mode
JWT_SECRET=your-secret # JWT signing secret
```

## 🌐 API Endpoints

The backend provides these main API routes:

- **Authentication:** `/api/auth/*`
  - POST `/api/auth/register` - User registration
  - POST `/api/auth/login` - User login
  - GET `/api/auth/profile` - Get user profile

- **Bookings:** `/api/bookings/*`
  - GET `/api/bookings/my-bookings` - User's bookings
  - POST `/api/bookings` - Create new booking
  - GET `/api/bookings/available-slots/:practitionerId` - Available time slots

- **Wellness:** `/api/wellness/*`
  - POST `/api/wellness/checkin` - Daily wellness check-in
  - GET `/api/wellness/history` - Wellness tracking history

- **Therapies:** `/api/therapies`
  - GET `/api/therapies` - List all available therapies

## 🔄 Real-time Features

The app includes real-time notifications using Socket.IO:

- **Booking Updates** - Live notifications when bookings are confirmed/cancelled
- **Wellness Updates** - Real-time wellness tracking updates  
- **System Notifications** - Admin announcements and system alerts
- **Connection Status** - Shows online/offline status in the notification dropdown

## 🎨 UI Features

- **Responsive Design** - Works on all screen sizes
- **Toast Notifications** - Beautiful success/error feedback
- **Loading States** - Skeleton loaders and loading indicators
- **Error Boundaries** - Graceful error handling
- **Accessibility** - ARIA labels and keyboard navigation support

## 📱 Browser Compatibility

Supports all modern browsers:
- Chrome (recommended)
- Firefox  
- Safari
- Edge

## 🚨 Troubleshooting

### Backend Won't Start
- Check if port 5001 is already in use: `lsof -i :5001`
- Try a different port: `PORT=5002 npm start`

### Frontend Won't Load  
- Make sure backend is running first
- Check if ports 5173/5174 are available
- Clear browser cache and try again

### Login Issues
- Ensure backend server is running on port 5001
- Check browser console for error messages
- Try registering a new account

### Can't See Data
- Verify API calls in browser Network tab
- Check backend terminal for error messages
- Ensure you're logged in with the correct user role

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt password encryption
- **Role-based Access** - Different permissions for each user type
- **Input Validation** - Server-side data validation
- **CORS Protection** - Cross-origin request security

## 📈 Performance

- **Fast Loading** - Optimized with Vite build tool
- **Code Splitting** - Lazy loading of components
- **Caching** - API response caching
- **Efficient Updates** - React state management

## 🤝 Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch: `git checkout -b new-feature`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Look at browser console for error messages
3. Check both terminal windows for error logs
4. Ensure all dependencies are installed with `npm install`

## 🎉 Enjoy!

You now have a fully functional therapy management platform! Explore all the features and see how everything works together seamlessly.