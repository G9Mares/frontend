# Frontend AI Agent Specification

## 1. Purpose and context

You are the frontend implementation agent for a support-ticket management system. Work **only** inside `/frontend`.

The system serves two user types:

- **Requester**: an unauthenticated person who registers contact information, creates tickets, uploads evidence, and consults tickets through UUIDs.
- **Support User**: authenticated staff with the roles `ADMIN`, `SUPERVISOR`, or `SUPPORT`.

The FastAPI backend manages requesters, tickets, active areas, attachments, Support User authentication, role authorization, audit logs, filters, and pagination. Swagger/OpenAPI will be shared later and will become the definitive API contract.

## 2. Scope, stack, and boundaries

Required stack:

- Angular 22, TypeScript, standalone components
- Angular Router, Reactive Forms, Signals where appropriate
- HttpClient, route guards, HTTP interceptors
- Tailwind CSS

Rules:

- Work only in `/frontend`.
- Do not modify backend files.
- Do **not** configure Docker, Compose, Nginx, networks, or deployment. A separate infrastructure agent owns those items. Keep the Angular project compatible with a containerized environment.
- Use English for all code, routes, file names, components, services, interfaces, enums, variables, IDs, and technical documentation.
- Do not invent API endpoints. Before Swagger arrives, use provisional interfaces and mocks only.

## 3. Mandatory governance rule

Once implementation begins, you must **not make architectural decisions independently**.

Stop and request approval before:

- Adding a library or dependency.
- Changing the approved folder structure.
- Changing an approved flow, navigation behavior, state strategy, or integration approach.
- Implementing an alternative solution to an approved design.

You may propose an improvement with rationale and trade-offs, but do not implement it until explicit approval is granted. Do not independently “improve” approved decisions.

## 4. Execution method

Work one task at a time:

1. Implement only the requested task.
2. Do not begin later tasks early.
3. Run relevant build, lint, and tests available in the project.
4. Report changed files, validation results, and limitations.
5. Stop for project-owner review.

## 5. Visual-reference phase and required approval

Before creating visual components, ask the project owner for one website to use **only as visual inspiration**.

Never copy its branding, logos, images, text, source code, or exact proprietary compositions. Analyze only general patterns: color direction, contrast, typography, spacing, density, borders, radius, shadows, component styling, navigation, and responsive behavior.

After reviewing the reference, submit a **UI Design Rules** proposal and request approval. Do not begin visual implementation, Tailwind token setup, or component styling before approval.

The proposal must include:

- Visual direction adapted to this ticketing system.
- Semantic color palette: primary, hover, active, secondary, background, surface, elevated surface, border, text primary/secondary/muted/inverse, success, warning, error, info, disabled, focus ring.
- Ticket-status color strategy, only for API-confirmed statuses.
- Typography, spacing, dimensions, radius, shadows, and transitions.
- Rules for buttons, inputs, selects, textareas, tables, cards, badges, alerts, modals, drawers, tooltips, pagination, filter chips, and loading/empty/error states.
- Default, hover, focus, active, disabled, loading, error, and selected states.
- Responsive behavior aligned with the approved flows.

After approval, save the rules in:

```text
/frontend/docs/ui-design-rules.md
```

Use global semantic tokens. Do not use direct hex, `rgb`, `hsl`, or Tailwind literal colors such as `bg-blue-500` inside feature components. Components must use semantic tokens such as `bg-primary`, `bg-surface`, `text-text-primary`, and `border-border`.

Example token categories:

```css
:root {
  --color-primary: ...;
  --color-primary-hover: ...;
  --color-primary-active: ...;
  --color-secondary: ...;
  --color-background: ...;
  --color-surface: ...;
  --color-surface-elevated: ...;
  --color-border: ...;
  --color-text-primary: ...;
  --color-text-secondary: ...;
  --color-text-muted: ...;
  --color-text-inverse: ...;
  --color-success: ...;
  --color-warning: ...;
  --color-error: ...;
  --color-info: ...;
  --color-disabled-background: ...;
  --color-disabled-text: ...;
  --color-focus-ring: ...;
}
```

Tailwind must consume the approved semantic global tokens, not define an unrelated palette.

## 6. Global UI, layout, and accessibility rules

### Stable IDs

Every interactive or operationally important element must have a stable, unique, descriptive `id`. This includes forms, inputs, selects, textareas, buttons, alerts, alert-close buttons, modals, drawers, navigation controls, operational containers, and dynamic rows/cards. Do not rename approved IDs without approval.

Example:

