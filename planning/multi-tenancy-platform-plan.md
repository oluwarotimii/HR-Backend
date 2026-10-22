# Multi-Tenancy & Platform Admin — Architecture & Build Plan

## 1. What this is for

Today, this system assumes there is exactly one company in the database. To sell it to
multiple companies without standing up a separate server per client, the backend needs
to become **multi-tenant**: one server, one database cluster, each client's data walled
off from every other client's.

On top of that, Femtech needs its own internal tool — a **Platform Admin Dashboard** —
to create new client sites, see who's on the platform, and suspend/reactivate a client
if needed. This is separate from the HR Admin dashboard every client company already
uses; it's Femtech's own control panel for running the business.

This document is the full plan for both pieces, in the order they should be built.

---

## 2. The approach: schema-per-tenant, one database cluster

Two ways to do multi-tenancy were considered:

1. **Shared schema** — one set of tables, every row tagged with a `company_id`, every
   query filtered by it.
2. **Schema-per-tenant** — one database server, but each company gets its own schema
   (think of it as its own private database), with the exact same tables the system
   already has.

**Chosen: schema-per-tenant.** Reasons:

- The codebase already assumes "the whole database is one company." Schema-per-tenant
  keeps that assumption true *inside* each schema — nothing about how the 70+ existing
  route files query the database has to change.
- Shared schema means adding a `company_id` filter to every query in every model file.
  Miss one, and Company A's HR admin can see Company B's staff list or payroll data.
  That single bug is the kind that ends a client relationship (and possibly invites
  legal trouble) the first time it happens. Schema-per-tenant makes that class of bug
  structurally impossible — Company A's connection simply cannot see Company B's schema.
