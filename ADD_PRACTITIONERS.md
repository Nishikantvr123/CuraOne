# How to Add All Practitioner Accounts

## Step 1: Make sure MongoDB is connected

If you're having MongoDB Atlas connection issues, you have two options:

### Option A: Fix MongoDB Atlas Connection
1. Try switching to mobile hotspot or different WiFi
2. Check MongoDB Atlas status: https://status.mongodb.com/
3. Try using a VPN

### Option B: Use MongoDB Compass (Manual Entry)
If the seed script doesn't work due to connection issues, you can manually add practitioners using MongoDB Compass:

1. **Download MongoDB Compass**: https://www.mongodb.com/products/compass
2. **Connect** using your connection string
3. **Navigate** to `curaone` database → `users` collection
4. **Insert** each practitioner document manually

## Step 2: Run the Seed Script

Once MongoDB is connected, run:

```bash
cd backend
node utils/seedDb.js
```

You should see:
```
✅ Connected to MongoDB Atlas
✅ Created practitioner: practitioner@curaone.com
✅ Created practitioner: raj.patel@curaone.com
✅ Created practitioner: maya.sharma@curaone.com
✅ Created practitioner: aman.verma@curaone.com
✅ Created practitioner: priya.reddy@curaone.com
✅ Created patient: patient@curaone.com
✅ Created admin: admin@curaone.com

🎉 Seed complete! Demo credentials:

📋 PATIENT ACCOUNT:
   patient@curaone.com / password123

👨‍⚕️ PRACTITIONER ACCOUNTS:
   practitioner@curaone.com / password123 (Dr. Sarah Smith)
   raj.patel@curaone.com / password123 (Dr. Raj Patel)
   maya.sharma@curaone.com / password123 (Dr. Maya Sharma)
   aman.verma@curaone.com / password123 (Dr. Aman Verma)
   priya.reddy@curaone.com / password123 (Dr. Priya Reddy)

👑 ADMIN ACCOUNT:
   admin@curaone.com / password123
```

## Step 3: Test the Practitioners

### Test 1: Book with Dr. Raj Patel
1. Login as patient: `patient@curaone.com` / `password123`
2. Book a session with "Dr. Raj Patel"
3. Logout and login as: `raj.patel@curaone.com` / `password123`
4. Check "My Bookings" - you should see the booking

### Test 2: Book with Dr. Maya Sharma
1. Login as patient: `patient@curaone.com` / `password123`
2. Book a session with "Dr. Maya Sharma"
3. Logout and login as: `maya.sharma@curaone.com` / `password123`
4. Check "My Bookings" - you should see the booking

### Test 3: View All Bookings as Admin
1. Login as admin: `admin@curaone.com` / `password123`
2. Go to Admin Dashboard → Bookings tab
3. You should see all bookings for all practitioners

## All Practitioner Credentials

| Email | Password | Name | Specializations |
|-------|----------|------|-----------------|
| practitioner@curaone.com | password123 | Dr. Sarah Smith | Panchakarma, Ayurvedic Massage, Herbal Medicine |
| raj.patel@curaone.com | password123 | Dr. Raj Patel | Detox Therapy, Wellness Counseling, Yoga Therapy |
| maya.sharma@curaone.com | password123 | Dr. Maya Sharma | Shirodhara, Abhyanga, Marma Therapy |
| aman.verma@curaone.com | password123 | Dr. Aman Verma | Nasya, Basti, Virechana |
| priya.reddy@curaone.com | password123 | Dr. Priya Reddy | Herbal Medicine, Diet Consultation, Lifestyle Counseling |

## Troubleshooting

### "User already exists" error
This is normal - it means the account is already in the database. The seed script skips existing users.

### MongoDB connection timeout
- Try mobile hotspot
- Check if MongoDB Atlas is accessible from your network
- Use MongoDB Compass to manually add practitioners

### Can't see practitioner in booking dropdown
- Make sure the backend server is running
- Check that `isActive: true` for the practitioner
- Refresh the booking form page
