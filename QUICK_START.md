# 🚀 Quick Start Guide

## Option 1: One-Command Startup (Recommended)

```bash
cd /Users/macbookproretina/ayursutra-app
./start.sh
```

This script will:
- ✅ Check that Node.js and npm are installed  
- ✅ Install any missing dependencies
- ✅ Start both backend and frontend servers
- ✅ Show you the URLs and test accounts
- ✅ Handle cleanup when you press Ctrl+C

## Option 2: Manual Startup

If you prefer to start servers manually:

### Terminal 1 - Backend:
```bash
cd /Users/macbookproretina/ayursutra-app/backend  
PORT=5001 npm start
```

### Terminal 2 - Frontend:
```bash  
cd /Users/macbookproretina/ayursutra-app/frontend
npm run dev
```

## Then Open Your Browser

Go to: **http://localhost:5173**

## Test Accounts

| Role | Email | Password | 
|------|-------|----------|
| Patient | `test@example.com` | `Test123!` |
| Practitioner | `practitioner@test.com` | `Test123!` |  
| Admin | `admin@test.com` | `Test123!` |

## What to Try

### 🧑‍⚕️ As a Patient:
1. **Login** with patient account
2. **Book a session** - try the booking flow
3. **Check notifications** - click the bell icon
4. **View dashboard** - see progress and upcoming sessions

### 👨‍⚕️ As a Practitioner:  
1. **Login** with practitioner account  
2. **View dashboard** - see patient bookings
3. **Manage schedule** - confirm/reschedule appointments

### 👨‍💼 As an Admin:
1. **Login** with admin account
2. **Try all the buttons** - they all work now!
   - Add Therapy
   - Export bookings (downloads CSV)
   - Edit/Delete therapies  
   - Confirm/Cancel bookings
   - Save settings
   - System maintenance buttons
3. **Explore all tabs** - Overview, Users, Therapies, Bookings, Settings

## That's It! 🎉

The entire platform is now running and all features are functional. Enjoy exploring!

---

*For detailed documentation, see README.md*