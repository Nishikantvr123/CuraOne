# Practitioner Accounts Guide

## Overview
This document explains how practitioner accounts work in the CuraOne system and how to access bookings for different practitioners.

---

## Demo Practitioner Accounts

### All Practitioner Login Credentials
**Password for all accounts**: `password123`

| Email | Name | Specializations | Experience |
|-------|------|-----------------|------------|
| `practitioner@curaone.com` | Dr. Sarah Smith | Panchakarma, Ayurvedic Massage, Herbal Medicine | 8 years |
| `raj.patel@curaone.com` | Dr. Raj Patel | Detox Therapy, Wellness Counseling, Yoga Therapy | 10 years |
| `maya.sharma@curaone.com` | Dr. Maya Sharma | Shirodhara, Abhyanga, Marma Therapy | 6 years |
| `aman.verma@curaone.com` | Dr. Aman Verma | Nasya, Basti, Virechana | 12 years |
| `priya.reddy@curaone.com` | Dr. Priya Reddy | Herbal Medicine, Diet Consultation, Lifestyle Counseling | 5 years |

### Quick Login Guide

**To test bookings for a specific practitioner:**

1. **Login as Patient** (`patient@curaone.com` / `password123`)
2. **Book a session** and select the practitioner you want to test
3. **Logout** and login with that practitioner's email
4. **View bookings** in their dashboard

**Example:**
- Book with "Dr. Raj Patel" → Login as `raj.patel@curaone.com` to see the booking
- Book with "Dr. Maya Sharma" → Login as `maya.sharma@curaone.com` to see the booking

---

## How Bookings Work

### 1. Patient Books a Session
When a patient books a session:
- They select a **therapy** (e.g., Abhyanga, Shirodhara)
- They select a **practitioner** from the dropdown (e.g., Dr. Sarah Smith)
- They choose a **date and time**
- The booking is created with status "scheduled"

### 2. Viewing Bookings

#### As Admin (`admin@curaone.com`)
- Can see **ALL bookings** for all practitioners
- Navigate to: Admin Dashboard → Bookings tab
- Shows all bookings with patient, practitioner, therapy, date, and status

#### As Practitioner (`practitioner@curaone.com`)
- Can see **ONLY their own bookings**
- Navigate to: Practitioner Dashboard → My Bookings
- Shows only bookings where `practitionerId` matches their account

#### As Patient (`patient@curaone.com`)
- Can see **ONLY their own bookings**
- Navigate to: Patient Dashboard → My Bookings
- Shows only bookings where `patientId` matches their account

---

## Important Notes

### Practitioner Selection in Booking Form
The booking form now fetches **real practitioners** from the database:
- Previously used hardcoded mock data with fake IDs
- Now uses actual practitioner accounts from the database
- Shows practitioner name and specializations in the dropdown

### Checking Bookings for Dr. Sarah Smith
To see bookings for Dr. Sarah Smith:

1. **Option 1: Login as Dr. Sarah Smith**
   - Email: `practitioner@curaone.com`
   - Password: `password123`
   - Go to Practitioner Dashboard
   - View "My Bookings" section

2. **Option 2: Login as Admin**
   - Email: `admin@curaone.com`
   - Password: `password123`
   - Go to Admin Dashboard → Bookings tab
   - Filter by practitioner "Dr. Sarah Smith"

### Creating Additional Practitioners
To add more practitioners:

1. **Register a new account** with role "practitioner"
2. **Or use the seed script** to add more demo practitioners
3. Edit `backend/utils/seedDb.js` and add new practitioner objects
4. Run: `node backend/utils/seedDb.js`

---

## Troubleshooting

### "I booked with Dr. Sarah Smith but don't see it in practitioner dashboard"
- Make sure you're logged in as `practitioner@curaone.com` (Dr. Sarah Smith's account)
- Check that the booking was created successfully (look for success notification)
- Verify in Admin dashboard that the booking shows the correct practitioner

### "Practitioner dropdown is empty"
- The practitioners endpoint requires authentication
- Make sure you're logged in before accessing the booking form
- Check browser console for any API errors

### "Dates showing 2024 instead of 2026"
- This has been fixed in the latest update
- Mock data now uses 2026 dates
- Real bookings will use the actual current date

