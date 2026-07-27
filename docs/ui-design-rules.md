# UI Design Rules

## Reference and direction

Discord is used only as high-level visual inspiration. This application does not reuse Discord branding, logos, text, imagery, source code, or exact compositions.

The ticketing system uses a professional dark operational workspace: blue-gray surfaces, clear panel hierarchy, compact but readable density, and distinct interaction states. An original indigo accent identifies primary actions and selection.

## Semantic color tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `primary` | `#6276E8` | Primary actions, links, selection |
| `primary-hover` | `#7588F2` | Primary-action hover |
| `primary-active` | `#4E60CE` | Primary-action active state |
| `secondary` | `#303846` | Secondary actions and interactive surfaces |
| `background` | `#161A22` | Application background |
| `surface` | `#1E2430` | Main panels |
| `surface-elevated` | `#282F3D` | Cards, forms, menus, and overlays |
| `border` | `#3A4353` | Borders and separators |
| `text-primary` | `#F2F5F9` | Main text |
| `text-secondary` | `#BEC8D6` | Labels and metadata |
| `text-muted` | `#8793A5` | Supporting information |
| `text-inverse` | `#10141B` | Text on light backgrounds |
| `success` | `#42B884` | Successful operations and `OPEN` tickets |
| `warning` | `#E5A94D` | Warnings and partial results |
| `error` | `#E0616C` | Errors and `DELETED` tickets |
| `info` | `#55A6E9` | Informational messages |
| `disabled-background` | `#252B36` | Disabled-control backgrounds |
| `disabled-text` | `#677384` | Disabled-control text |
| `focus-ring` | `#9AA8FF` | Keyboard focus indicator |

Only API-confirmed ticket statuses receive status colors. The provisional mapping is `OPEN` to success and `DELETED` to error. No other status flow or status colors may be added before Swagger confirms them.

## Typography, spacing, and motion

- Use a system sans-serif font stack.
- Use 14 px base text, 16 px emphasized body text, 20-24 px panel headings, and 28-32 px page headings.
- Use a 4 px spacing scale, favoring 8, 12, 16, 20, 24, and 32 px values.
- Use 16 px panel padding and 12-16 px spacing between form controls and table content.
- Use 6 px radii for controls, 8 px for cards, and 10 px for modals and drawers.
- Use subtle shadows only for floating elements.
- Animate color, border, and opacity changes over 150-200 ms.

## Component behavior

- Buttons: solid primary, elevated-surface secondary, and danger only for destructive operations. Support default, hover, active, keyboard focus, disabled, and loading states.
- Inputs, selects, and textareas: visible labels, elevated surfaces, semantic borders, visible focus rings, and validation messages below the field.
- Tables: compact rows, subtle hover feedback, and selected rows with primary accent and `aria-selected`.
- Mobile cards: provide the same selection and status signals as desktop table rows.
- Badges: use state-derived semantic backgrounds with high-contrast text.
- Alerts and toasts: non-blocking, closeable, and available in success, warning, error, and info variants.
- Modals, drawers, and filter panels: elevated surface, subtle backdrop, clear close controls, and required ARIA state.
- Pagination and filter chips: compact controls with sufficient interactive target size; chips are removable.
- Loading, empty, filtered-empty, and error states: clear message, neutral original iconography, and retry action where useful.

## Layout and responsive rules

- Use full-viewport Flexbox shells. The `html`, `body`, application root, and application shell must never scroll.
- Never use page-level scrolling. When content exceeds its available space, apply `min-h-0` and `overflow-y-auto` only to the explicitly named active content container that owns the overflow.
- In a flex layout, every parent between the viewport shell and a scrollable child must preserve a constrained height. A scrollable flex child must use `min-h-0`; otherwise its content can force page-level overflow.
- Panels that can contain long forms, tables, cards, or details must own their own vertical scrolling. Tables may additionally own horizontal scrolling.
- Desktop requester and support workspaces use the approved `1/6 | 3/6 | 2/6` three-panel layout.
- Tablet uses `2/6 | 4/6`; selecting a record replaces the list with detail and exposes a return control.
- Mobile uses a single active view, compact header, drawers for navigation and filters, selectable cards, and explicit back navigation from detail.
- Desktop layouts are never squeezed into mobile widths.

## Token usage rule

Tailwind configuration must consume these semantic global tokens. Feature components must use semantic utilities such as `bg-primary`, `bg-surface`, `text-text-primary`, and `border-border`; they must not use literal color utilities or direct color values.
