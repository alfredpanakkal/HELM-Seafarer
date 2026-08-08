# Version History & Changelog

## App: Seafarer NRI Seatime & Tax Calculator

This document tracks the evolution, major versions, and build history of the application.

### [1.5.0] - Current Build (Latest)
**Features & Integrations:**
- **Live Exchange Rates:** Integrated the public Frankfurter API in the `App.tsx` root to automatically fetch the daily USD to INR exchange rate on load.
- **Historical Exchange Rates:** Added automatic fetching of historical USD/INR rates in `VoyageModal.tsx`. When a user selects a departure date, the app fetches the precise exchange rate for that historical date to ensure accurate tax estimation.
- **Code Optimization:** Refactored `TaxCalculator.tsx` to use shared variables for repetitive Tailwind CSS class strings, reducing bundle size and improving maintainability.
- **Build System:** Verified production build sizes and chunking configurations.

### [1.4.0] - UI Refinements & Admin Tools
**Features:**
- **Administration Tab:** Added a restricted Admin panel in the `About` page (locked to the developer's email) for system diagnostics, local storage inspection, and tax rule override toggles.
- **Accessibility:** Added Font Scaling (Text Size) controls and a Dark/Light Theme toggle to the Info & Settings tab.
- **Design:** Removed generic layout borders and optimized spacing for a cleaner, more premium visual hierarchy. 

### [1.3.0] - Cloud Sync & Firebase Integration
**Features:**
- **Google OAuth:** Integrated Google Workspace OAuth for secure user authentication.
- **Firebase Firestore:** Migrated from a strictly local-storage architecture to a hybrid model. Users can now securely sync their voyage data and profile to the cloud (Firestore database).
- **Data Portability:** Added options to export local JSON backups directly from the UI.
- **Guest Mode:** Ensured the app remains 100% functional offline and without an account (localStorage fallback).

### [1.2.0] - Advanced Tax Calculator
**Features:**
- **Tax Engine:** Built a comprehensive manual and automatic tax calculator specifically tailored for Indian seafarers.
- **Regime Support:** Supports both the Old Tax Regime (with 80C/80D deductions) and the New Tax Regime.
- **Budget Updates:** Included slabs and rebate limits up to the latest Budget 2025 guidelines.
- **NRI Rules:** Built-in logic for Section 10(6)(viii) exemptions for Non-Resident Indian seafarers (Zero Tax on foreign ship salary).

### [1.1.0] - Analytics & Charting
**Features:**
- **Seatime Analytics:** Implemented Chart.js for visualizing days outside India across different financial years.
- **Progress Tracking:** Added dashboard widgets to track progress against the 182-day NRI threshold.

### [1.0.0] - Initial Release
**Features:**
- **Voyage Logging:** Core functionality to add, edit, and delete sign-on/sign-off dates.
- **Financial Year Mapping:** Algorithmic calculation of days spent outside India, split accurately across Indian Financial Years (April 1 to March 31).
- **Port Types:** Support for Indian vs. Foreign port sign-on rules (Passport stamping vs CDC).
