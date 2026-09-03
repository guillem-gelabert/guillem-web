---
quick_id: 260903-khp
status: complete
completed: 2026-09-03
commit: ee82c86
---

# Noise intensity sliders added

`/noise-gradient` now exposes controlled sliders for the SVG-noise layer's
contrast and brightness:

- Contrast: 100–300%, default 150%, step 5%
- Brightness: 100–1000%, default 700%, step 25%

Both values update the CSS filter immediately and display live percentage
readouts. Grayscale remains fixed before them, ensuring intensity tuning cannot
reintroduce colored noise.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Test changes both sliders and verifies the computed filter and live values
- Desktop Chromium screenshot inspected
- `git diff --check` — passed
