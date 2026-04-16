# Prescription System Workflow Guide

## Visual Workflow Diagrams

### Practitioner Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRACTITIONER DASHBOARD                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Click "Prescriptions" Tab
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              PRESCRIPTION MANAGEMENT INTERFACE                   │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │  Confirmed Sessions  │  │  All Prescriptions   │           │
│  │      (Active)        │  │                      │           │
│  └──────────────────────┘  └──────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
              View Confirmed/Completed Sessions
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CONFIRMED SESSIONS LIST                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Patient: John Doe                                      │    │
│  │ Therapy: Abhyanga Massage                              │    │
│  │ Date: 2024-03-20 | Time: 10:00 AM                     │    │
│  │ Status: Confirmed                                      │    │
│  │                                                        │    │
│  │              [Create Prescription] ←─────────────────┐ │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Click "Create Prescription"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PRESCRIPTION FORM                             │
│                                                                  │
│  Patient: John Doe (auto-filled)                               │
│  Email: john@example.com                                        │
│                                                                  │
│  Diagnosis: ___________________________________________         │
│  Duration: [30 days ▼]                                         │
│                                                                  │
│  ┌─── MEDICATIONS ────────────────────────────────────┐        │
│  │ Medicine 1:                                         │        │
│  │   Name: ________________                            │        │
│  │   Dosage: ______________                            │        │
│  │   Frequency: [Twice daily ▼]                       │        │
│  │   Instructions: _______________________________     │        │
│  │                                                     │        │
│  │   [+ Add Medication]                                │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  Special Instructions: _________________________________        │
│  Notes (Internal): _____________________________________        │
│                                                                  │
│              [Cancel]  [Create Prescription]                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Submit Prescription
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  ✓ Prescription Created Successfully!            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Return to Prescription List
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ALL PRESCRIPTIONS VIEW                        │
│                                                                  │
│  Search: [_________________]  Filter: [All Status ▼]           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Diagnosis: Vata Imbalance                              │    │
│  │ Patient: John Doe | Date: 2024-03-20                  │    │
│  │ Duration: 30 days | Medications: 3                     │    │
│  │ Status: [Active]                                       │    │
│  │                                                        │    │
│  │              [👁 View] [📄 PDF] [⬇ Download]          │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Patient Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                      PATIENT DASHBOARD                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │          MY PRESCRIPTIONS WIDGET                     │        │
│  │                                                      │        │
│  │  ┌──────────────────────────────────────────────┐  │        │
│  │  │ Vata Imbalance                    [Active]   │  │        │
│  │  │ Date: 2024-03-20 | 3 medications             │  │        │
│  │  │                                               │  │        │
│  │  │        [👁 View]  [⬇ Download]               │  │        │
│  │  └──────────────────────────────────────────────┘  │        │
│  │                                                      │        │
│  │                          [View All →]                │        │
│  └─────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Click "View All" or Navigate to Prescriptions
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MY PRESCRIPTIONS PAGE                         │
│                                                                  │
│  Filter: [All Prescriptions ▼]                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Diagnosis: Vata Imbalance                              │    │
│  │ Practitioner: Dr. Sarah Smith                          │    │
│  │ Date: 2024-03-20 | Duration: 30 days                  │    │
│  │ Medications: 3 | Status: [Active]                      │    │
│  │                                                        │    │
│  │    [👁 Details] [📄 View PDF] [⬇ Download] [🖨 Print] │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Click "View Details"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  PRESCRIPTION DETAIL MODAL                       │
│                                                                  │
│  Diagnosis: Vata Imbalance                                      │
│  Duration: 30 days                                              │
│  Practitioner: Dr. Sarah Smith                                  │
│  Date: March 20, 2024                                           │
│                                                                  │
│  ┌─── MEDICATIONS ────────────────────────────────────┐        │
│  │ 1. Ashwagandha                                      │        │
│  │    Dosage: 500mg | Frequency: Twice daily          │        │
│  │    Instructions: Take with warm milk               │        │
│  │                                                     │        │
│  │ 2. Triphala                                         │        │
│  │    Dosage: 1 tablet | Frequency: Before bed        │        │
│  │    Instructions: Take with warm water              │        │
│  │                                                     │        │
│  │ 3. Brahmi Oil                                       │        │
│  │    Dosage: 5ml | Frequency: Daily                  │        │
│  │    Instructions: Apply to scalp before sleep       │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ⚠ Special Instructions:                                        │
│  Follow a Vata-pacifying diet. Avoid cold foods.               │
│                                                                  │
│              [Close]  [⬇ Download PDF]  [🖨 Print]              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Click "Download PDF"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PDF GENERATED & DOWNLOADED                    │
│                                                                  │
│  File: Prescription_John_Doe_2024-03-20.pdf                    │
│  Location: Downloads folder                                     │
└─────────────────────────────────────────────────────────────────┘
```

### PDF Document Structure

```
╔═══════════════════════════════════════════════════════════════╗
║                         CURAONE                                ║
║                 Ayurvedic Therapy Center                       ║
║                      E-Prescription                            ║
╠═══════════════════════════════════════════════════════════════╣
║                                                                ║
║  Prescription ID: abc-123-def          Date: March 20, 2024   ║
║                                                                ║
║  ┌──────────────────────┐  ┌──────────────────────┐          ║
║  │ Patient Information  │  │ Practitioner Info    │          ║
║  │                      │  │                      │          ║
║  │ Name: John Doe       │  │ Name: Dr. Sarah Smith│          ║
║  │ Email: john@mail.com │  │ License: Certified   │          ║
║  └──────────────────────┘  └──────────────────────┘          ║
║                                                                ║
║  ┌────────────────────────────────────────────────┐          ║
║  │ Diagnosis: Vata Imbalance                      │          ║
║  └────────────────────────────────────────────────┘          ║
║                                                                ║
║  Treatment Duration: 30 days                                  ║
║                                                                ║
║  ┌─── PRESCRIBED MEDICATIONS ─────────────────────┐          ║
║  │                                                  │          ║
║  │ # | Medicine    | Dosage | Frequency | Instr.  │          ║
║  │───┼─────────────┼────────┼───────────┼─────────│          ║
║  │ 1 │ Ashwagandha │ 500mg  │ Twice/day │ W/milk  │          ║
║  │ 2 │ Triphala    │ 1 tab  │ Before bed│ W/water │          ║
║  │ 3 │ Brahmi Oil  │ 5ml    │ Daily     │ Scalp   │          ║
║  └──────────────────────────────────────────────────┘          ║
║                                                                ║
║  ⚠ SPECIAL INSTRUCTIONS                                       ║
║  Follow a Vata-pacifying diet. Avoid cold foods and          ║
║  beverages. Maintain regular sleep schedule.                  ║
║                                                                ║
║  📝 Notes: Patient responding well to treatment               ║
║                                                                ║
║  ─────────────────────────────────────────────────────────    ║
║  This is a computer-generated prescription from CuraOne.      ║
║  For any queries, please contact your practitioner.           ║
║  Generated on: March 20, 2024 10:30 AM                       ║
╚═══════════════════════════════════════════════════════════════╝
```

## Step-by-Step User Actions

### For Practitioners

1. **Login** → Navigate to Dashboard
2. **Click** "Prescriptions" tab in navigation
3. **View** "Confirmed Sessions" tab (default)
4. **Identify** patient who needs prescription
5. **Click** "Create Prescription" button
6. **Fill** prescription form:
   - Diagnosis (required)
   - Add medications (name, dosage, frequency)
   - Set treatment duration
   - Add special instructions
   - Add internal notes
7. **Click** "Create Prescription" button
8. **See** success message
9. **Switch** to "All Prescriptions" tab
10. **Search/Filter** prescriptions as needed
11. **Click** "View PDF" to preview
12. **Click** "Download" to save PDF

### For Patients

1. **Login** → View Dashboard
2. **See** prescription widget with recent prescriptions
3. **Click** "View" to see details OR
4. **Click** "Download" to get PDF OR
5. **Click** "View All" to see complete list
6. **On Prescriptions Page**:
   - View all prescriptions
   - Filter by status
   - Click "View Details" for full information
   - Click "View PDF" to open in browser
   - Click "Download PDF" to save
   - Click "Print" for hard copy

## System Integration Points

```
┌─────────────────┐
│   Booking       │
│   System        │
└────────┬────────┘
         │
         │ Confirmed/Completed
         │ Sessions
         ↓
