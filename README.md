# BrightPath CRM

An enquiry-to-admission CRM for **BrightPath Academy**. Counsellors capture student enquiries, move them through the admissions pipeline, schedule follow-up calls, and every action is recorded in an audit trail. Managers and admins see the whole team's pipeline on a live KPI dashboard.

**Stack:** React 19 · Vite 8 · React Router 7 · Supabase (PostgreSQL, Auth, Row Level Security) · Vercel

---

## Contents

1. [Features](#1-features)
2. [Architecture](#2-architecture)
3. [Prerequisites](#3-prerequisites)
4. [Local setup](#4-local-setup)
5. [Database: migrations, seed data & roles](#5-database-migrations-seed-data--roles)
6. [Security model (RLS)](#6-security-model-rls)
7. [Deploying to Vercel](#7-deploying-to-vercel)
8. [Scripts & quality checks](#8-scripts--quality-checks)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Features

| Area | What it does |
|---|---|
| **Authentication & roles** | Email/password sign-in via Supabase Auth. Every new account is a `counsellor`; `manager` and `admin` are granted by SQL only (users cannot promote themselves). |
| **Lead management** | Create, view, edit, and delete (manager/admin) student enquiries. Search by name, phone, email or course; filter by status, course and source. Desktop table, mobile card list. |
| **Pipeline stages** | `New → Contacted → Qualified → Converted`, or `Lost`. Marking a lead **Lost requires a reason** — enforced in the UI *and* by a database constraint. |
| **Follow-ups** | Schedule calls/meetings with a due date-time and assignee. Tabs for Overdue / Upcoming / Completed / All. A task is **overdue** when it is `pending` and its due time has passed; marking it completed clears the flag. |
| **Activity audit trail** | Lead creation, edits, stage changes, and follow-up scheduling/completion are written to `activities` automatically and shown as a timeline on each lead, with who did it and when. |
| **Dashboard** | 5 KPIs (Total Leads, New, Converted, Overdue Follow-ups, Conversion Rate), pipeline-stage and lead-source breakdowns, and the 5 longest-overdue follow-ups. Counts respect RLS, so each user's dashboard matches their own Leads list. |
| **Accessibility & resilience** | Keyboard-operable dialogs (focus trap, Escape, focus return), labelled form fields, skip link, WCAG AA text contrast, toast notifications, friendly network/permission errors, and crash-recovery screens. |

---

## 2. Architecture

```
Browser (React SPA, hosted on Vercel)
  │
  │  supabase-js over HTTPS, using the public anon key + the user's session JWT
  ▼
Supabase
  ├── Auth ............. email/password accounts (auth.users)
  └── PostgreSQL ....... profiles, leads, follow_ups, activities
                         └── Row Level Security decides what each user may read/write
```

There is **no custom backend server**. The browser talks to Supabase directly, so all authorisation lives in the database's RLS policies (see §6) — the React route guards only improve UX; they are not the security boundary.

### Project layout

```
src/
├── main.jsx, App.jsx        Entry point, router, providers, lazy-loaded routes
├── lib/
│   ├── supabaseClient.js    Single Supabase client + `isConfigured` env check
│   ├── errorMessages.js     Maps network / Postgres errors to friendly messages
│   └── validation.js        Shared lead form validation
├── context/                 AuthContext (session, profile, role) and ToastContext
├── services/                All database access — one module per table/concern
│   ├── leadService.js       Lead CRUD, search/filter, status changes, option lists
│   ├── followUpService.js   Follow-up CRUD + overdue rules (isOverdue, getOverdue…)
│   ├── activityService.js   logActivity / getLeadActivities
│   └── dashboardService.js  KPI aggregation
├── features/                Feature components: leads/, followups/, activities/, dashboard/
├── components/
│   ├── common/              Button, Card, Badge, Modal, Toast, ErrorBoundary, banners…
│   ├── layout/              AppLayout (top bar, mobile drawer), Sidebar
│   └── auth/                ProtectedRoute, RoleBadge
├── pages/                   One component per route
└── index.css                Design tokens (CSS variables) and global styles

supabase/
├── migrations/                                    Run in filename order
│   ├── 20261023000001_initial_schema.sql          Tables, triggers, RLS policies
│   └── 20261029000001_restrict_get_user_role.sql  Signed-in-only access to the role helper
├── seed.sql                                       Optional demo data
└── README.md                                      Database setup & admin promotion
```

**Conventions:** pages and components never call Supabase directly — they go through `src/services/*`. Every service function returns `{ data, error }` and never throws, with `error` already converted to a user-friendly message.

### Routes

| Path | Page | Access |
|---|---|---|
| `/login` | Sign in / register | Public |
| `/` | Dashboard | Signed in |
| `/leads` | Enquiry pipeline (search, filters, create) | Signed in |
| `/leads/:id` | Lead detail: stage, follow-ups, activity timeline | Signed in, and RLS must allow the lead |
| `/follow-ups` | All follow-ups the user can see | Signed in |
| `/settings` | Your profile, role, and database connection status | Signed in |

---

## 3. Prerequisites

- **Node.js 20.19+ or 22.12+** (required by Vite 8) — check with `node -v`
- **npm** (bundled with Node)
- A free **[Supabase](https://supabase.com)** account and project
- For deployment: a **GitHub** account and a free **[Vercel](https://vercel.com)** account

---

## 4. Local setup

```bash
# 1. Clone and install
git clone https://github.com/mainabhijit/brightpath-crm.git
cd brightpath-crm
npm install

# 2. Configure environment variables
cp .env.example .env
```

Edit `.env` with the values from **Supabase Dashboard → Project Settings → API**:

```dotenv
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

> ⚠️ Use the **anon / public** key only. Anything prefixed `VITE_` is bundled into the browser JavaScript and visible to every visitor. **Never** put the `service_role` key or the database password in this file. `.env` is git-ignored; `.env.example` is the committed template.

```bash
# 3. Create the database (see §5), then start the dev server
npm run dev
```

Open http://localhost:5173, choose **Register**, and create your first account.

**Demo mode:** if the two variables are missing, the app still starts but shows a yellow *"Database not connected — demo mode"* banner, loads no data, and skips sign-in. This is intended for previewing the UI only.

---

## 5. Database: migrations, seed data & roles

Full step-by-step instructions, including a reset procedure, are in **[`supabase/README.md`](./supabase/README.md)**. In short:

1. **Run the migrations, in filename order** — open Supabase **SQL Editor → New query**, paste the whole of `supabase/migrations/20261023000001_initial_schema.sql`, and click **Run**. This creates the 4 tables, triggers, indexes, and all RLS policies. Repeat with `20261029000001_restrict_get_user_role.sql`.
2. **Register your first user** in the app (`npm run dev` → Register). A database trigger automatically creates their `profiles` row with role `counsellor`.
3. **(Optional) Load demo data** — run `supabase/seed.sql` in the SQL Editor. It inserts 6 sample leads with follow-ups and history, assigned to the first profile it finds, so run it *after* step 2.
4. **Promote yourself to admin** (SQL Editor):
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id IN (SELECT id FROM auth.users WHERE email = 'you@example.com');
   ```
   Sign out and back in to pick up the new role.

### Tables

| Table | Purpose | Key rules |
|---|---|---|
| `profiles` | One row per staff user (linked to `auth.users`) | `role` ∈ `counsellor`, `manager`, `admin`; default `counsellor` |
| `leads` | Student enquiries | `status` ∈ `New`, `Contacted`, `Qualified`, `Converted`, `Lost`; `lost_reason` required when `Lost`; `updated_at` maintained by trigger |
| `follow_ups` | Scheduled tasks against a lead | `status` ∈ `pending`, `completed`, `cancelled`; `completed_at` set on completion |
| `activities` | Append-only audit log per lead | `activity_type` ∈ `lead_created`, `lead_updated`, `status_updated`, `follow_up_scheduled`, `follow_up_completed` |

Deleting a lead cascades to its follow-ups and activities.

---

## 6. Security model (RLS)

Row Level Security is enabled on every table. A user's role is read through the `SECURITY DEFINER` function `get_user_role()` to avoid recursive policy checks. Only signed-in users may call it, so signed-out visitors cannot look up anyone's role.

| Table | Read | Create | Update | Delete |
|---|---|---|---|---|
| `profiles` | Any signed-in user (needed for assignee pickers) | Trigger only | Own name only — **cannot change own role**; admins can update anyone | — |
| `leads` | Manager/admin: all. Counsellor: leads they **created or are assigned to** | Any signed-in user | Same as read | **Manager/admin only** |
| `follow_ups` | If the user can access the parent lead | Same | Same | Manager/admin, or the follow-up's creator |
| `activities` | If the user can access the parent lead | Same (signed in) | — (immutable) | — (immutable) |

**What this means in practice**
- A counsellor's Leads list, Follow-ups page and Dashboard only ever include their own and assigned leads — this is enforced by Postgres, not by filtering in React.
- Unauthenticated requests (no session) match no policy and get no rows, even with the anon key.
- If RLS blocks an action, the UI shows *"You don't have permission to make this change."*

---

## 7. Deploying to Vercel

1. **Push** the repository to GitHub.
2. In Vercel: **Add New → Project → Import** the repository. Vercel detects **Vite** automatically (build command `npm run build`, output directory `dist`) — leave the defaults.
3. Under **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (same values as your `.env`) for **Production** and **Preview**.
4. Click **Deploy**. Every push to `main` now redeploys automatically.
5. In **Supabase → Authentication → URL Configuration**, set **Site URL** to your Vercel URL (e.g. `https://brightpath-crm.vercel.app`) and add it under **Redirect URLs**. Otherwise links in confirmation emails point to `localhost`.

`vercel.json` rewrites every path to `index.html`, so refreshing or opening a deep link such as `/leads/<id>` works instead of returning a Vercel 404.

> Environment variables are baked in **at build time**. After adding or changing them in Vercel, trigger a **Redeploy**.

---

## 8. Scripts & quality checks

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload (http://localhost:5173) |
| `npm run lint` | Static analysis with [oxlint](https://oxc.rs) (React hooks rules, fast-refresh rules) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally to test it |

**Before every push:** `npm run lint && npm run build` should report **0 warnings, 0 errors**.

The production build is code-split: each page is lazy-loaded, and React and Supabase live in separate vendor chunks that browsers keep cached across deploys.

---

## 9. Troubleshooting

| Symptom | Cause & fix |
|---|---|
| Yellow **"Database not connected — demo mode"** banner | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` missing or still the placeholder values. Fix `.env` and restart `npm run dev`; on Vercel, set them and **Redeploy**. |
| Sign-up succeeds but sign-in says **"Email not confirmed"** | Supabase requires email confirmation by default. Click the link in the email, or for a workshop disable it in **Authentication → Providers → Email → Confirm email**. |
| Confirmation email link opens `localhost` | Set **Site URL** / **Redirect URLs** in Supabase (see §7 step 5). |
| Sign-in works but **lists are empty** | Expected for a new counsellor — they only see leads they created or are assigned to. Create a lead, or promote the account to `manager`/`admin` (§5 step 4). |
| `relation "public.leads" does not exist` | The migration hasn't been run on this Supabase project. Run it in the SQL Editor (§5 step 1). |
| **"You don't have permission…"** toast | RLS refused the action — e.g. a counsellor deleting a lead, or editing someone else's lead. Use a manager/admin account. |
| **"Can't reach the server…"** toast | Network offline or Supabase project paused (free projects pause after inactivity — resume it in the Supabase dashboard). |
| Role change has no effect | Sign out and back in so the app reloads the profile. |
| **404** when refreshing a page on Vercel | `vercel.json` is missing from the deployment — make sure it is committed at the repository root. |
| `npm run dev` fails with an engine/syntax error | Node version too old — install Node 20.19+ or 22.12+. |

---

## License

Built for the BrightPath Academy workshop. Demo data in `supabase/seed.sql` is fictional.
