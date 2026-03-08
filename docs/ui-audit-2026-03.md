# Tabby Finance UI Audit

Date: 2026-03-08

Scope: static review of the current Expo mobile UI, with emphasis on readability, touch ergonomics, error handling, and consistency with the existing style guide.

## Summary

The visual direction is coherent and already feels appropriate for a finance product. The main gaps are practical mobile concerns rather than aesthetics: a few semantic surfaces miss accessible contrast targets, some secondary actions are undersized for touch, auth errors rely on modal alerts instead of inline guidance, and safe-area handling is still hard-coded.

## Priority Findings

### 1. Safe-area handling is not implemented across screen roots

Impact: Hero content and the floating tab bar rely on fixed top and bottom spacing, which can crowd the notch or home indicator on modern phones.

References:
- `app/_layout.tsx`
- `app/(app)/(tabs)/_layout.tsx`
- `components/ui/auth-shell.tsx`
- `app/(app)/(tabs)/profile.tsx`
- `app/(app)/(tabs)/index.tsx`
- `app/(app)/accounts/[id].tsx`

Recommendation:
- Wrap the app with safe-area primitives and derive top and bottom spacing from insets.
- Update the floating tab bar offset and scroll container bottom padding together so content does not disappear behind navigation.

### 2. Warning and danger surfaces miss AA contrast for small text

Impact: Pending badges, inline error cards, and destructive actions are harder to scan than the rest of the UI. This is most visible on small semantic labels.

Examples:
- Pending badge on transaction rows.
- Error cards on account and transaction screens.
- Sign-out button text on the profile screen.

Measured token pairs:
- `tabby.warning` on `tabby.warning-soft`: about `4.15:1`
- `tabby.danger` on `tabby.danger-soft`: about `4.00:1`

Recommendation:
- Introduce darker warning and danger foreground tokens for text and icon use on soft backgrounds.
- Keep the current soft fills, but stop reusing the same foreground colors for both light and dark semantic contexts.

### 3. Secondary auth actions are below the recommended touch target

Impact: The sign-in and sign-up cross-links are visually clear but physically small, which hurts one-handed use and accessibility.

References:
- `app/(auth)/login.tsx`
- `app/(auth)/signup.tsx`

Recommendation:
- Convert these links into padded secondary buttons or add explicit vertical padding and hit slop.
- Keep the quieter visual treatment, but make the entire row tappable at `44px` minimum height.

### 4. Auth validation and API failures rely on transient alerts instead of inline feedback

Impact: Alerts interrupt flow, disappear after dismissal, and force users to remember what needs correction. This is especially weak for sign-up validation.

References:
- `app/(auth)/login.tsx`
- `app/(auth)/signup.tsx`
- `components/ui/form-field.tsx`

Recommendation:
- Add inline error copy beneath the relevant field or above the primary action.
- Preserve server errors on screen until the next edit or submission.
- Reserve alerts for exceptional failures rather than standard validation.

### 5. The product claims thumb-friendly controls, but filter chips currently sit below the stated minimum

Impact: The transaction filter control is usable, but it does not meet the documented `44px` minimum target in the style guide.

References:
- `docs/style-guide.md`
- `app/(app)/accounts/[id].tsx`
- `app/(app)/(tabs)/profile.tsx`

Recommendation:
- Raise chip height to the documented minimum and align all pill-style controls to one shared touch-target standard.

## Engineering Follow-up

Recommended implementation work:
- Add safe-area-aware layout primitives and apply them to auth, tab, and detail screens.
- Introduce accessible semantic foreground tokens for warning and danger content.
- Rework auth form feedback and secondary navigation affordances to meet mobile interaction guidance.