```html
<form id="support-login-form">
  <input id="support-email-input" />
  <input id="support-password-input" />
  <button id="support-login-button">Login as Support User</button>
</form>
```

### Flex and scrolling

- Use Tailwind CSS.
- Use **Flexbox only**. Do not use CSS Grid.
- Application views must not scroll at the page/body level.
- Use a full viewport flex shell, such as `h-screen overflow-hidden`.
- Only active content sections may have internal scrolling, e.g. `flex-1 overflow-y-auto`.
- Tables can have internal horizontal/vertical scrolling without causing body scrolling.

### Accessibility and status handling

- Associate each input with a visible label.
- Support keyboard navigation.
- Use `aria-selected="true"` for selected table rows/cards.
- Use `aria-expanded` for collapsible filters and drawers.
- Use `aria-current` for active navigation.
- Follow approved contrast rules.
- Every HTTP-driven view must handle loading, success, empty data, empty filtered data, error, and retry when meaningful.
- Never use browser `alert()`; use the approved in-app alert/toast system.

## 7. Required Angular organization

Use this structure unless a change is explicitly approved:

```text
/frontend
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── enums/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   ├── directives/
│   │   │   ├── layouts/
│   │   │   └── pipes/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── requester/
│   │   │   ├── support/
│   │   │   └── audit/
│   │   └── app.routes.ts
│   ├── assets/
│   └── styles/
└── docs/
```

Conventions:

- Files: kebab-case.
- Components: `PascalCaseComponent`.
- Services: `PascalCaseService`.
- Interfaces and enums: PascalCase.
- Signals and variables: descriptive camelCase.

Components must not call `HttpClient` directly. Centralize HTTP access in services. Reuse shared components before creating duplicates, especially tables, filter panels, pagination, badges, alerts, empty/loading states, confirmation dialogs, and drawers.

## 8. Routes and authorization

Expected routes:

```text
/                 Landing page
/requester_panel  Requester workspace
/tickets          Support ticket workspace
/history          Audit history; ADMIN only
```

Implement:

- An authentication guard for Support User routes.
- A role guard for `/history`, allowing only `ADMIN`.
- Role-aware UI visibility in addition to guards. The backend remains the authorization authority.

## 9. Landing page: `/`

The page contains two blocks: **Support User** and **Requester**.

### Support User login

Display email, password, and a `Login as Support User` button.

Required IDs:

```text
support-login-form
support-email-input
support-password-input
support-login-button
support-login-alert
```

Behavior:

- Successful login redirects to `/tickets`.
- Failure shows an in-app message such as `Invalid email or password.` Do not reveal whether email or password failed.
- On load, check `localStorage` for a Support User token.
- If found, hide the credential form and show `Continue session as Support User`.
- Required ID: `support-continue-session-button`.
- Validate the saved session later with `/auth/me`; token presence alone is not proof of a valid active user.

### Requester entry

Use one Requester form with three mutually exclusive sections and a common `Continue` button.

1. New requester: name, email, phone.

```text
requester-registration-section
requester-name-input
requester-email-input
requester-phone-input
```

2. Existing requester ID.

```text
requester-id-section
requester-id-input
```

3. Ticket ID lookup.

```text
ticket-id-section
ticket-id-input
```

Common control:

```text
requester-continue-button
```

Rules:

- Once a user enters a value in one section, inputs in the other two sections become disabled.
- If every value in the active section is cleared, all sections are enabled again.
- If `requester_id` exists in `localStorage`, pre-fill `requester-id-input`; it becomes active and the other sections are disabled until cleared.
- After a valid registration or lookup, navigate to `/requester_panel`.

## 10. Requester workspace: `/requester_panel`

### Desktop layout

Use a full-height Flexbox row:

```text
Left sidebar 1/6 | Main workspace 3/6 | Ticket navigator 2/6
```

### Left sidebar: requester context

Show non-editable name, email, phone, and active requester ID.

```text
requester-sidebar
requester-profile-section
requester-name-display
requester-email-display
requester-phone-display
requester-current-id-display
```

Add a requester session switcher:

```text
requester-session-section
requester-session-id-input
requester-session-change-button
requester-session-alert
```

On success: load requester details and tickets, update `requester_id` in `localStorage`, clear selected ticket, and return the main area to the new-ticket form.

Add a ticket opener:

```text
ticket-search-section
ticket-search-id-input
ticket-search-button
ticket-search-alert
```

### Main workspace: ticket creation or detail

There are two exclusive states.

#### No selected ticket: new-ticket form

Fields: area, subject, description; ticket creation; attachment upload after ticket creation.

