# Support Users Management Module

## Route and Access

- Add the `/support-users` route.
- This route must be available only to users with the `ADMIN` role.
- The route must be protected by the role guard in addition to being hidden from non-admin navigation.

## Desktop Layout

Use the same application structure used by the other Support User modules:

```text
1/6 | 3/6 | 2/6
Sidebar | Users table, filters, and selection | Details and actions
```

- Build the layout using Flexbox only; do not use CSS Grid.
- The page itself must not scroll. Any necessary scrolling must be contained within the relevant panel.

## Sidebar (1/6)

Keep the existing Support User profile information and navigation. For `ADMIN` users, add:

- `Support Users` navigation item linking to `/support-users`.
- `Tickets`.
- `History`.
- `Logout`.

The `Support Users` navigation item must not be visible to `SUPERVISOR` or `SUPPORT` users.

## Users List and Filters (3/6)

The central panel is dedicated to listing, filtering, and selecting Support Users.

### Header

- Title: `Support Users`.
- Display the total number of users when available.

### Filters

Provide a collapsible filter panel with:

- Name.
- Email.
- Role.
- Status (`ACTIVE` or `INACTIVE`).
- `Apply Filters` button.
- `Clear Filters` button.

Filters should be applied only when the user selects `Apply Filters` or submits the form. Do not make a request on every keystroke.

### Table

Show Support Users in a selectable table with these columns:

- Name.
- Email.
- Phone.
- Role.
- Status.
- Created At.

Rules:

- Do not show the UUID in the table; show it only in the selected-user details panel.
- Use visual badges for role and status.
- The entire row must be selectable.
- The selected row must have a clear visual state.
- Default ordering: `name ASC`.
- Include loading, empty, no-results, error, retry, and pagination states consistent with the Tickets and History modules.

## Right Panel: Create Mode and Selected User Mode (2/6)

The right panel has exactly two mutually exclusive states.

### Create Support User Mode

When no Support User is selected, show the Create Support User form directly in the right panel. Do not use a drawer.

Fields:

- Name.
- Email.
- Phone.
- Password.
- Confirm Password.
- Role.

Rules:

- An admin may create only `SUPERVISOR` and `SUPPORT` users; `ADMIN` must not be available as a creation option.
- Validate required fields, email format, matching passwords, and password rules defined by the API contract.
- Handle duplicate-email errors through the shared notification system.
- After a successful creation, refresh the users table and select the newly created user when the API response allows it.
- If the form contains unsaved changes, require confirmation before discarding them due to navigation or selection changes.

### Selected User Mode

When a user is selected from the table, replace the creation form with a detail and administration panel.

Show:

- Name.
- Email.
- Phone.
- Role.
- Status.
- Created At.
- Last Update At.
- Last Update Action.
- User ID.

Provide a `Clear Selection` button. When selected:

- Clear the selected user.
- Return the right panel to Create Support User mode.
- Keep the table, filters, and pagination state unchanged.

## Role and Status Administration

The selected-user panel must present administrative actions explicitly instead of editing values immediately.

### Change Role

- Show the current role.
- Provide a `Change Role` action.
- Open a confirmation dialog before sending the update.
- The confirmation must clearly state that the selected user's role will change.
- Refresh the selected user details and table row after success.

### Activate or Deactivate User

- Show the current status.
- Provide an explicit `Activate User` or `Deactivate User` action, as appropriate.
- Do not label this action as deletion.
- Require confirmation before changing status because it affects access to the system.
- Refresh the selected user details and table row after success.

### Self-administration Safeguards

- An admin must not be able to deactivate their own account from this interface.
- An admin must not be able to change their own role from this interface.
- The UI must hide or disable these actions for the currently authenticated admin.
- The backend remains the final authority for these restrictions.

## Responsive Behavior

Follow the approved responsive behavior used by the rest of the Support User application.

### Desktop

Show the three panels simultaneously:

```text
Sidebar | Users table and filters | Create form or selected-user details
```

### Tablet

- Keep the sidebar and one active workspace.
- Show either the list or the detail/create workspace at a time.
- When navigating from the list to details, provide a clear `Back to List` action.

### Mobile

- Use a single-column flow.
- Replace the fixed sidebar with the existing mobile navigation drawer.
- Show Support Users as compact selectable cards instead of a wide table.
- Use a dedicated create view when no user is selected.
- Show selected-user details and actions as a full active view with a clear back action.
- Keep filters in the approved mobile filters panel.

## Consistency Rules

- Keep the same visual language, tokens, component rules, alerts, confirmation dialogs, loading states, empty states, error states, and pagination patterns used by Tickets and History.
- The center panel is for search, filters, listing, and selection. The right panel is for creation, details, and actions for the selected item.
- All interactive elements, including forms, fields, buttons, dialogs, alerts, and relevant selectable containers, must have stable, descriptive `id` attributes.
- Use Tailwind CSS with approved global semantic design tokens. Do not hardcode colors in components.
- Reuse shared components whenever possible; do not duplicate table, filter, badge, modal, alert, empty-state, loading-state, or pagination implementations.
- Do not introduce new dependencies, alter the approved folder structure, modify approved flows, or make architectural changes without explicit approval.
