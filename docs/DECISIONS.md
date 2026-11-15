# Gharkhata - Architecture & Design Decisions (docs/DECISIONS.md)

## Decision Log

### 1. Single-Click Launcher Fix (`run.bat`)
- Fixed Windows batch parser syntax issues:
  - Eliminated nested parenthesized blocks `( ... )` that clashed with characters like `(घरखाता)` in `.env`.
  - Replaced `timeout` with `ping 127.0.0.1 -n 6 >nul` to prevent input redirection crashes on Windows console execution.
  - Used jump labels (`goto BUILD_BACKEND`) instead of inline parenthesized blocks around Maven execution.
  - Used `start "" /d "<dir>"` syntax to avoid nested quotes issues across paths with spaces.
- Retained a single batch file in the repository root: [run.bat](file:///d:/ProjectRentMang/run.bat).
- Removed all auxiliary scripts (`start-app.bat`, `stop-app.bat`, `test_onboarding.ps1`, `console_setup.sql`).

### 2. Configuration & Removal of Unused Services
- **No Redis Dependency**: Redis was completely removed from the project and [.env](file:///d:/ProjectRentMang/.env). All persistence is handled directly by MySQL 8.
- **Direct JPA Configuration**: Flyway and `resources/db/migration` were removed. Database entity mapping and updates are handled directly by JPA/Hibernate (`spring.jpa.hibernate.ddl-auto=update`).
- **Clean Properties Format**: Uses standard line-by-line [application.properties](file:///d:/ProjectRentMang/backend/src/main/resources/application.properties) instead of YAML.

### 3. Navigation & Clean User Interface
- Dashboard serves as the unified view for buildings, floors, and units (redundant duplicate tab removed).
- Header cleaned up by removing redundant duplicate "+ Add Tenant" action.
- Persona demonstration switcher removed from the live header in favor of a genuine Owner profile card and Sign Out button.

### 4. Production Authentication & Strict Tenant Isolation
- **Production Email & Password Authentication**:
  - Removed dummy demo buttons and quick login persona cards from [AuthPage.tsx](file:///d:/ProjectRentMang/frontend/src/pages/AuthPage.tsx).
  - Removed paid/simulated SMS OTP login. Authentication strictly uses email address and password encrypted with `BCryptPasswordEncoder`.
- **Clean Owner Registration**:
  - Split full name into two distinct database fields: `first_name` and `last_name` in the `users` table.
  - Removed PAN card requirement and manual organization firm name input from the registration form.
  - Organization is automatically created from the owner's last name (`<LastName> Properties & Estates`).
- **Standard Indian Phone Number Validation**:
  - Implemented standard 10-digit Indian mobile number validation (`^[6-9]\d{9}$`) on both the React frontend and Spring Boot backend.
  - Normalized numbers automatically into standard E.164 format (`+91 XXXXX XXXXX`).
- **Strict Data Isolation Guard**:
  - Employs Hibernate 6 `@TenantId` and composite primary keys `(organization_id, id)` on all tenant entities (`Building`, `Unit`, `Tenant`, `Lease`, `PaymentReceipt`, `Expense`, etc.).
  - `JwtAuthenticationFilter` builds `TenantContext` strictly from verified JWT claims (`orgId`, `userId`, `role`).
  - Cross-tenant data leakage is 100% prevented by database view and composite tenant key constraints.

### 5. Elimination of Dummy Data in Charts & Maintenance SLA
- **Dynamic 12-Month Collection Trend Chart**:
  - Replaced hardcoded static Lakh values in [BilledVsCollectedChart.tsx](file:///d:/ProjectRentMang/frontend/src/components/ui/BilledVsCollectedChart.tsx) with dynamic computations aggregating from real recorded payment receipts (`receipts`) and active monthly leases (`leases`).
  - Displays a clean empty state when an organization has no payment records yet, and automatically populates as rent is collected.
- **Maintenance & SLA Real-Time Persistence**:
  - Removed hardcoded dummy meter reading entries (`meter-1`, `meter-2`) from [ManagerCaretakerDashboard.tsx](file:///d:/ProjectRentMang/frontend/src/pages/ManagerCaretakerDashboard.tsx). Meter readings start empty and calculate from live inputs and real unit selections.
  - Added an interactive "Log Maintenance Ticket" modal allowing caretakers/managers to select from active units, choose categories (Plumbing, Electrical, Carpentry, etc.), specify SLA deadlines (12h Urgent, 24h High, 48h Standard, 72h Low), and persist directly to MySQL via `TicketService`.
  - Removed mock SLA metrics and hardcoded vendor names from [VendorDashboard.tsx](file:///d:/ProjectRentMang/frontend/src/pages/VendorDashboard.tsx), computing live SLA performance based on actual work orders.

### 6. Branding Assets & Favicon Integration
- Copied `favicon.png` (80x80) and `Logo.png` (32x32) into `frontend/public/` (`favicon.png`, `favicon.ico`, `logo.png`) and `frontend/src/assets/`.
- Updated `frontend/index.html` to load the brand favicon across all standard browser and mobile formats.
- Integrated the official logo image in the main sidebar header ([Sidebar.tsx](file:///d:/ProjectRentMang/frontend/src/components/layout/Sidebar.tsx)) and authentication screen ([AuthPage.tsx](file:///d:/ProjectRentMang/frontend/src/pages/AuthPage.tsx)), replacing previous placeholder glyphs.