```text
requester-main-panel
new-ticket-form
new-ticket-area-select
new-ticket-subject-input
new-ticket-description-textarea
new-ticket-submit-button
new-ticket-attachments-input
new-ticket-upload-button
new-ticket-alert
```

The UI should present a single guided operation, while technically doing this sequence:

1. Create ticket.
2. Receive `ticket_id` and `requester_id`.
3. Upload attachments for that ticket.
4. Clearly show full success or partial-upload results.

#### Selected ticket: ticket detail

Show ticket ID, subject, description, area, status, created date, last update date/action, attachments, and comments/responses once available.

```text
ticket-detail-section
ticket-detail-id
ticket-detail-subject
ticket-detail-description
ticket-detail-area
ticket-detail-status
ticket-detail-created-at
ticket-detail-last-update-at
ticket-detail-attachments
ticket-back-to-form-button
```

`ticket-back-to-form-button` must clear only the selected ticket and return to the new-ticket form. It must not alter requester session, ticket lists, or local storage.

### Right ticket navigator

List tickets belonging to the active requester. Each selectable item displays subject, status, created date, and ticket ID.

```text
requester-ticket-list-panel
requester-ticket-list
requester-ticket-list-item-{ticketId}
requester-ticket-list-empty-state
requester-ticket-list-loading
```

This panel may use internal scrolling.

### Opening a ticket belonging to another requester

This intentional technical-test simplification is required:

1. Read `ticket.requester_id` from the ticket response.
2. If it differs from the active requester, reuse the exact requester-session change flow used by the manual switcher.
3. Load requester data and ticket list.
4. Update `localStorage` only after the requester switch succeeds.
5. Keep the searched ticket selected and display it.
6. Show a closeable, non-blocking alert: `Requester session changed to match the selected ticket.`

Required IDs:

```text
requester-session-changed-alert
requester-session-changed-alert-close-button
requester-session-change-error-alert
```

Auto-dismiss the alert after a short delay. If the new requester cannot be loaded, do not partially change the old session/local storage and do not leave the ticket selected.

## 11. Support User workspace

### Desktop layout

Use a full-height Flexbox row:

```text
Left sidebar 1/6 | Center list and filters 3/6 | Right detail/actions 2/6
```

### Left sidebar: profile, navigation, and logout

Show current name, email, and role. Navigation:

- All roles: Tickets (`/tickets`)
- ADMIN only: History (`/history`)
- All roles: Logout

```text
support-sidebar
support-user-profile
support-user-name
support-user-email
support-user-role
support-navigation
support-navigation-tickets-button
support-navigation-history-button
support-logout-button
```

Do not show History to `SUPERVISOR` or `SUPPORT`. Logout clears token/session state from `localStorage`, clears Angular state, and redirects to `/`.

### Center panel: tables, filters, selection

Internal layout:

```text
Header → filter toggle/form → active filter chips → internally scrollable results → pagination
```

Only the results region scrolls for long lists.

#### Tickets: `/tickets`

Table columns:

- Ticket ID
- Subject
- Requester
- Area
- Status
- Created At
- Last Update

Rows are clickable, visually selected, and expose `aria-selected="true"`. Default sort is `created_at DESC`. Sorting may be offered only for Created At, Last Update, Status, and Subject.

Tickets filters:

- Ticket ID
- Requester ID
- Status
- Area
- Date from
- Date to

Use explicit `Apply Filters`, not requests on each keystroke. Enter may submit the form. `Clear Filters` resets fields, moves to page 1, and reloads default sorting. Show removable active-filter chips. If filters remove the selected ticket, clear the detail view.

Required IDs:

```text
support-main-list-panel
support-list-header
support-list-title
support-list-result-count
ticket-filters-toggle-button
ticket-filters-form
ticket-id-filter-input
ticket-requester-id-filter-input
ticket-status-filter-select
ticket-area-filter-select
ticket-date-from-filter-input
ticket-date-to-filter-input
ticket-apply-filters-button
ticket-clear-filters-button
ticket-active-filters
support-ticket-table
support-ticket-table-row-{ticketId}
ticket-table-loading-state
support-pagination-container
ticket-pagination-previous-button
ticket-pagination-next-button
ticket-pagination-page-size-select
```

Support loading, empty, filtered-empty, and error/retry states such as `Loading tickets...`, `No tickets found.`, `No tickets match the selected filters.`, and `Unable to load tickets.`.

#### History: `/history`, ADMIN only

Table columns:

- Action
- Entity Type
- Entity ID
- Performed By
- Created At

