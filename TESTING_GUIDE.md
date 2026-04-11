# AyurSutra E2E Testing Guide

This document outlines the complete end-to-end testing process for the AyurSutra therapy management platform.

## Prerequisites

1. **Backend Server**: Make sure the backend is running on port 5001
   ```bash
   cd backend && PORT=5001 npm start
   ```

2. **Frontend Application**: Start the frontend development server
   ```bash
   cd frontend && npm run dev
   ```

## Testing Checklist

### 🔐 Authentication Flow

#### Registration
- [ ] Navigate to `/auth`
- [ ] Click "Sign Up" tab
- [ ] Fill in registration form with valid data:
  - Name: John Doe
  - Email: test@example.com
  - Password: Test123!@#
  - Role: Patient/Practitioner/Admin
- [ ] Submit form and verify successful registration
- [ ] Check that user is automatically logged in
- [ ] Verify redirect to appropriate dashboard

#### Login
- [ ] From auth page, click "Login" tab
- [ ] Enter credentials from registration
- [ ] Verify successful login
- [ ] Check proper role-based dashboard routing:
  - Patient → Enhanced Patient Dashboard
  - Practitioner → Practitioner Dashboard  
  - Admin → Admin Dashboard

#### Logout
- [ ] Click user menu in header
- [ ] Click "Sign out"
- [ ] Verify user is logged out and redirected to auth page

### 👤 Patient Dashboard Testing

#### Dashboard Overview
- [ ] Verify header with logo, title, and navigation elements
- [ ] Check notification bell with real-time connection status
- [ ] Verify user menu with profile info and logout option
- [ ] Check stats cards display correctly:
  - Treatment Progress
  - Current Streak
  - Next Session
  - Wellness Score

#### Booking System
- [ ] Click "Book Session" button
- [ ] Verify therapy options load from API
- [ ] Select a therapy and verify details display
- [ ] Select a practitioner
- [ ] Choose a date (today or future)
- [ ] Wait for available slots to load
- [ ] Select a time slot
- [ ] Add optional notes
- [ ] Submit booking and verify success
- [ ] Check booking appears in upcoming sessions

#### Real-time Notifications
- [ ] Click notification bell to open dropdown
- [ ] Verify connection status shows "Connected"
- [ ] Click "🧪" test notification button
- [ ] Verify test notification appears
- [ ] Check browser notification permission (if granted)
- [ ] Mark notification as read
- [ ] Clear notifications

#### Error Handling
- [ ] Disconnect internet and verify error states
- [ ] Try booking with invalid data
- [ ] Verify loading states during API calls
- [ ] Check error boundaries catch component errors

### 👨‍⚕️ Practitioner Dashboard Testing

#### Dashboard Overview
- [ ] Login as practitioner role
- [ ] Verify practitioner-specific dashboard loads
- [ ] Check schedule management interface
- [ ] Verify patient booking management
- [ ] Test feedback response system

#### Patient Management
- [ ] View list of assigned patients
- [ ] Check booking confirmations
- [ ] Respond to patient feedback
- [ ] Update session notes

### 👨‍💼 Admin Dashboard Testing

#### System Overview
- [ ] Login as admin role
- [ ] Verify admin dashboard loads correctly
- [ ] Check system analytics and metrics
- [ ] Verify user management interface

#### User Management
- [ ] View all users list
- [ ] Search/filter users
- [ ] Manage user roles and permissions
- [ ] View user activity logs

#### Booking Management
- [ ] View all system bookings
- [ ] Filter bookings by status/date/practitioner
- [ ] Update booking statuses
- [ ] Generate booking reports

#### System Settings
- [ ] Access system settings tab
- [ ] Verify all setting categories:
  - General Settings
  - Notification Preferences  
  - Payment Settings
  - Security Settings
  - System Maintenance
- [ ] Update settings and verify persistence

### 🔄 Real-time Features Testing

#### Socket.IO Connection
- [ ] Verify WebSocket connection establishes on login
- [ ] Check connection indicator in notification dropdown
- [ ] Test connection recovery after network interruption
- [ ] Verify connection closes on logout

#### Live Notifications
- [ ] Have practitioner confirm a booking
- [ ] Verify patient receives real-time notification
- [ ] Test wellness update notifications
- [ ] Verify booking status change notifications