- Production already runs on **TiDB Cloud** (confirmed in `src/config/database.ts` —
  it's MySQL-wire-compatible but a distributed cluster, not a single box). TiDB is built
  to handle many schemas/databases on one cluster without the usual single-MySQL-server
  ceiling. This approach fits the infrastructure that's already in place.

The one real cost of this approach: a small new layer that figures out, for every
incoming request, *which* company's schema to talk to, and quietly switches the
database connection to match — without having to rewrite the 74 files that currently
do `import { pool } from '../config/database'` and just use it directly.

---

## 3. Domains & branding

- Pick a short brand domain — e.g. `femhr.com` (check it's actually available to
  register; I can't check that for you).
- Each client company's HR Admin dashboard lives at `company-slug.femhr.com`
  (e.g. `acme.femhr.com`). This is resolved from the `Host` header on the request —
  a company's slug maps to its schema in the tenant registry (see §4.1). It also means
  the login page itself can show that company's name/logo before anyone even logs in.
- The **staff App (PWA) and mobile app** do *not* need subdomains. They're compiled
  apps hitting one fixed API address (e.g. `api.femhr.com`), not something a user types
  a URL into. For these, the tenant is resolved after login, from which company the
  logging-in user belongs to (see §4.3) — no subdomain logic needed on that side at all.
- Femtech's own current domain, `hrtms.femtechaccess.com.ng`, does not have to move.
  It can keep serving Femtech's own data as "Tenant #1" indefinitely, while every new
  client signed going forward gets the new `*.femhr.com` pattern. (Or, for consistency,
  Femtech's own instance can be moved to `femtech.femhr.com` too — your call, not a
  technical requirement either way.)

---

## 4. The new pieces, in detail

### 4.1 Control-plane database

One small, separate database (outside any client's schema) that Femtech's platform
itself owns. Two tables to start:

- **`tenants`** — `id`, `company_name`, `slug` (used in the subdomain), `schema_name`,
  `tier` (Small/Medium/Large — ties to the pricing tiers already agreed), `status`
  (`active` / `suspended`), `created_at`.
- **`platform_admins`** — Femtech's own internal staff who are allowed to log into the
  Platform Admin Dashboard. Deliberately a completely separate login from any client's
  HR Admin accounts — a platform admin is not a user inside any tenant's schema.

### 4.2 Tenant-aware connection layer

Right now, `src/config/database.ts` creates one `pool` and everything imports it
directly. The fix that avoids touching all 74 of those files: use Node's
`AsyncLocalStorage` to make "the correct pool for this request" available
automatically, without threading it through every function call by hand.

In practice:

- `database.ts` keeps a pool *per schema*, created on first use and cached (a small
  pool per active tenant, not one connection per request).
- A piece of middleware, placed right after tenant resolution (§4.3), stores "use this
  tenant's pool" in `AsyncLocalStorage` for the rest of that request's lifetime.
- The exported `pool` that all 74 files already import becomes a thin object whose
  methods (`execute`, `query`, etc.) look up the current request's pool from
  `AsyncLocalStorage` before running. Every existing model file keeps working exactly
  as written — this is the one piece of genuinely new, careful code in the whole plan.

### 4.3 Tenant resolution middleware

Two separate signals, because the admin web app and the staff apps reach the backend
differently:

- **HR Admin web dashboard** → resolve tenant from the subdomain in the `Host` header
  (`acme.femhr.com` → look up `acme` in the `tenants` table → get its `schema_name`).
  Works even before login, so the login page can be branded per company.
- **Staff App / mobile** → these hit one shared API address with no subdomain. Tenant
  is resolved *after* authentication: once the JWT is verified and `UserModel.findById`
  runs (this already happens on every request today, in `auth.middleware.ts`), look up
  which tenant that user belongs to and set the connection context from there.

Both paths end at the same place: the `AsyncLocalStorage` context from §4.2 gets set,
and every model file downstream just works against the right schema without knowing
any of this happened.

### 4.4 Tenant provisioning — the "create new site" action

This is the function the Platform Admin Dashboard's "Create Company" button calls.
One action, several steps, run as a single transaction-like sequence:

1. Pick a `slug` (validated as unique, used for the subdomain) and a `tier`.
2. Create a new schema on the TiDB cluster.
3. Run the full set of `CREATE TABLE` statements against it (the current schema
   structure, exported once as a template — see §5).
4. Seed sane defaults into the new schema: default roles/permissions, a starter set of
   leave types, a first branch record, default global attendance settings.
5. Create the first HR Admin user for that company (the account its owner will
   actually log in with first).
6. Insert the row into the control-plane `tenants` table, marking it `active`.
7. Return the subdomain and first-login credentials so Femtech can hand them to the
   new client.

Build this as one well-tested backend function/script first, callable directly, before
wiring a button to it — it's the single most important piece to get right, since it's
what runs every time you sign a new client.

### 4.5 Platform Admin Dashboard

Kept deliberately small — this is Femtech's internal tool, not a product in itself:

- **Login** — separate from any tenant; authenticates against `platform_admins`, not
  any company's `users` table.
- **Tenant list** — every client company, its tier, status, created date.
- **Create Tenant** — a form wrapping the provisioning action in §4.4.
- **Tenant detail** — basic stats (staff count, last login) useful for support and
  billing conversations, plus a suspend/reactivate toggle.

Fastest way to ship this: a new, permission-gated section inside the *existing*
Frontend codebase, talking to a small new set of `/api/platform/*` routes that check
against `platform_admins` instead of the usual JWT/tenant flow — rather than standing
up an entirely separate application. Simpler to build, simpler to maintain.

### 4.6 File storage isolation

Staff documents, leave attachments, and profile photos currently live in a local
`uploads/` folder on the server, served via `express.static` (see `index.ts`). Two
companies both having a staff member upload `passport.jpg` would otherwise collide.
Fix: either per-tenant subfolders under `uploads/{schema_name}/...`, or move to
S3-compatible object storage with tenant-prefixed keys (the more future-proof option,
and avoids ever running out of local disk on the server as new clients join).

---

## 5. Migrating the existing live system into "Tenant #1"

The current database becomes the very first tenant's schema, not a special case:

1. Export the current schema structure (the `CREATE TABLE` statements) once — this
   becomes the template used by provisioning (§4.4) for every tenant after this one.
2. Rename/move the current live database to sit under the new scheme as
   `schema_name = 'femtech'` (or similar), and add its row to the new `tenants` table
   by hand.
3. Point the existing `hrtms.femtechaccess.com.ng` domain at that schema specifically
   (either hardcode it as a fallback when no subdomain tenant matches, or just give it
   its own `tenants` row with that domain recorded).
4. Verify the live system still works end-to-end exactly as before, now running
   through the new connection-resolution layer. This is the step that proves the new
   layer is safe before a second real client ever touches it.

---

## 6. Suggested build order

Each phase should leave the live system working — nothing here requires downtime if
done in this order:

1. **Control-plane database + tenant-aware connection layer** (§4.1, §4.2) — build and
   test against the existing single database first, with exactly one tenant row
   (Femtech itself). If this phase is solid, everything behaves identically to today.
2. **Migrate the live system into "Tenant #1"** (§5) — prove the new layer works
   in production with real data and zero visible change to current users.
3. **Tenant resolution middleware** (§4.3) — subdomain-based for admin web,
   user-lookup-based for the apps.
4. **Tenant provisioning function** (§4.4) — build and test it by creating one
   throwaway pilot tenant with fake data, end to end, before it's wired to any UI.
5. **Platform Admin Dashboard** (§4.5) — thin UI over the provisioning function and
   tenant list.
6. **File storage isolation** (§4.6) — can happen in parallel with steps 3-5.
7. **Sell and provision the second real client** — the actual first use of the whole
   system, once steps 1-6 are done and step 4 has been proven on a pilot tenant.

Steps 1-2 are the foundation everything else sits on, and the highest-stakes to get
right since they touch the live system. Steps 3-6 are new, additive code that doesn't
risk anything already working.

---

## 7. Rough effort/risk by phase

| Phase | Size | Risk if rushed |
|---|---|---|
| Control-plane DB + connection layer | Medium | High — this is the one piece that, if wrong, could leak data between tenants or break the live system |
| Migrate live system to Tenant #1 | Small | Medium — mostly a careful, verifiable one-time move |
| Tenant resolution middleware | Small | Low — fairly mechanical once §2 exists |
| Provisioning function | Medium | Medium — needs real testing with a pilot tenant before trusting it with a paying client |
| Platform Admin Dashboard | Small-Medium | Low — internal tool, bugs here don't touch client data |
| File storage isolation | Small | Low-Medium — low risk now, expensive to retrofit later if skipped |

Nothing here is a quick afternoon fix, but nothing is a rebuild either — this is a
focused backend project layered on top of the existing system, not a rewrite of it.

---

## 8. Decisions needed from you before/while building

- Final brand domain (`femhr.com` or alternative) — check registrar availability.
- Exact fields to capture when creating a new tenant (company name, contact person,
  tier, billing start date, anything else Femtech needs for its own records).
- Whether Femtech's own current instance moves to the new subdomain pattern too, or
  keeps its existing domain permanently as a special case.
- Who are the first "platform admins" (which Femtech staff get access to the new
  dashboard).