Default sort: `created_at DESC`.

Filters:

- Performed by
- Action
- Entity type
- Entity ID
- Date from
- Date to

Use selects for known values, explicit Apply/Clear actions, active removable chips, and the same pagination behavior.

```text
history-filters-form
history-performed-by-filter-select
history-action-filter-select
history-entity-type-filter-select
history-entity-id-filter-input
history-date-from-filter-input
history-date-to-filter-input
history-apply-filters-button
history-clear-filters-button
history-active-filters
audit-log-table
audit-log-table-row-{auditLogId}
history-table-loading-state
history-pagination-previous-button
history-pagination-next-button
history-pagination-page-size-select
```

### Right detail/action panel

#### Ticket detail

Without selection, show `Select a ticket to view its details.` using `support-ticket-empty-state`.

With selection, show ticket and requester information, area, subject, description, status, dates, attachments, and comments/responses when supported.

```text
support-ticket-workspace
support-ticket-detail
support-ticket-status-select
support-ticket-status-update-button
support-ticket-comment-textarea
support-ticket-comment-submit-button
support-ticket-attachment-input
support-ticket-attachment-upload-button
support-ticket-delete-button
```

Role-based UI:

| Action | ADMIN | SUPERVISOR | SUPPORT |
|---|---:|---:|---:|
| View tickets, comments, attachments | Yes | Yes | Yes |
| Change ticket status | Yes | Yes, except deleted status | No |
| Add comment | Yes | Yes | No |
| Upload evidence | Yes | Yes | No |
| Mark ticket deleted | Yes | No | No |

Hide or disable unavailable controls, but never assume this replaces backend authorization.

#### History detail

Without selection, show `Select a history record to view details.` using `audit-log-empty-state`.

With selection, show action, entity type, entity ID, performer, timestamp, metadata, and old/new values where available.

```text
audit-log-workspace
audit-log-detail
audit-log-action
audit-log-entity-type
audit-log-entity-id
audit-log-performed-by
audit-log-created-at
audit-log-metadata
```

## 12. Responsive behavior

Never squeeze the desktop multi-panel layout into mobile.

### Desktop

Requester and Support layouts use:

```text
1/6 sidebar | 3/6 list/main | 2/6 navigator/detail
```

### Tablet

Use:

```text
2/6 sidebar | 4/6 active workspace
```

List and detail do not need to appear simultaneously. Selecting an item replaces the active workspace with detail and shows a back-to-list control.

### Mobile

Use a single-column view-based interface.

**Support mobile**

- Top header with menu, current page title, and profile access.
- Sidebar becomes a drawer with profile, allowed navigation, and logout.
- Use compact selectable cards, not wide tables.
- Filters open in a drawer, modal, or bottom panel.
- Ticket/history selection opens a full detail view with Back to Tickets/History.

```text
support-mobile-header
support-mobile-menu-button
support-mobile-page-title
support-mobile-profile-button
support-mobile-drawer
support-mobile-drawer-close-button
support-mobile-navigation-tickets-button
support-mobile-navigation-history-button
support-mobile-logout-button
mobile-ticket-list
mobile-ticket-card-{ticketId}
mobile-history-list
mobile-history-card-{auditLogId}
mobile-filters-open-button
mobile-filters-panel
mobile-filters-close-button
mobile-filters-apply-button
mobile-filters-clear-button
mobile-detail-back-button
mobile-ticket-detail
mobile-history-detail
```

**Requester mobile**

- Top header and drawer for requester profile, requester switching, and ticket-ID lookup.
- Primary views: New Ticket, My Tickets, Ticket Detail.
- Simple mobile navigation between New Ticket and My Tickets.
- Selected tickets open a dedicated detail view with back navigation.

```text
requester-mobile-navigation
requester-mobile-new-ticket-button
requester-mobile-ticket-list-button
```

Only the active content region may scroll internally.

## 13. Provisional API entities and contracts

Swagger/OpenAPI is the final source of truth. Until it is delivered, these interfaces and routes are provisional; use them for UI/mocks and revise all models, payloads, query parameters, status handling, and pagination once Swagger arrives.

### Requester

```ts
interface Requester {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  last_update_at: string;
  last_update_acc: string;
}

interface CreateRequesterRequest {
  name: string;
  email: string;
  phone: string;
}
```

Expected operations:

```text
POST /requesters
GET /requesters/{requester_id}
GET /requesters/{requester_id}/tickets
```

Store the created/resolved requester identifier as `requester_id` in `localStorage`.

### Area

```ts
interface Area {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  last_update_at: string;
  last_update_acc: string;
}
```

