# Product Requirements Document (PRD)
## Seafarer NRI Seatime & Tax Calculator

This document outlines the core product requirements, user personas, testable functional requirements, and non-functional specifications for the application.

---

## 1. User Personas

These personas are grounded in the operational reality of maritime professionals and define the core features of the application.

### Persona 1: Rahul, The Anxious Junior Officer (3rd Officer)
*   **Context:** Early in his career (2 years sailing), dealing with uncertain contract lengths and last-minute sign-on/sign-off changes.
*   **Goal:** To absolutely guarantee he crosses the 184-day threshold to claim NRI status so his foreign income remains tax-exempt.
*   **Biggest Frustration:** Using a messy, hand-me-down Excel sheet that doesn't correctly account for the nuanced rules of Indian (CDC) vs. Foreign (Passport) ports, leaving him constantly paranoid he miscalculated by a single day.

### Persona 2: Captain Vikram, The Veteran Master Mariner
*   **Context:** 15 years of experience, sitting in a high-income bracket. He often takes shorter, back-to-back contracts which makes tracking cumulative days across a financial year difficult.
*   **Goal:** Financial forecasting and tax optimization. If he realizes he will miss NRI status for a financial year, he needs to immediately estimate his tax liability under the Old vs. New regime to plan his 80C/80D investments.
*   **Biggest Frustration:** Current apps only function as "day counters." They lack integrated income tax calculators and historical USD/INR exchange rate conversions, forcing him to hire an expensive Chartered Accountant just to get a mid-year estimate.

---

## 2. Functional Requirements (Pass/Fail Test Cases)

The following functional requirements have been translated into clear, testable acceptance criteria.

1.  **Sailing Day Calculation**
    *   **PASS/FAIL:** Given a valid sign-on and sign-off date, the system correctly calculates and displays the total number of sailing days inclusive of both dates, accounting for port types (Indian vs. Foreign).
2.  **Financial Year Split Logic**
    *   **PASS/FAIL:** Given a voyage that spans across March 31st to April 1st, the system correctly splits the days and allocates the exact number of eligible days to their respective Indian Financial Years (April 1 - March 31).
3.  **Financial Year Overview**
    *   **PASS/FAIL:** The user can navigate to an "FY Overview" screen that displays an aggregated sum of sea days, total voyages, and current NRI status (Achieved/Pending) grouped accurately by Financial Year.
4.  **Career Seatime (Exam Eligibility)**
    *   **PASS/FAIL:** The system continuously calculates and displays a "Career Seatime" metric (cumulative days across all logged voyages), independent of financial year splits, to assist users in tracking eligibility for maritime exams.
5.  **Integrated Tax Calculation & Estimation**
    *   **PASS/FAIL:** If the projected days are less than the NRI threshold (typically 184 days), the system unlocks a Tax Calculator that accepts estimated income/deductions and outputs the expected tax liability under *both* the Old and New Indian tax regimes.
6.  **Exchange Rate Integration**
    *   **PASS/FAIL:** When entering a historic voyage with a USD salary, the system correctly fetches and applies the historical USD/INR exchange rate for that specific departure date to provide an accurate INR tax estimation.
7.  **Multi-Profile Management**
    *   **PASS/FAIL:** The user can create, rename, switch between, and delete multiple seafarer profiles. Data (voyages, settings) must be strictly isolated per profile and not leak across contexts.
8.  **Cloud Sync & Offline Mode**
    *   **PASS/FAIL:** The app functions 100% offline using local storage. When a user authenticates via Google OAuth, local data correctly merges and syncs to Firestore without duplicating voyages, and retrieves data successfully on a new device.
9.  **Data Export & Import**
    *   **PASS/FAIL:** The user can export a complete JSON backup of their active profile and successfully import it into a fresh browser session, fully restoring their voyage log and settings without data corruption.
10. **Seatime Analytics & Visualizations**
    *   **PASS/FAIL:** The system renders accurate charts (e.g., Bar charts for yearly progression, Pie charts for rank/vessel distribution) that dynamically and instantly update when the underlying voyage data is modified or deleted.

