# Frontend Architecture & Design Rules

## 1. Core Technology Stack
* **Runtime & Bundler**: Vite 8 + React 19 + TypeScript.
* **Component Framework**: shadcn/ui (`radix-nova` preset, Radix UI headless primitives via unified `radix-ui` package, `@tailwindcss/vite` v4).
* **State Separation**:
  - **Client & Session State**: React `AuthContext` + `localStorage` (`curaone_token`).
  - **Server State & Caching**: `@tanstack/react-query` (`QueryClientProvider`).
* **Routing**: `react-router-dom` using **object-based `createBrowserRouter` configuration** (avoid JSX `<Routes>` component trees).

## 2. Directory Layout Convention
Strictly adhere to the standard React SPA structure:
```text
frontend/src/
├── components/
│   ├── ui/               # Primitive shadcn design tokens (button, card, input, dialog, textarea...)
│   ├── layout/           # RootLayout, Navbar (brand left, signout right), DoctorSidebar, HospitalSidebar, ProtectedRoute
│   ├── auth/             # Quick demo role switchers, patient registration forms
│   ├── patients/         # PatientSearchDirectory, PatientTimelineView, EncounterDetailModal, RecordEncounterModal
│   ├── grants/           # DoctorGrantsView, RequestGrantModal
│   ├── hospital/         # HospitalDoctorsView, ProvisionDoctorModal, HospitalOutboundGrantsView, HospitalInboundGrantsView, HospitalFacilityInfoView
│   └── theme-provider.tsx# next-themes wrapper
├── pages/                # Top-level screen routes (LoginPage, DashboardPage)
├── context/              # AuthContext.tsx (user session & token management)
├── lib/                  # api.ts (Axios + JWT interceptor), utils.ts (cn)
├── types/                # auth.ts, patient.ts
├── router.tsx            # createBrowserRouter object configuration
├── App.tsx               # QueryClientProvider -> ThemeProvider -> AuthProvider -> RouterProvider
└── vite.config.ts        # Vite 8 config with /api proxy to http://localhost:5000
```

## 3. Visual & Aesthetic Standards
* **Typography**: Inter & Manrope variable fonts via `@fontsource-variable/*`.
* **Colors & Theme**:
  - Managed by `next-themes` with `attribute="class"`, `defaultTheme="system"`.
  - Dark mode triggers via `.dark` class using OKLCH color spaces in `src/index.css`.
* **Icon Rules**:
  - **Monochrome Neutrality**: All content and card icons strictly use `text-foreground` or `text-muted-foreground`.
  - **Brand Accent Rule**: ONLY the CuraOne title and its accompanying brand icon in the Navbar / Auth header use `primary` / `text-primary`.
* **Navigation & Workstation Rules**:
  - **Navbar**: Strictly minimal. Left side contains CuraOne logo, title, and `EHR-RAG` badge. Right side contains a direct `[ Sign Out ]` button. No redundant user names, breadcrumbs, or facility names in the navbar.
  - **Doctor Sidebar**: Fixed left sidebar for clinical jurisdiction. Top card shows the doctor's facility jurisdiction (Hospital name, city/state, attending doctor name, specialty). Middle section contains workspace navigation (`Patients Directory`, `New Clinical Visit`, `Access Grants`, `AI Copilot [RAG]`). Bottom section hosts the `Accessibility & Theme` dropdown (`Light ☀️`, `Dark 🌙`, `System 💻`).
  - **Timeline Scannability**: Timeline cards display summary-level metadata and tags. Full encounter notes, diagnoses, and medication prescriptions open cleanly in a focused `EncounterDetailModal` on click.
