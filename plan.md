# BrightPath CRM — Master Implementation Plan

> **Master Specification**: `BrightPath_CRM_Full_Master_Build_Prompt.docx`  
> **Tech Stack**: React 19 • Vite • Supabase (PostgreSQL, Auth, RLS) • Git / GitHub • Vercel  
> **Target Application**: Enquiry-to-Admission CRM for BrightPath Academy  

---

## 1. Feature Delivery Lifecycle

Every single feature in this project is developed, verified, deployed, and tested on the live URL in isolation before moving to the next feature.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 1. Local Dev    │ ──> │ 2. Local Test   │ ──> │ 3. Git Push     │
│    (Code/Files) │     │    (Build/Lint) │     │    (GitHub)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 6. Next Feature │ <── │ 5. Live Test    │ <── │ 4. Vercel Deploy│
│    (Approval)   │     │    (Production) │     │    (Auto CI/CD) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 2. Master Phase Order

- **[Phase 0]**: Workspace Alignment & Repository Hygiene
- **[Phase 1]**: Design System, Layout Shell & Responsive Navigation
- **[Phase 2]**: Supabase Client Integration & Environment Guardrails
- **[Phase 3]**: Database Architecture, SQL Migrations & Row-Level Security (RLS)
- **[Phase 4]**: Authentication & User Role Lifecycle (Counsellor, Manager, Admin)
- **[Phase 5]**: Lead Management System (P0 CRUD, Search, Filters, Detail View)
- **[Phase 6]**: Follow-up Scheduling Engine & Activity Audit Log (P0 Core)
- **[Phase 7]**: Analytics Dashboard & Real-Time KPI Reconciliation
- **[Phase 8]**: Accessibility, Form Validation, Error Handling & Mobile Hardening
- **[Phase 9]**: Static Code Checks, Production Build & Student Handover Docs
- **[Phase 10]**: Final Production Audit & Workshop Sign-off

---

## Phase 0: Workspace Alignment & Repository Hygiene

### Objective
Synchronize the local project directory with the GitHub repository (`mainabhijit/brightpath-crm`), verify ignore rules, and ensure baseline builds without errors.

### Implementation Tasks
1. Initialize Git in `/Users/abhijitrout/brightpath-crm` and link remote:
   ```bash
   git init
   git remote add origin https://github.com/mainabhijit/brightpath-crm.git
   ```
2. Verify `.gitignore` contains:
   ```gitignore
   node_modules
   dist
   .env
   .env.*
   !.env.example
   ```
3. Run baseline build and lint checks to confirm starter health.

### Local Verification
```bash
git status
npm run build
npm run lint
```
- **Expected Result**: 0 lint warnings/errors, clean build output in `dist/`.

### Deployment & Live Verification
```bash
git add .
git commit -m "chore: align workspace repository hygiene and baseline checks"
git push -u origin main
```
- **Live Check**: Confirm GitHub repo is up-to-date and Vercel triggers a clean baseline build.
- **Approval Gate**: User approval to begin Phase 1.

---

## Phase 1: Design System, Layout Shell & Responsive Navigation

### Objective
Build the application frame, typography, color palette, navigation sidebar, mobile drawer, and placeholder routes.

### Files to Create / Modify
- `package.json` (add `react-router-dom`, `lucide-react`)
- `src/index.css` (custom CSS design tokens: Navy `#0f172a`, Slate `#1e293b`, Royal Blue `#2563eb`, Cool White `#f8fafc`)
- `src/components/layout/AppLayout.jsx` (desktop sidebar, mobile header, user profile chip)
- `src/components/common/Button.jsx`, `Badge.jsx`, `Card.jsx`, `Modal.jsx`, `Spinner.jsx`
- `src/pages/DashboardPage.jsx`
- `src/pages/LeadsPage.jsx`
- `src/pages/LeadDetailPage.jsx`
- `src/pages/FollowUpsPage.jsx`
- `src/pages/SettingsPage.jsx`
- `src/pages/NotFoundPage.jsx`
- `src/App.jsx` (BrowserRouter with nested route hierarchy)

### Local Verification
```bash
npm run build
npm run lint
npm run dev
```
- **Manual Checks**:
  1. Desktop: Clicking sidebar links changes pages with zero page refresh.
  2. Mobile (<768px): Hamburger button toggles mobile drawer; clicking a link closes drawer and navigates.
  3. Visual theme matches modern SaaS guidelines.