---

## Database Structure

### Practitioners in Database
```javascript
{
  _id: "string",
  firstName: "Dr. Sarah",
  lastName: "Smith",
  email: "practitioner@curaone.com",
  role: "practitioner",
  specialization: ["Panchakarma", "Ayurvedic Massage", "Herbal Medicine"],
  experience: 8,
  isActive: true
}
```

### Bookings in Database
```javascript
{
  id: "string",
  patientId: "patient-id",
  practitionerId: "practitioner-id", // Links to Dr. Sarah Smith's ID
  therapyId: "therapy-id",
  scheduledDate: "2026-04-20",
  scheduledTime: "10:00",
  status: "scheduled", // or "confirmed", "completed", "cancelled"
  notes: "Any special requests"
}
```

---

## Recent Updates

### ✅ Fixed Issues
1. **Practitioner Mismatch**: Booking form now uses real practitioners from database instead of hardcoded mock data
2. **Date Display**: Updated mock data to show 2026 dates instead of 2024
3. **API Endpoint**: Added `/api/admin/practitioners` endpoint to fetch all practitioners
4. **Booking Form**: Now fetches and displays real practitioners with their specializations

### 🔄 How It Works Now
- When you open the booking form, it fetches all active practitioners from the database
- The dropdown shows: "Dr. Sarah Smith - Panchakarma, Ayurvedic Massage, Herbal Medicine"
- When you book, it uses the real practitioner ID from the database
- The booking is correctly linked to Dr. Sarah Smith's account
- You can view it by logging in as `practitioner@curaone.com`

---

## Testing the Fix

1. **Login as Patient** (`patient@curaone.com`)
2. **Book a Session**:
   - Select any therapy
   - Select "Dr. Sarah Smith" from practitioner dropdown
   - Choose a date and time
   - Submit the booking
3. **Verify Success**: You should see "Booking created successfully!" notification
4. **Login as Practitioner** (`practitioner@curaone.com`)
5. **Check Bookings**: Navigate to "My Bookings" section
6. **Verify**: You should see the booking you just created

---

## Contact
For any issues or questions, contact the development team or check the main `PROJECT_SUMMARY.md` for more details.


---

## ✅ LATEST UPDATE - All Issues Fixed!

### What Was Fixed:

1. **Removed Mock Appointments**: Practitioner dashboard now fetches real bookings from API
2. **Fixed 2024 Dates**: All dates now use current year (2026)
3. **Real-time Stats**: Stats calculated from actual booking data
4. **All 5 Practitioners**: All practitioners now appear in booking dropdown
5. **Empty State**: Shows "No appointments" when no bookings exist

### Complete Practitioner List:

| Email | Password | Name | Specializations |
|-------|----------|------|-----------------|
| `practitioner@curaone.com` | `password123` | Dr. Sarah Smith | Panchakarma, Ayurvedic Massage, Herbal Medicine |
| `raj.patel@curaone.com` | `password123` | Dr. Raj Patel | Detox Therapy, Wellness Counseling, Yoga Therapy |
| `maya.sharma@curaone.com` | `password123` | Dr. Maya Sharma | Shirodhara, Abhyanga, Marma Therapy |
| `aman.verma@curaone.com` | `password123` | Dr. Aman Verma | Nasya, Basti, Virechana |
| `priya.reddy@curaone.com` | `password123` | Dr. Priya Reddy | Herbal Medicine, Diet Consultation, Lifestyle Counseling |

### How to Test:

1. **Login as patient**: `patient@curaone.com` / `password123`
2. **Book a session** with any practitioner (all 5 should appear in dropdown)
3. **Logout** and login with that practitioner's email
4. **Verify**: The booking appears in their dashboard with correct date!

### Before vs After:

**Before:**
- ❌ Mock appointments with 2024 dates showing for everyone
- ❌ Same appointments for all practitioners
- ❌ Only 3 practitioners in booking dropdown
- ❌ Hardcoded stats

**After:**
- ✅ Real bookings from database
- ✅ Each practitioner sees only their own bookings
- ✅ All 5 practitioners available in booking form
- ✅ Stats calculated from real data
- ✅ Current dates (2026)
- ✅ Empty state when no bookings exist
