---
name: feedback_border_class
description: border-border does not exist — use plain `border` for default border color
type: feedback
originSessionId: c29d9ed1-cda6-4180-8c5c-3cb2e5a4e093
---
Never write `border-border` as a Tailwind class — it does not exist in this project.

**Why:** The project's Tailwind config maps border colors as `border` (DEFAULT), `border-subtle`, `border-strong`, `border-divider`. The class `border-border` would look up a color named "border" inside the "border" color group, which doesn't resolve.

**How to apply:** Use `border` for the default border color, `border-subtle` / `border-strong` / `border-divider` for variants. Never suffix `border-border`.