---

## 3. Non-Functional Requirements (NFRs)

These requirements ensure the application is robust, secure, accessible, and performant in real-world maritime conditions.

### A. Performance Targets
*   **Offline-First Reliability:** The app must be 100% functional offline. Core logic (calculations, voyage logging) must execute in `< 100ms` using local storage. Cloud sync should queue gracefully when the device is entirely offline or on satellite Wi-Fi.
*   **Load Time (TTI):** Time to Interactive must be under 2.5 seconds on a standard 3G connection, optimizing for seafarers accessing the app in ports with poor cellular reception.

### B. Security Requirements
*   **Data Privacy & Isolation:** Financial data (salary inputs, tax estimates) must default to local-only storage. If cloud sync is enabled, it must be secured behind strict Firestore Security Rules tied to verified Google OAuth IDs.
*   **No PII Leakage:** The application must not transmit salary or tax calculations to unauthorized third-party analytics trackers.

### C. Accessibility Standards
*   **WCAG 2.1 AA Compliance:** Color palettes (especially Red/Green status indicators) must pass contrast ratio tests (minimum 4.5:1 for normal text) to accommodate visually impaired or color-blind users.
*   **Mobile-First Touch Targets:** All interactive elements (buttons, date pickers) must have a minimum touch target area of `44x44px` to ensure usability on mobile devices, especially when operating a device on a moving vessel.

### D. Regulatory & Compliance
*   **Tax Law Accuracy:** The tax engine logic must accurately reflect the latest rules outlined by the Indian Income Tax Department (including Budget 2024/2025 updates and Section 10(6)(viii) exemptions).
*   **Right to Export/Delete:** The system must provide a single-click mechanism for users to export all their data (JSON) and permanently delete their cloud data footprint to comply with data privacy principles.

### E. Availability & Resilience
*   **Third-Party Fallbacks:** The system must degrade gracefully if external services (like the Frankfurter API for exchange rates) fail or timeout. It should allow manual override of rates rather than blocking the user.

### F. Compatibility & Formatting
*   **Cross-Browser Support:** The application must be fully functional on modern mobile browsers (iOS Safari 15+, Chrome for Android) and desktop environments, reflecting the diverse devices used onboard ships.
*   **Localization (India):** Number formatting must strictly follow the Indian numbering system (Lakhs/Crores) rather than Western millions. Dates should natively support or display in the standard DD/MM/YYYY format preferred in India.

### G. Data Retention & Disaster Recovery
*   **Local Backups:** The app must prompt users to download a local JSON backup at least once every 6 months to prevent data loss in the event of browser cache clearing.
*   **Cloud Inactivity:** Inactive cloud accounts (no sync for > 3 years) should be subject to data purging to minimize security footprint, with an automated email warning 30 days prior.

---

## 4. Out of Scope (Explicit Exclusions)

To maintain product focus and manage development scope, the following adjacent features are explicitly **out of scope** for this application:

*   **Direct Tax Filing (E-Filing):** The application provides tax *estimations* for planning purposes only. It will not integrate with the Indian Income Tax e-filing portal to submit actual tax returns.
*   **Binding Financial or Legal Advice:** The app is a self-help calculation utility. It does not replace the professional services of a Chartered Accountant (CA). No generated reports can be used as certified legal tax documents.
*   **Document Storage / Digital Vault:** While users log voyage dates, the app will not serve as a cloud storage vault for uploading/storing sensitive PDF documents (e.g., scans of Passports, CDCs, or employment contracts).
*   **Corporate Payroll Integrations:** The app will not integrate with third-party maritime crewing software or shipping company payroll APIs to automatically fetch payslips. All data entry remains manual or via JSON import.
*   **Global Visa/Immigration Tracking:** The day-counting logic is strictly optimized for Indian Income Tax (NRI rules). It will not track or calculate days for global visa compliance (e.g., the Schengen 90/180-day rule or US B1/B2 limits).
*   **General Expense Tracking:** The app will track gross monthly salary to estimate tax, but it will not include daily expense tracking, budgeting, or investment portfolio management features.
