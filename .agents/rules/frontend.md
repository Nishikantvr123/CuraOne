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
│   ├── ui/               # Primitive shadcn design tokens (button, card, input, dialog...)
│   ├── layout/           # RootLayout, Navbar (user dropdown), ProtectedRoute
│   ├── auth/             # Quick demo login bar, registration forms
│   └── patients/         # TimelineCard, AccessGrantBadge, etc.
├── pages/                # Top-level screen routes (LoginPage, DashboardPage, etc.)
├── context/              # AuthContext.tsx
├── lib/                  # api.ts (Axios + JWT interceptor), utils.ts (cn)
├── types/                # auth.ts, patient.ts
├── router.tsx            # createBrowserRouter configuration
└── App.tsx               # QueryClientProvider -> ThemeProvider -> AuthProvider -> RouterProvider
```

## 3. Visual & Aesthetic Standards
* **Typography**: Inter & Manrope variable fonts via `@fontsource-variable/*`.
* **Colors & Theme**:
  - Managed by `next-themes` with `attribute="class"`, `defaultTheme="system"`.
  - Dark mode triggers via `.dark` class using OKLCH color spaces in `src/index.css`.
* **Icon Rules**:
  - **Monochrome Neutrality**: All content and card icons use `text-foreground` or `text-muted-foreground`.
  - **Brand Accent Rule**: ONLY the CuraOne title and its accompanying brand icon in the Navbar / Auth header use `primary` / `text-primary`.
* **User Profile & Theme**:
  - The Navbar displays a clean user trigger button (initials avatar + name + chevron).
  - Hovering or clicking reveals a dropdown with unclickable profile/jurisdiction details, a nested Theme sub-dropdown (Light ☀️, Dark 🌙, System 💻), and a Sign Out option.
