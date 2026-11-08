# Northwind CRM

A frontend-only CRM prototype built with Vite, React, strict TypeScript and Tailwind CSS. It uses a compact Fluent-enterprise visual direction rather than a marketing-style dashboard.

## Delivery status — read first

This is a substantial prototype, **not a completed implementation of every requirement in the supplied build specification**. Source syntax and mock-service flows were tested in the generation environment. Dependency installation was blocked by the offline environment. A successful TypeScript build, ESLint run, browser interaction pass, accessibility audit and responsive visual review have **not** been established.

See REQUIREMENTS.md for the implemented/partial/missing feature breakdown and VERIFICATION.md for actual check results. No production-readiness claim is made.

## Setup

Use Node.js 20.19+ or a current supported LTS release.

```sh
npm install
npm run dev
```

Open the local address printed by Vite.

```sh
npm run build
npm run lint
npm test
npm run preview
```

No backend, API key, account or environment variables are required. Dependency ranges are declared in package.json; a lockfile could not be generated in the offline build environment. Commit the generated package-lock.json after a successful local install. Vite 6 is a pinned compatibility baseline, not a claim about the latest release.

## Feature overview

- Compact application shell, sidebar collapse, route workspace tabs, breadcrumbs, command palette, quick create, status bar and keyboard shortcut help.
- Light/dark/system themes and compact/comfortable table density.
- Seeded leads, contacts, companies, deals, tasks, tickets, activities and demo email.
- Shared create/edit/delete forms with React Hook Form and Zod validation; destructive confirmation; duplicate contact-email warning.
- TanStack Table sorting, column resizing, visibility, pagination and row selection.
- Lead source filters, capture simulator and public-style website inquiry form at `/forms/website-inquiry`.
- Lead conversion creates a contact, a company if absent, and an optional deal, and prevents repeated conversion.
- Pipeline board supports pointer drag and drop, stage editing through the record form, lost-reason dialog on board moves and Undo.
- Task list, status board, simple monthly calendar, date-category tabs, bulk completion, reminders, completion and snooze controls.
- Demo inbox with folders, recipient suggestions, templates, draft saving, simulated send and opened status, timeline entries, and email-to-ticket conversion.
- Reporting overview with computed KPIs, revenue/stage/source charts, targets, tasks, sales date/owner filters, CSV and Print.
- Support records with ownership, status, notes and create-from-contact/email actions.
- Role-adapted navigation and basic ownership scoping; local preferences; settings for pipeline stages, automations, mock connection and data reset/export.
- Fourteen-step route-aware guided tour, replay, arrow navigation and Escape dismissal.

## Architecture

```text
src/
  app/             Router, shell, lazy routes and error boundary
  components/      Shared grid, board and record editor
  components/ui/   Buttons, dialog, badges, avatars and export helpers
  features/        Record workspace, overview, inbox, settings, public form
  services/        Promise-based mock API and relative-date seed data
  store/           Zustand state and persisted preferences
  tours/           Tour provider, hook and route-aware configuration
  lib/             Currency and date formatting
  types/           Shared entity and settings types
  styles/          Semantic tokens, Tailwind layers and responsive UI
```

The shared record workspace is intentional for this prototype. It is not the requested fully separated, one-slice-per-feature production architecture. Entity models share a common record shape; richer domain-specific schema separation is outstanding.

## Design-token reference

All component colors use semantic CSS variables; the token definitions are in `src/styles/index.css`. Tailwind maps the surface tokens and a custom brand scale in `tailwind.config.js`.

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| `--bg` | #F5F6F8 | #101216 | Workspace canvas |
| `--surface` | #FFFFFF | #171A20 | Tables, panels and dialogs |
| `--raised` | #FAFAFB | #1E222A | Header and subtle surfaces |
| `--border` | #E3E5E9 | #2A2F38 | Hairline separation |
| `--text` | #1B1F24 | #E8EAED | Primary content |
| `--muted` | #5B6470 | #9AA3AF | Secondary content |
| `--brand` | #0F6CBD | #65A9E6 | Interactive accent |
| `--brand-soft` | #EAF3FB | #1A3046 | Active and selected surfaces |
| `--success` | #187448 | #70CE9B | Positive outcomes |
| `--warning` | #946300 | #E8BC62 | Attention |
| `--danger` | #BA3538 | #F28E91 | Destructive and overdue |
| `--info` | #0C7B86 | #66C6CF | Informational chart color |

Semantic success/warning/danger backgrounds have matching theme variables. Full semantic border variants remain to be added. Inter is the UI font; JetBrains Mono is used for IDs and selected numeric values. Both fonts are bundled with @fontsource rather than fetched remotely. Radius is 4px on controls, 6px on panels, 8px on dialogs and full on avatars. Most transitions use 160–180ms; reduced-motion preferences suppress animation.

## Replace the mock services with a REST API

`src/services/api.ts` owns all domain-data reads and writes. Preserve these signatures while replacing the implementation:

```ts
all(): Promise<Database>
save(kind: Kind, item: RecordItem): Promise<RecordItem>
remove(kind: Kind, ids: string[]): Promise<void>
convert(id: string, withDeal: boolean): Promise<Database>
reset(): Promise<Database>
```

1. Replace localStorage loading/persistence and artificial latency with fetch requests.
2. Translate non-2xx responses into typed errors. Add cancellation and retry strategy.
3. Implement lead conversion as a server-side transaction with idempotency protection.
4. Move permissions, ownership rules and role authorization to the server. The demo role switcher is not a security boundary.
5. Replace full-database refreshes with paginated resource queries and optimistic cache updates.
6. Keep UI preferences separate from customer data; add migrations for persisted preferences.
7. Replace mock email timers with provider integration and verified webhooks. Do not collect credentials in this mock connection screen.

The UI currently refreshes the whole mock database after writes, so this interface is a prototype seam, not an efficient production query design.

## Defaults and limitations

- All amounts use USD. Multi-currency accounting and exchange-rate aggregation are not implemented.
- The four owners use Amira Khan as the demo salesperson identity. Roles are local presentation controls only.
- Dates are relative to first seed/reset time. Times display in the browser timezone. Created dates are used as a proxy for closed revenue dates in sample charts.
- Revenue means won opportunity value, not recognized accounting revenue. Targets are illustrative fixed values.
- Follow-ups default to two days; the delay is not editable in this version.
- Demo data is per browser and not cross-tab synchronized. Deleting a parent record does not cascade into related records.
- Native HTML dialogs provide basic focus trapping; custom tour focus management and complete accessibility verification remain outstanding.
- Route tabs represent module pages, not opened document records.
- No customer data leaves this browser. Do not enter sensitive information. localStorage is not encrypted.
- Production hosting requires an SPA fallback to index.html for direct route loading.

## Manual verification checklist

- Capture an inquiry through the simulator and the public form; refresh and verify persistence.
- Select multiple leads, assign an owner, open a lead, convert with a deal and verify related data.
- Create a contact using an existing email and verify duplicate prevention.
- Drag a deal, Undo the move, move to Lost with a reason, and move using the form status select.
- Complete and snooze overdue tasks; verify reminder counts after the next minute tick.
- Send an email to a seeded contact and verify its activity entry and simulated opened flag.
- Convert an email to a ticket; edit ownership/status and resolve it.
- Change theme and role; refresh and verify preference persistence.
- Run the tour end to end; test Back, Next, Skip, arrow keys and Escape.
- Exercise keyboard navigation, dialogs, small-screen layout, dark charts and print output.
- Run build/lint/tests and address any errors before deployment.
