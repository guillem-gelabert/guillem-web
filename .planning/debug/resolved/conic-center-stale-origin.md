---
status: resolved
trigger: "center of the gradient is still not visible or it's at the very edge of the window"
created: 2026-09-03T10:19:00+02:00
updated: 2026-09-03T10:19:41+02:00
---

# Debug Session: Conic center remains at the viewport edge

## Symptoms

- **Expected:** The visible black-to-white conic center should sit 15% from the left and 15% from the bottom.
- **Actual:** The center still appears absent or pinned to the viewport edge after the gradient-stop correction.
- **Errors:** No runtime error reported.
- **Timeline:** Persisted across two hot-reloaded edits after the gradient origin was changed from a measured boundary point to fixed CSS percentages.
- **Reproduction:** Keep the existing `/style-playground` development preview open while the edits hot reload.

## Current Focus

- **hypothesis:** Fast Refresh preserved the old inline `--seam-x` and `--seam-y` properties written by an earlier effect, and those inline values override the newer CSS Module declarations.
- **test:** Confirm the earlier component wrote both variables inline and make the CSS background consume newly named center variables that cannot be shadowed by that stale DOM state.
- **expecting:** The hot-reloaded background immediately uses `15% 85%`, placing the fan's convergence inside the viewport without requiring a manual reload.
- **next_action:** Complete — the stale variable names are no longer consumed by the gradient.
- **reasoning_checkpoint:** Git history confirms the earlier effect called `style.setProperty` for both old variable names; the current component removed the calls but did not clear already-written inline properties.
- **tdd_checkpoint:** Not applicable to this HMR-specific visual CSS correction.

## Evidence

- timestamp: 2026-09-03T10:19:00+02:00
  observation: The current stylesheet declares `--seam-x: 15%` and `--seam-y: 85%`, which are valid in-viewport coordinates.
- timestamp: 2026-09-03T10:19:00+02:00
  observation: Commit history shows the earlier mounted effect wrote pixel values to inline `--seam-x` and `--seam-y`; inline custom properties outrank class declarations and survive a Fast Refresh that preserves the DOM node.

## Eliminated

- hypothesis: The configured percentages themselves place the center outside the scene.
  reason: The scene fills the viewport and both percentages are within its 0–100% positioning range.

## Resolution

- **root_cause:** Fast Refresh preserved inline `--seam-x` and `--seam-y` values written by the previously mounted component. Removing the setters from source did not remove those values from the existing DOM node, so they continued to override the class declarations.
- **fix:** Renamed the stylesheet variables to `--gradient-center-x` and `--gradient-center-y`, which cannot be shadowed by the stale inline values and explicitly hold the requested `15% 85%` center.
- **verification:** `/style-playground` returned HTTP 200, `git diff --check` passed, and `npm run build` completed successfully.
- **files_changed:** `app/(en)/style-playground/style-playground.module.css`
- **commit:** `f23efca`
