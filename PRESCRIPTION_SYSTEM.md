# CuraOne Prescription System

## Overview
The CuraOne prescription system allows practitioners to create digital prescriptions for patients with confirmed/completed sessions. Patients can view, download, and print their prescriptions in PDF format.

## Features

### For Practitioners
1. **View Confirmed Sessions**: See all confirmed and completed patient sessions
2. **Create Prescriptions**: Generate prescriptions for patients with accepted sessions
3. **Prescription Management**: View all created prescriptions with search and filter
4. **PDF Generation**: Automatically generate professional PDF prescriptions
5. **Track Prescription Status**: Monitor active, completed, and cancelled prescriptions

### For Patients
1. **View Prescriptions**: Access all prescriptions from their dashboard
2. **Download PDF**: Download prescriptions in PDF format
3. **View PDF**: Open prescriptions in a new tab for viewing
4. **Print**: Print prescriptions directly from the browser
5. **Dashboard Widget**: Quick access to recent prescriptions from the main dashboard

## System Architecture

### Frontend Components

#### 1. PrescriptionPDFGenerator.jsx
Location: `frontend/src/components/prescriptions/PrescriptionPDFGenerator.jsx`

**Functions:**
- `generatePrescriptionPDF(prescription)` - Creates a formatted PDF document
- `downloadPrescriptionPDF(prescription)` - Downloads the PDF to user's device
- `viewPrescriptionPDF(prescription)` - Opens PDF in a new browser tab

**PDF Features:**
- Professional header with CuraOne branding
- Patient and practitioner information
- Diagnosis and treatment duration
- Medications table with dosage, frequency, and instructions
- Special instructions section
- Additional notes
- Status badge
- Footer with generation timestamp

#### 2. PrescriptionManagement.jsx
Location: `frontend/src/components/prescriptions/PrescriptionManagement.jsx`

**Features:**
- Two-tab interface: Confirmed Sessions and All Prescriptions
- Create prescriptions for confirmed/completed bookings
- Search and filter prescriptions
- View and download PDFs
- Track which patients already have prescriptions

#### 3. PrescriptionWidget.jsx
Location: `frontend/src/components/prescriptions/PrescriptionWidget.jsx`

**Features:**
- Shows 3 most recent prescriptions
- Quick view and download buttons
- Status indicators
- Link to full prescriptions page

#### 4. PrescriptionForm.jsx
Location: `frontend/src/pages/practitioner/PrescriptionForm.jsx`

**Features:**
- Patient selection with search
- Diagnosis input
- Multiple medications with:
  - Medicine name
  - Dosage
  - Frequency (dropdown)
  - Additional instructions
- Treatment duration
- Special instructions
- Internal notes
- Form validation

#### 5. Prescriptions.jsx (Patient View)
Location: `frontend/src/pages/patient/Prescriptions.jsx`

**Features:**
- List all patient prescriptions
- Filter by status
- Pagination
- View details modal
- Download PDF
- View PDF
- Print prescription

### Backend Components

#### 1. prescriptionController.js
Location: `backend/controllers/prescriptionController.js`

**Endpoints:**

**POST /api/prescriptions**
- Create new prescription
- Practitioner only
- Validates patient, medications
- Checks inventory stock
- Updates inventory quantities
- Returns created prescription

**GET /api/prescriptions/my**
- Get user's prescriptions
- Patients see their own
- Practitioners see ones they created
- Supports pagination and status filtering

**GET /api/prescriptions/:id**
- Get specific prescription by ID
- Authorization check
- Returns full prescription details

**PUT /api/prescriptions/:id**
- Update prescription
- Practitioner only
- Can update status, notes, instructions

#### 2. prescriptions.js (Routes)
Location: `backend/routes/prescriptions.js`

**Routes:**
- `POST /api/prescriptions` - Create prescription (practitioner)
- `GET /api/prescriptions/my` - Get user's prescriptions
- `GET /api/prescriptions/:id` - Get specific prescription
- `PUT /api/prescriptions/:id` - Update prescription (practitioner)

### Database Schema

**Prescription Object:**
```javascript
{
  id: String (UUID),
  patientId: String,
  patientName: String,
  patientEmail: String,
  practitionerId: String,
  practitionerName: String,
  diagnosis: String,
  medications: [
    {
      name: String,
      dosage: String,
      frequency: String,
      duration: String (optional),
      instructions: String (optional),
      inventoryId: String (optional)
    }
  ],
  instructions: String,
  duration: String (default: "30 days"),
  notes: String,
  status: String (active|completed|cancelled),
  createdAt: ISO Date String,
  updatedAt: ISO Date String
}
```

## User Workflows

### Practitioner Workflow

1. **Navigate to Prescriptions Tab**
   - Click "Prescriptions" in the practitioner dashboard

2. **View Confirmed Sessions**
   - See list of confirmed/completed patient sessions
   - Check if prescription already exists for each session

