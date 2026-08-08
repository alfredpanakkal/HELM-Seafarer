# Seafarer NRI Seatime & Tax Calculator - Development Documentation

## Overview
This application is a comprehensive tool designed for Indian Seafarers to track their sea time, monitor their Non-Resident Indian (NRI) status for tax purposes, and calculate potential tax liabilities if the NRI status is not met. It is built as a React single-page application using TypeScript, Vite, and Tailwind CSS.

## Architecture & Tech Stack
- **Framework**: React 18+ with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Utility-first CSS)
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, useMemo)
- **Local Persistence**: Browser `localStorage` (via custom wrapper in `src/lib/db.ts`)
- **Cloud Persistence**: Firebase (Firestore for data storage, Authentication for user accounts)
- **Routing**: Custom lightweight state-based routing (`currentPage` state in `App.tsx`)

## Core Features & Capabilities

1. **Dashboard (`Dashboard.tsx`)**
   - High-level overview of the seafarer's status.
   - Quick stats: Current FY NRI progress, Career Seatime, Deadline countdown.
   - Visual progress ring/bar for the 184-day (or 282-day) NRI threshold.
   - Recent voyages list and a mini bar chart summarizing seatime across financial years.

2. **Sailing Log (`SailingLog.tsx`)**
   - CRUD operations for voyages (Sign-on / Sign-off dates, Vessel name, Port, Rank).
   - Validation to prevent overlapping voyage dates.
   - Computes total days outside India per voyage.

3. **NRI Status Checker (`NriStatus.tsx`)**
   - Detailed breakdown of a specific Financial Year (April 1st to March 31st).
   - Visual ring chart showing days completed vs. threshold.
   - Indicates whether the user has achieved NRI status, and if not, the remaining days required.
   - Shows the exact sailing periods falling within the selected financial year.

4. **Financial Year (FY) Overview (`FyOverview.tsx`)**
   - Aggregated view of all financial years.
   - Summarizes total sea days, number of voyages, and NRI status for each FY.
   - Allows users to expand and view the specific voyages that contributed to that FY.

5. **Seatime Analytics (`SeatimeAnalytics.tsx`)**
   - Visual analytics and charts detailing career progression.
   - Seatime trends over multiple years using bar charts.
   - Rank-wise seatime breakdown using pie/donut charts.
   - Vessel-wise seatime distribution.

6. **Tax Calculator (`TaxCalculator.tsx`)**
   - Estimates income tax for Resident Indians (if NRI status is missed).
   - Allows input of expected annual income, deductions (80C, 80D, etc.).
   - Computes tax under both Old Regime and New Regime, helping users choose the better option.
   - Takes into account standard deductions and cess.

7. **Multi-Profile System**
   - Users can create and manage multiple seafarer profiles within the same app.
   - Easily switch between profiles from the sidebar.
   - Each profile has its own isolated set of voyages and settings.

8. **Cloud Sync & Local Backup (`CloudAuthModal.tsx`, `ImportModal.tsx`, `lib/sync.ts`)**
   - **Guest Mode**: Works completely offline using `localStorage`.
   - **Cloud Mode**: Syncs data to Firebase Firestore under the authenticated user's account.
   - Import/Export functionality to backup data as a JSON file or restore it to a new device.

9. **Responsive Design & Theming**
   - Fully responsive layout: Sidebar navigation on Desktop/Tablet, Bottom navigation bar on Mobile.
   - Dark/Light mode support with a custom color palette (Slate, Red, Emerald, Amber).

## Key Components & File Structure

- `src/App.tsx`: The main container component. Manages global state (theme, active profile, current page), renders the sidebar/bottom nav, and hosts the active view component.
- `src/components/`: Contains all the distinct views and modals.
  - Modals: `VoyageModal.tsx` (Add/Edit voyage form), `ProfileModal.tsx` (Manage profiles), `CloudAuthModal.tsx` (Firebase login/sync), `ImportModal.tsx` (JSON import).
- `src/lib/`: Core logic and utilities.
  - `utils.ts`: Date math, financial year calculations, NRI logic.
  - `db.ts`: Local storage abstraction layer.
  - `firebase.ts`: Firebase initialization and auth/firestore wrappers.
  - `sync.ts`: Logic to merge and sync local data with cloud data.
- `src/types.ts`: TypeScript interfaces (`Voyage`, `SeafarerProfile`, `FyRecord`).

## Recent Development Changes & UI Adjustments

- **Responsive Enhancements**: 
  - Adjusted `max-w-6xl` and `max-w-4xl` containers across all main components (`Dashboard`, `SailingLog`, `NriStatus`, `FyOverview`, `SeatimeAnalytics`, `TaxCalculator`, `About`) to `max-w-7xl` with improved padding (`lg:p-8`) for better utilization of screen real estate on desktop/PC, preventing the UI from feeling cramped.
  - Improved the Sidebar layout in `App.tsx` to handle Tablet (`md:w-20` icon-only view) and Desktop (`lg:w-64` full view) states gracefully.
- **Dashboard Tweaks**: 
  - Refined the "Bento Grid" layout for stats cards to span appropriately on tablet and desktop.
  - Removed the bottom footer (Developer & GitHub links) from the Dashboard to keep it clean, centralizing these links in the `About.tsx` tab.
- **Component Styling**: 
  - Upgraded cards with deeper shadows, `backdrop-blur-md`, and hover scale/color transition effects.
  - Replaced native alerts/prompts with custom elegant modals.

## AI Instructions & Guidelines for Future Edits
1. **Routing**: Do not introduce `react-router-dom`. The app uses a simple state-based routing mechanism (`currentPage` in `App.tsx`). Maintain this pattern.
2. **Icons**: Exclusively use `lucide-react` for all iconography.
3. **Styling**: Stick to Tailwind CSS. Respect the existing dark mode patterns (`theme === 'dark' ? ... : ...`).
4. **Data Handling**: Any new data entities should be defined in `src/types.ts` and managed via the abstraction layers in `src/lib/db.ts` and `src/lib/sync.ts`.
5. **Responsiveness**: Always consider Mobile (default), Tablet (`md:`), and Desktop (`lg:`) views.
6. **Date Math**: Be extremely careful with timezones and date boundaries when modifying voyage calculations. Use UTC or normalize dates to midnight local time to prevent off-by-one day errors.
