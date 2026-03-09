# Tabby Finance Style Guide

This guide documents the mobile UI direction used in the current Expo mockup.

## Design Goals

- Trust over novelty: keep financial information calm, legible, and direct.
- Mobile-first hierarchy: primary balances first, supporting metadata second.
- Consistency through reusable cards, badges, and section spacing.
- Clear status signaling for synced, pending, positive, and negative states.

## Color System

| Token | Hex | Use |
| --- | --- | --- |
| `tabby.canvas` | `#f4efe6` | App background |
| `tabby.paper` | `#fffaf2` | Cards and floating surfaces |
| `tabby.cloud` | `#edf1eb` | Quiet secondary chips |
| `tabby.ink` | `#13261e` | Hero cards, primary text |
| `tabby.ink-muted` | `#365247` | Supporting dark copy |
| `tabby.muted` | `#67756d` | Secondary labels and helper text |
| `tabby.line` | `#d8ded5` | Borders and dividers |
| `tabby.accent` | `#245c4a` | Primary actions and active states |
| `tabby.accent-soft` | `#dce8df` | Soft accent badges |
| `tabby.positive` | `#2e7d57` | Positive balances and inflows |
| `tabby.warning` | `#8f6a2a` | Pending states |
| `tabby.warning-strong` | `#876221` | Warning text and icons on `tabby.warning-soft` |
| `tabby.danger` | `#b65245` | Errors and outflows |
| `tabby.danger-strong` | `#a5483c` | Error text and icons on `tabby.danger-soft` |

## Typography

- Hero totals: `text-4xl`, semibold, used only once per screen.
- Section titles: `text-2xl` or `text-xl`, semibold.
- Body copy: `text-sm` to `text-base` with generous line height.
- Eyebrow labels: uppercase, tracked, small, muted for quick scanning.

## Spacing and Layout

- Outer page padding: `20px`.
- Major vertical rhythm: `20px` to `24px` between sections.
- Card radius: `28px` to `32px`.
- Buttons and chips: minimum `44px` tall for comfortable touch targets.
- Floating tab bar leaves extra bottom padding in scroll containers.
- Respect device safe-area insets on every screen edge. Top hero sections and bottom navigation should never rely on fixed padding alone.

## Component Patterns

### Hero card

- Use `tabby.ink` background with soft circular overlays.
- Reserve for one summary per screen: total balance, account identity, or user identity.
- Pair large numeric content with a short explanatory sentence.

### Standard card

- Use `tabby.paper` with `tabby.line` border and soft shadow.
- Keep one clear action or information cluster per card.

### Status badge

- Synced: `tabby.accent-soft`
- Pending: `tabby.warning-soft` with `tabby.warning-strong` foreground
- Positive: `tabby.positive-soft`
- Negative or error: `tabby.danger-soft` with `tabby.danger-strong` foreground

### Forms

- Always show explicit field labels.
- Use high-contrast text and soft neutral field backgrounds.
- Keep helper copy concise and directly below the primary action when needed.

## Interaction Rules

- Pull-to-refresh is the primary sync gesture on balance and activity lists.
- Tabs should stay short, stable, and icon-supported.
- Empty states explain what will appear next rather than blaming the user.
- Error messaging should be inline and readable without blocking the rest of the screen.

## Accessibility Rules

- Body copy, labels, badges, and helper text must meet at least `4.5:1` contrast against their surface.
- Large numeric totals and decorative icons may drop to `3:1` only when they are not the sole carrier of meaning.
- Text-only navigation affordances still need a `44x44` touch target through padding or hit slop.
- Validation should appear inline near the relevant field or action. System alerts can supplement, but should not be the only error state.

## Review Notes

- Warning and danger text should use the stronger semantic foreground tokens when rendered on soft semantic backgrounds.
- Floating navigation and scroll containers should derive bottom spacing from safe-area insets instead of hard-coded values.
- Secondary auth navigation should be styled as a tappable control, not only as linked text.
