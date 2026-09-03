---
quick_id: 260903-kmx
status: complete
completed: 2026-09-03
commit: b2cdf6a
---

# Noise intensity filter correctly scoped

Brightness and contrast now apply only to the embedded SVG turbulence texture.
The optional conic falloff moved from a painted background on the filtered
element to `mask-image`, so it controls noise opacity without being altered by
the intensity filter.

The existing pink/noise/gradient layer order and the selected `hue` background
mode plus `luminosity` mix mode were preserved. An attempted composite-wrapper
approach was discarded after visual inspection because it flattened the chosen
result to gray.

## Verification

- `PORT=3000 npm exec playwright test tests/noise-gradient.spec.ts` — 1 passed
- Test verifies filters stay on the SVG texture and the checkbox toggles `mask-image`
- Desktop Chromium screenshot inspected against the prior selected render
- `git diff --check` — passed