┌─────────────────┐
│  Prescription   │
│  Management     │
└────────┬────────┘
         │
         │ Create
         │ Prescription
         ↓
┌─────────────────┐      ┌─────────────────┐
│  Prescription   │─────→│   Inventory     │
│  Controller     │      │   System        │
└────────┬────────┘      └─────────────────┘
         │                Check & Update Stock
         │
         │ Store
         ↓
┌─────────────────┐
│   Database      │
│  (Prescriptions)│
└────────┬────────┘
         │
         │ Retrieve
         ↓
┌─────────────────┐      ┌─────────────────┐
│   Patient       │─────→│   PDF           │
│   Dashboard     │      │   Generator     │
└─────────────────┘      └─────────────────┘
                         Client-side PDF
```

## Key User Interface Elements

### Practitioner Interface
- **Tab Navigation**: Switch between Confirmed Sessions and All Prescriptions
- **Session Cards**: Display patient info, therapy, date/time, status
- **Create Button**: Prominent green button for prescription creation
- **Search Bar**: Real-time search by patient name or diagnosis
- **Status Filter**: Dropdown to filter by prescription status
- **Action Buttons**: View, Download PDF icons for each prescription

### Patient Interface
- **Dashboard Widget**: Shows 3 most recent prescriptions
- **Quick Actions**: View and Download buttons on each prescription
- **Prescriptions Page**: Full list with filtering
- **Detail Modal**: Comprehensive view of prescription information
- **Multiple Export Options**: View PDF, Download PDF, Print

### PDF Document
- **Professional Header**: Branded with CuraOne colors
- **Information Boxes**: Clear sections for patient and practitioner
- **Medications Table**: Structured, easy-to-read format
- **Highlighted Sections**: Special instructions in amber, diagnosis in green
- **Status Badge**: Visual indicator of prescription status
- **Footer**: Disclaimer and generation timestamp

## Error Handling

### Practitioner Errors
- **No Patient Selected**: "Please select a patient"
- **Missing Diagnosis**: "Diagnosis is required"
- **No Medications**: "At least one medication is required"
- **Incomplete Medication**: "Each medication must have name, dosage, and frequency"
- **Insufficient Stock**: "Insufficient stock for [medicine name]"

### Patient Errors
- **No Prescriptions**: Friendly empty state with explanation
- **PDF Generation Failed**: Error message with retry option
- **Network Error**: "Unable to load prescriptions. Please try again."

## Success Indicators

### Practitioner
- ✓ Green success banner: "Prescription created successfully!"
- ✓ Prescription appears in "All Prescriptions" list
- ✓ "Prescribed" badge appears on patient's session card
- ✓ PDF downloads successfully

### Patient
- ✓ Prescription appears in dashboard widget
- ✓ Prescription appears in full list
- ✓ PDF opens in new tab
- ✓ PDF downloads to device
- ✓ Print dialog opens successfully

## Mobile Responsiveness

All interfaces are responsive and work on:
- Desktop (1920px+)
- Laptop (1366px - 1920px)
- Tablet (768px - 1366px)
- Mobile (320px - 768px)

PDF generation works on all devices, though viewing experience is optimized for larger screens.