3. **Create Prescription**
   - Click "Create Prescription" button for a patient
   - Patient information auto-populated
   - Enter diagnosis
   - Add medications (name, dosage, frequency, instructions)
   - Set treatment duration
   - Add special instructions
   - Add internal notes
   - Submit form

4. **Manage Prescriptions**
   - Switch to "All Prescriptions" tab
   - Search by patient name or diagnosis
   - Filter by status (active, completed, cancelled)
   - View PDF or download for any prescription

### Patient Workflow

1. **View from Dashboard**
   - See recent prescriptions in the widget
   - Click "View All" to see complete list

2. **Access Prescriptions Page**
   - Navigate to Prescriptions from menu
   - See all prescriptions with status badges

3. **View Prescription Details**
   - Click "View Details" to see full information
   - See diagnosis, medications, instructions, notes

4. **Download/Print**
   - Click "Download PDF" to save to device
   - Click "View PDF" to open in new tab
   - Click "Print" for browser print dialog

## Installation & Setup

### Dependencies
```bash
cd frontend
npm install jspdf jspdf-autotable
```

### Files Created/Modified

**New Files:**
- `frontend/src/components/prescriptions/PrescriptionPDFGenerator.jsx`
- `frontend/src/components/prescriptions/PrescriptionManagement.jsx`
- `frontend/src/components/prescriptions/PrescriptionWidget.jsx`

**Modified Files:**
- `frontend/src/pages/practitioner/PractitionerDashboard.jsx`
- `frontend/src/pages/patient/Prescriptions.jsx`
- `frontend/src/pages/patient/Dashboard.jsx`

**Backend Files (Already Existing):**
- `backend/controllers/prescriptionController.js`
- `backend/routes/prescriptions.js`

## API Endpoints

### Create Prescription
```
POST /api/prescriptions
Authorization: Bearer <token> (Practitioner)

Body:
{
  "patientId": "uuid",
  "diagnosis": "string",
  "medications": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "instructions": "string (optional)"
    }
  ],
  "duration": "string",
  "instructions": "string (optional)",
  "notes": "string (optional)"
}

Response:
{
  "success": true,
  "message": "Prescription created successfully",
  "data": { prescription object }
}
```

### Get My Prescriptions
```
GET /api/prescriptions/my?status=active&page=1&limit=10
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "prescriptions": [ prescription objects ],
    "pagination": {
      "total": number,
      "page": number,
      "limit": number,
      "pages": number
    }
  }
}
```

### Get Prescription by ID
```
GET /api/prescriptions/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": { prescription object }
}
```

### Update Prescription
```
PUT /api/prescriptions/:id
Authorization: Bearer <token> (Practitioner)

Body:
{
  "status": "completed",
  "notes": "string",
  "instructions": "string"
}

Response:
{
  "success": true,
  "message": "Prescription updated successfully",
  "data": { prescription object }
}
```

## PDF Format

The generated PDF includes:

1. **Header Section**
   - CuraOne logo and branding
   - "E-Prescription" title
   - Prescription ID and date

2. **Information Section**
   - Patient information (name, email)
   - Practitioner information (name, license)

3. **Diagnosis Section**
   - Primary diagnosis
   - Treatment duration

4. **Medications Table**
   - Medicine name
   - Dosage
   - Frequency
   - Instructions

5. **Special Instructions**
   - Highlighted section for important patient instructions

6. **Notes Section**
   - Additional internal notes

7. **Footer**
   - Generation timestamp
   - Disclaimer text
   - Status badge

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: 
   - Only practitioners can create prescriptions
   - Patients can only view their own prescriptions
   - Practitioners can only view prescriptions they created
3. **Data Validation**: All inputs validated before processing
4. **Inventory Management**: Stock levels checked before prescription creation

## Future Enhancements

1. **E-Signature**: Digital signature for practitioners
2. **QR Code**: Add QR code for verification
3. **Email Delivery**: Automatically email prescriptions to patients
4. **Refill Requests**: Allow patients to request prescription refills
5. **Prescription History**: Track prescription modifications
6. **Drug Interactions**: Check for potential drug interactions
7. **Dosage Calculator**: Calculate dosages based on patient weight/age
8. **Multi-language Support**: Generate PDFs in different languages
9. **Prescription Templates**: Save and reuse common prescription patterns
10. **Analytics**: Track prescription patterns and medication usage

## Troubleshooting

### PDF Not Generating
- Check browser console for errors
- Ensure jsPDF libraries are installed
- Verify prescription data is complete

### Prescription Not Showing
- Check user authentication
- Verify API endpoint is accessible
- Check network tab for API errors

### Download Not Working
- Check browser download settings
- Verify popup blocker settings
- Try different browser

## Support

For issues or questions:
1. Check console logs for errors
2. Verify API responses in network tab
3. Ensure all dependencies are installed
4. Check user permissions and roles
