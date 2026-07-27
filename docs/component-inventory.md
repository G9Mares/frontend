# Component Inventory

| Component | Location | Responsibility | Status |
| --- | --- | --- | --- |
| `App` | `src/app/app.ts` | Full-viewport application shell and route outlet | Foundation |
| `RoutePlaceholderComponent` | `src/app/shared/components/route-placeholder` | Empty route target used until feature tasks begin | Foundation |
| `LandingPageComponent` | `src/app/features/auth/landing-page` | Support User sign-in and Requester entry flows using provisional mocks | Implemented with mocks |
| `RequesterWorkspaceComponent` | `src/app/features/requester/requester-workspace` | Requester profile, session switching, ticket creation, ticket lookup, details, and attachments using provisional mocks | Implemented with mocks |
| `SupportWorkspaceComponent` | `src/app/features/support/support-workspace` | Support ticket operations and ADMIN audit-history workspace using provisional mocks | Implemented with mocks |

Feature components, layouts, reusable controls, and route guards will be added only in their respective approved tasks.
