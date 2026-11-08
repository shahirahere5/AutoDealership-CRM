# Requirement coverage

This document distinguishes implemented prototype behavior from the full requested product. "Implemented" means code is present, not that a browser acceptance test passed.

## Implemented foundations

- Vite/React/TypeScript/Tailwind project, design tokens, bundled fonts, React Router lazy feature loading, Zustand preferences/state, Lucide icons.
- Native-dialog CRUD forms, Zod validation, table sorting/resizing/visibility/pagination/selection, localStorage data services and reproducible record counts.
- Basic lead capture and conversion, record ownership assignment, pipeline drag/drop, undo, board Lost reason, task reminders and snooze, mock email send, export/reset and guided tour.

## Partial requirements

- Seven module entry points exist, but many share a generic record workspace rather than complete specialized detail experiences.
- Roles hide navigation and limit editing/scoping in key screens. Complete read-only enforcement, every role-specific report scope and permission tests are not implemented. No server authorization exists.
- Tour navigates 14 routes/targets and supports keyboard stepping. No action-required steps, per-module tours, final action links, scroll-into-view coordination or full focus trap.
- Shared UI includes Button, Modal, Badge, Avatar, SearchBox, EmptyState, DataGrid and Board. The full requested component library is not implemented. Native selects/date-time inputs remain.
- Pipeline drag/drop uses @dnd-kit/core. @dnd-kit/sortable is declared but not used. Stage moves are persisted after service latency, not fully optimistic. Probability editing is per stage; existing deal probabilities are not automatically recalculated.
- List filtering covers text/status/owner and lead source. Date and value range filters across all modules remain incomplete.
- Contact details include notes and activities, not a full three-column Contact 360, lifecycle custom-field system, or merge workflow.
- Company details list matching contacts/deals, but not a separate full company profile page.
- Task calendar is a simple forward month grid, not weekday-aligned month/week scheduling. Today/Upcoming/Overdue/Completed tabs lack individual counts.
- Notifications recompute task reminders, but have no durable read state, delivery ledger or deduplication model. The overdue toast may repeat on data writes.
- Inbox supports plain text, not rich-text-lite formatting; simulated opened status exists, but simulated replies and unified multichannel history are missing.
- Dashboard has six computed KPIs and three chart types, targets and My day. No historical delta sparklines, lead conversion funnel, team leaderboard chart or task-completion comparison chart.
- Reports has six named choices, but they currently reuse sales data/chart/table rather than six independent report calculations. Date filtering applies to sales creation dates; other chart datasets are not all filtered consistently.
- Support has record CRUD, assignment, status, priority and email/contact creation. It lacks SLA countdowns, dedicated customer/agent reply threads, internal-note treatment, canned replies, merge/escalation, workload indicators and its specialized dashboard.
- Status badges include icons, but lead sources and every individual status/priority do not yet have dedicated semantic icon/color mappings.
- Skeleton/error/empty states exist, but comprehensive mutation error handling and storage quota recovery are unfinished.

## Not implemented

- Record-level document tabs and overflow menu.
- Polished slide-over detail drawers; native dialogs are used instead.
- Full drag-and-drop animations, sortable card ordering, weighted/unweighted board switch, and Won confetti.
- Fully modular per-feature Zustand slices and comprehensive domain-specific schemas.
- TanStack Virtual (seeded datasets are below the >200-row threshold).
- Editable follow-up defaults, import sample data action, profile editing and stage color editor.
- Multi-region/multi-currency accounting or currency-aware pipeline aggregation.
- Full WCAG AA audit, screen-reader acceptance testing and browser-console verification.
- End-to-end browser tests, guaranteed zero warnings, verified npm build/lint and production-ready status.

## Dependency/version notes

Vite 6 is chosen as a compatible declared baseline, not verified as the latest Vite version. ESLint and Prettier configurations are included; a successful format/lint pass requires dependency installation. A lockfile is not included because installation failed in the offline environment.