### 📱 Responsive Design Testing

#### Mobile View (< 768px)
- [ ] Test authentication forms on mobile
- [ ] Verify dashboard responsiveness
- [ ] Check navigation menu collapse
- [ ] Test booking form on mobile
- [ ] Verify notification dropdown mobile layout

#### Tablet View (768px - 1024px)
- [ ] Test dashboard grid layout
- [ ] Verify sidebar behavior
- [ ] Check form layouts adapt correctly

#### Desktop View (> 1024px)
- [ ] Verify full dashboard layout
- [ ] Test multi-column layouts
- [ ] Check advanced charts and analytics

### 🔍 Performance Testing

#### Loading Performance
- [ ] Measure initial page load time
- [ ] Check lazy loading of components
- [ ] Verify proper loading states
- [ ] Test API response caching

#### Memory Usage
- [ ] Monitor memory usage during navigation
- [ ] Check for memory leaks in long sessions
- [ ] Verify proper cleanup on logout

### 🛡️ Security Testing

#### Authentication Security
- [ ] Verify JWT token handling
- [ ] Test token expiration behavior
- [ ] Check protected route access
- [ ] Verify proper logout token cleanup

#### Data Protection
- [ ] Test input validation
- [ ] Verify XSS protection
- [ ] Check CORS policy enforcement
- [ ] Test API rate limiting

### ♿ Accessibility Testing

#### Keyboard Navigation
- [ ] Navigate using only keyboard
- [ ] Verify tab order is logical
- [ ] Test focus indicators
- [ ] Check skip links functionality

#### Screen Reader Support
- [ ] Test with screen reader software
- [ ] Verify proper ARIA labels
- [ ] Check heading structure
- [ ] Test form field associations

#### Visual Accessibility
- [ ] Check color contrast ratios
- [ ] Verify text scaling support
- [ ] Test with high contrast mode
- [ ] Check for color-only information

## Test Data

### Test Accounts
```
Patient Account:
- Email: patient@test.com
- Password: Patient123!

Practitioner Account:
- Email: practitioner@test.com  
- Password: Practitioner123!

Admin Account:
- Email: admin@test.com
- Password: Admin123!
```

### Sample Therapies
- Abhyanga (Full Body Oil Massage)
- Shirodhara (Oil Pouring Therapy)
- Panchakarma Consultation
- Detox Treatment

### Test Booking Data
```json
{
  "therapyId": "therapy-1",
  "practitionerId": "practitioner-1", 
  "preferredDate": "2024-01-15",
  "preferredTime": "10:00",
  "duration": 60,
  "notes": "First time client, please be gentle"
}
```

## Common Issues & Solutions

### Backend Connection Issues
- Ensure backend is running on correct port (5001)
- Check `.env` file has correct API URL
- Verify CORS settings allow frontend domain

### Socket.IO Connection Failures
- Check WebSocket proxy configuration
- Verify Socket.IO client/server version compatibility
- Test with network debugging tools

### Authentication Token Issues
- Clear localStorage if experiencing login loops
- Check token expiration settings
- Verify JWT secret configuration

### Database Persistence Issues
- Check if `db.json` file is writable
- Verify database initialization on server start
- Test data persistence across server restarts

## Automated Testing

### Running Unit Tests
```bash
cd frontend && npm test
```

### Running Integration Tests  
```bash
cd backend && npm test
```

### Running E2E Tests (if implemented)
```bash
npm run test:e2e
```

## Bug Reporting

When reporting bugs, include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Browser/OS information
4. Console error messages
5. Network tab information for API issues

## Performance Benchmarks

Target metrics:
- Initial load time: < 3 seconds
- API response time: < 500ms
- Time to interactive: < 5 seconds
- Largest Contentful Paint: < 2.5 seconds
- First Input Delay: < 100ms

## Testing Sign-off Criteria

All tests must pass before deployment:
- [ ] All authentication flows work correctly
- [ ] All dashboard functionalities work for each user role
- [ ] Real-time notifications work properly
- [ ] Booking system creates and manages bookings correctly
- [ ] Error handling provides good user experience
- [ ] Loading states provide clear feedback
- [ ] Application is responsive on all device sizes
- [ ] Accessibility requirements are met
- [ ] Security measures are functioning
- [ ] Performance meets benchmarks