### Deployment & Live Verification
```bash
git add .
git commit -m "feat: implement design system, responsive layout and navigation"
git push origin main
```
- **Live Check**: Open live Vercel URL, verify navigation on both desktop and mobile browser modes.
- **Approval Gate**: User approval to proceed to Phase 2.

---

## Phase 2: Supabase Client Integration & Environment Guardrails

### Objective
Integrate the official Supabase SDK, establish environment variable validation, and provide an actionable setup banner if variables are missing.

### Files to Create / Modify
- `package.json` (add `@supabase/supabase-js`)
- `.env.example` (template with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- `src/lib/supabaseClient.js` (singleton client with configuration validator)
- `src/components/common/ConfigWarningBanner.jsx` (shown when credentials are not configured)
- `src/components/layout/AppLayout.jsx` (mount configuration banner conditionally)

### Local Verification
- **Test without `.env`**: Confirm app displays actionable warning banner rather than throwing an unhandled runtime error.
- **Test with `.env`**: Add valid Supabase URL & anon key, confirm banner disappears and Supabase client initializes cleanly.
```bash
npm run build
npm run lint
```

### Deployment & Live Verification
```bash
git add .
git commit -m "feat: add supabase client and environment guardrails"
git push origin main
```
- **Live Check**: Verify Vercel deployment; check that environment variables configured in Vercel project settings correctly activate the client.
- **Approval Gate**: User approval to proceed to Phase 3.

---

## Phase 3: Database Schema Migration, Seed Data & RLS Security

### Objective
Create repeatable SQL migrations for the relational schema, constraints, triggers, indexes, seed data, and Row Level Security (RLS) policies.

### Files to Create
- `supabase/migrations/20261023000001_initial_schema.sql`
- `supabase/seed.sql`
- `supabase/README.md` (instructions for running in Supabase SQL Editor)

### Schema Specification
1. **`profiles`**:
   - `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
   - `full_name TEXT NOT NULL`
   - `role TEXT NOT NULL DEFAULT 'counsellor' CHECK (role IN ('counsellor', 'manager', 'admin'))`
   - `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()`
2. **`leads`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `full_name TEXT NOT NULL`, `email TEXT`, `phone TEXT NOT NULL`
   - `course_interest TEXT NOT NULL`, `source TEXT NOT NULL`
   - `status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost'))`
   - `assigned_to UUID REFERENCES profiles(id)`, `created_by UUID REFERENCES profiles(id)`
   - `lost_reason TEXT`, `notes TEXT`
   - `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()`
3. **`follow_ups`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE`
   - `assigned_to UUID REFERENCES profiles(id)`
   - `due_at TIMESTAMPTZ NOT NULL`, `note TEXT NOT NULL`
   - `status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled'))`
   - `completed_at TIMESTAMPTZ`, `created_by UUID REFERENCES profiles(id)`
   - `created_at TIMESTAMPTZ DEFAULT now()`
4. **`activities`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE`
   - `actor_id UUID REFERENCES profiles(id)`
   - `activity_type TEXT NOT NULL`, `description TEXT NOT NULL`
   - `metadata JSONB DEFAULT '{}'::jsonb`, `created_at TIMESTAMPTZ DEFAULT now()`

### RLS Policies
- `profiles`: Self-read/update; managers/admins can view all profiles. Role cannot be updated by user.
- `leads`: Counsellors can only access leads they created or are assigned to. Managers and Admins access all leads.
- `follow_ups` & `activities`: Access permitted if the user has access to the linked lead.

### Verification & Testing
- Execute SQL in Supabase SQL Editor.
- Verify tables, triggers, and RLS policies via Supabase Table Editor.
- Insert fictional seed data from `supabase/seed.sql`.

### Deployment & Live Verification
```bash
git add supabase/
git commit -m "feat: add supabase relational schema, rls policies, and seed data"
git push origin main
```
- **Live Check**: Verify Supabase dashboard reflects 4 active tables with green RLS shields.
- **Approval Gate**: User approval to proceed to Phase 4.

---

## Phase 4: Authentication & User Role Lifecycle

### Objective
Implement Supabase authentication (Sign In, Sign Up, Sign Out), session persistence, and role-based UI guards.

### Files to Create / Modify
- `src/context/AuthContext.jsx` (auth listener, profile retrieval, user role state)
- `src/components/auth/ProtectedRoute.jsx` (redirects unauthenticated users to `/login`)
- `src/components/auth/RoleBadge.jsx`
- `src/pages/LoginPage.jsx` (email/password form, validation, error alerts)
- `src/pages/RegisterPage.jsx` (creates auth user; triggers profile creation)
- `src/components/layout/AppLayout.jsx` (add user profile menu & sign-out button)

### Local Verification
1. Sign up new account `counsellor1@brightpath.edu`.
2. Inspect Supabase: verify user created in `auth.users` and profile created with `role = 'counsellor'`.
3. Sign out and log back in. Test invalid password to verify error message.
4. Reload browser on protected page: verify session persists without flickering.
```bash
npm run build
npm run lint
```

### Deployment & Live Verification
```bash
git add .
git commit -m "feat: implement supabase auth and user role lifecycle"
git push origin main
```
- **Live Check**: Complete sign-up and sign-in flow on the live Vercel URL.
- **Approval Gate**: User approval to proceed to Phase 5.

---

## Phase 5: Lead Management System (P0 Core Workflow)

### Objective
Complete student enquiry management: create, view, search, filter, edit, and track status with real Supabase persistence.

### Files to Create / Modify
- `src/services/leadService.js` (CRUD queries, status filters, search queries)
- `src/features/leads/LeadTable.jsx` (desktop table & mobile cards)
- `src/features/leads/LeadFilters.jsx` (search bar, status dropdown, course dropdown, source dropdown, reset button)
- `src/features/leads/CreateLeadModal.jsx` (form validation: name, phone required; valid email; prevent duplicate submit)
- `src/features/leads/EditLeadModal.jsx` (edit lead details, mandatory reason when status is 'Lost')
- `src/pages/LeadsPage.jsx`
- `src/pages/LeadDetailPage.jsx` (overview, status changer, linked follow-ups, and activity history)

### Local Verification
1. Create lead "Aarav Sharma" (Course: IIT-JEE, Source: Website). Verify appearance in table.
2. Hard reload browser: confirm record persists in Supabase.
3. Search by partial phone number: verify filter returns accurate results.
4. Change status to "Lost" without reason: verify form validation blocks submission. Add reason: confirm save.
```bash
npm run build
npm run lint
```

### Deployment & Live Verification
```bash
git add .
git commit -m "feat: implement lead management CRUD, search, and filtering"
git push origin main
```
- **Live Check**: Create, search, and edit a test lead on the live Vercel URL.
- **Approval Gate**: User approval to proceed to Phase 6.

---

## Phase 6: Follow-up Scheduling Engine & Activity Audit Log (P0 Core)

### Objective
Schedule follow-ups with exact due dates, compute overdue states, complete tasks, and log an automatic chronological activity history.

### Files to Create / Modify
- `src/services/followUpService.js` (getUpcoming, getOverdue, completeFollowUp)
- `src/services/activityService.js` (logActivity, getLeadActivities)
- `src/features/followups/FollowUpList.jsx` (tabs: "Upcoming", "Overdue", "Completed")
- `src/features/followups/CreateFollowUpModal.jsx` (lead selector, due_at datetime-local, notes, assignee)
- `src/features/activities/ActivityTimeline.jsx` (visual timeline with icon badges by activity type)
- `src/pages/FollowUpsPage.jsx`
- `src/pages/LeadDetailPage.jsx` (embed follow-up manager and activity timeline)

### Logic Rules
- **Overdue Condition**: `status === 'pending' && new Date(due_at) < new Date()`
- **Completion**: Updates `status = 'completed'` and `completed_at = now()`, immediately clears overdue flag.
- **Automatic Logging**: Every lead creation, status transition, and follow-up completion writes a row to `activities`.

### Local Verification
1. Create follow-up with due date in the past: verify it appears under "Overdue" with red warning badge.
2. Click "Mark as Completed": verify it shifts to "Completed" and overdue counter decreases.
3. Open Lead Detail page: confirm timeline shows creation, status change, and follow-up events with timestamps.
```bash
npm run build
npm run lint
```

### Deployment & Live Verification
```bash
git add .
git commit -m "feat: implement follow-ups engine and activity timeline"
git push origin main
```
- **Live Check**: Schedule and complete a follow-up on the live Vercel URL.
- **Approval Gate**: User approval to proceed to Phase 7.

---

## Phase 7: Analytics Dashboard & Real-Time KPI Reconciliation

### Objective
Provide operational visibility with 5 key KPI metric cards, pipeline status distribution, lead source breakdown, and urgent action list.

### Files to Create / Modify
- `src/services/dashboardService.js` (metrics aggregation query)
- `src/features/dashboard/MetricCards.jsx`:
  1. Total Leads (Count of permitted leads)
  2. New Enquiries (`status = 'New'`)
  3. Converted Admissions (`status = 'Converted'`)
  4. Overdue Follow-ups (`status = 'pending' AND due_at < now()`)
  5. Conversion Rate (`(Converted / Total) * 100`, handles 0 leads safely)
- `src/features/dashboard/StatusDistributionChart.jsx` (pipeline breakdown)
- `src/features/dashboard/SourceDistributionChart.jsx` (source attribution)
- `src/features/dashboard/UrgentFollowUpsCard.jsx` (top 5 immediate overdue tasks)
- `src/pages/DashboardPage.jsx`

### Local Verification
- Numerical Reconciliation: Confirm KPI numbers match the exact count in the Leads table.
- Conversion math verification: Add 1 converted lead; verify rate recalculates accurately.
```bash
npm run build
npm run lint
```

### Deployment & Live Verification
```bash
git add .
git commit -m "feat: implement analytics dashboard and kpi metrics"
git push origin main
```
- **Live Check**: Open live Vercel URL and verify dashboard metrics reflect database records.
- **Approval Gate**: User approval to proceed to Phase 8.

---

## Phase 8: Accessibility, Form Validation, Error Handling & Mobile Hardening

### Objective
Ensure WCAG 2.1 AA accessibility compliance, global toast feedback, friendly error screens, and seamless mobile usability.

### Files to Create / Modify
- `src/context/ToastContext.jsx` & `src/components/common/Toast.jsx`
- `src/components/common/ErrorBoundary.jsx`
- `src/index.css` (high-contrast status badges, focus rings, mobile responsive CSS)
- Form accessibility audit (`aria-label`, `aria-describedby`, label associations)

### Local Verification
1. Keyboard accessibility: Full workflow test using only `Tab`, `Space`, `Enter`, and `Escape`.
2. Network failure test: Disable network in DevTools; verify user-friendly toast appears without app crash.
3. Viewport audit: Test at 375px, 414px, 768px, 1280px widths.
```bash
npm run build
npm run lint
```

### Deployment & Live Verification
```bash
git add .
git commit -m "feat: enhance accessibility, error boundaries, and mobile responsiveness"
git push origin main
```
- **Live Check**: Test mobile experience on phone or responsive emulator on the live Vercel deployment.
- **Approval Gate**: User approval to proceed to Phase 9.

---

## Phase 9: Static Code Checks, Production Build & Student Handover Docs

### Objective
Produce complete educational documentation and verify zero-warning production build.

### Files to Create / Modify
- `README.md` (complete student guide: architecture, prerequisites, local setup, SQL migrations, RLS rules, deployment guide, troubleshooting)
- Production build validation.

### Local Verification
```bash
npm run lint
npm run build
```
- **Expected Result**: 0 lint errors, clean Vite build chunk output.

### Deployment & Live Verification
```bash
git add README.md
git commit -m "docs: add comprehensive student handover and architecture guide"
git push origin main
```
- **Live Check**: Review rendered README on GitHub.
- **Approval Gate**: User approval for final Phase 10 audit.

---

## Phase 10: Final Production Audit & Workshop Sign-Off

### Objective
Perform end-to-end user acceptance testing on the live Vercel production deployment.

### Final Verification Matrix
| Test Case | Steps | Expected Result | Live Status |
| :--- | :--- | :--- | :--- |
| **Auth & Role** | Register user `counsellor@brightpath.edu` | Profile created, defaults to Counsellor | [ ] |
| **Lead Flow** | Create student enquiry with contact details | Persists in DB, appears in Leads table | [ ] |
| **Search/Filter** | Filter by Course and Status | Instant, accurate result subset | [ ] |
| **Follow-up Engine** | Schedule overdue task, mark completed | Flags red when overdue, clears upon completion | [ ] |
| **Audit Trail** | Review lead detail activity log | Every action timestamped with user attribution | [ ] |
| **Dashboard KPIs** | Reconcile dashboard with database rows | 100% numerical match | [ ] |
| **Security & RLS** | Test unauthenticated access | Blocked by Supabase RLS and route guards | [ ] |

---

## Ready for Execution

Once you approve, Phase 0 will begin immediately.
