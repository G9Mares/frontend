# Routing

The routing skeleton declares the approved paths below. Route components are intentionally empty placeholders until their corresponding implementation task begins.

| Path | Intended workspace | Current route target |
| --- | --- | --- |
| `/` | Landing page | `RoutePlaceholderComponent` |
| `/requester_panel` | Requester workspace | `RoutePlaceholderComponent` |
| `/tickets` | Support ticket workspace | `RoutePlaceholderComponent` |
| `/history` | ADMIN audit history | `RoutePlaceholderComponent` |

Unknown paths redirect to `/`.

Authentication and role guards are not connected in this foundation task. They will be added during the approved authentication, session-validation, and authorization task; `/history` will then be restricted to `ADMIN`.