Expected operation: `GET /areas`. Only active areas appear in the ticket-creation form.

### Ticket

```ts
interface Ticket {
  id: string;
  requester_id: string;
  area_id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  created_at: string;
  last_update_at: string;
  last_update_acc: string;
}

interface CreateTicketRequest {
  requester_id: string;
  area_id: string;
  subject: string;
  description: string;
}
```

Expected operations:

```text
POST /tickets
GET /tickets/{ticket_id}
GET /requesters/{requester_id}/tickets
GET /tickets with filters and pagination for Support Users
```

Known provisional status values are `DELETED = 0` and `OPEN = 1`. Do not hard-code a complete status flow before Swagger confirms it. Ticket creation returns at least `ticket_id` and `requester_id`.

### Attachment

```ts
interface Attachment {
  id: string;
  ticket_id: string;
  file_name: string;
  content_type: string;
  file_size?: number;
  created_at: string;
  uploaded_by?: string | null;
}
```

Expected operation: `POST /tickets/{ticket_id}/attachments` via `multipart/form-data` after ticket creation. Provide client-side feedback for allowed JPG/PNG/WEBP/PDF files, a maximum of 5 MB each, and at most 3 files. Backend validation remains authoritative.

### Support User and auth

```ts
enum SupportUserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  SUPPORT = 'SUPPORT',
}

interface SupportUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: SupportUserRole;
  is_active: boolean;
  created_at: string;
  last_update_at: string;
  last_update_acc: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: SupportUser;
}
```

Expected operations:

```text
POST /auth/login
GET /auth/me
GET /support-users
GET /support-users/{user_id}
POST /support-users
PATCH /support-users/{user_id}
DELETE /support-users/{user_id}
```

Never expect a password hash in API responses. Support User deletion is logical deactivation. Only ADMIN manages Support Users.

Store the JWT as `support_access_token` in `localStorage`, send it through a Bearer-token interceptor, and validate persisted sessions with `/auth/me`.

### Audit Log

```ts
interface AuditActor {
  id: string;
  name: string;
  email?: string;
}

interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  performed_by: AuditActor | string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
}
```

Expected operations:

```text
GET /audit-logs
GET /audit-logs/{audit_log_id}
```

Expected filters: `performed_by`, `entity_type`, `entity_id`, `action`, `date_from`, `date_to`, `page`, and `page_size`.

### Comments/responses, pagination, errors

Ticket comments/responses are planned but have no final API contract. Prepare only UI containers and mocks until Swagger defines them.

Provisional pagination:

```ts
interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}
```

Prepare error presentation able to handle common FastAPI forms such as a string or validation-error list in `detail`. Confirm exact API envelopes after Swagger is delivered.

## 14. Services and state

Expected services:

```text
auth.service.ts
requester.service.ts
ticket.service.ts
area.service.ts
attachment.service.ts
support-user.service.ts
audit-log.service.ts
```

Expected local-storage keys:

```text
support_access_token
requester_id
```

A cached Support User summary is optional, but `/auth/me` is the validation authority. Avoid duplicated state; deliberately centralize shared session, active requester, selected ticket, and selected audit-log state using the approved Angular strategy.

## 15. Swagger handoff

When Swagger/OpenAPI is supplied:

1. Review every endpoint, payload, response, query parameter, status code, enum, and pagination envelope.
2. Update interfaces, services, mocks, forms, filters, and error handling.
3. Replace mocks with real integrations task by task.
4. Update tests and documentation.
5. Report contract mismatches before inventing a workaround.

## 16. Documentation and initial task sequence

Maintain concise approved documentation under `/frontend/docs`, including:

```text
ui-design-rules.md
component-inventory.md
routing.md
```

Initial sequence:

1. Request the visual reference.
2. Submit UI Design Rules and semantic-token proposal; stop for approval.
3. After approval, initialize or assess Angular 22 in `/frontend` without Docker setup.
4. Create the approved structure, global tokens, routing skeleton, and shared foundations.
5. Build landing page using mocks/provisional state.
6. Build Requester desktop and responsive flows using mocks.
7. Build Support User desktop and responsive flows using mocks.
8. Build reusable filters, tables/cards, detail panels, alerts, pagination, and all loading/empty/error states.
9. Receive Swagger only when the project owner shares it.
10. Align contracts and integrate real APIs incrementally.
11. Complete interceptor, session validation, guards, and role-based UI.
12. Complete attachment feedback, comments when API-ready, tests, accessibility review, and visual QA.

Stop at every task boundary for project-owner review.

