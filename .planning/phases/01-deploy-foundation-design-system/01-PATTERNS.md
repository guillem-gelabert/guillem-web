# Phase 1: Deploy Foundation & Design System - Pattern Map

**Mapped:** 2026-08-29
**Files analyzed:** 20 (created/modified) + 3 (deleted)
**Analogs found:** 3 / 20 (strong analog: the trail port). Everything else is greenfield — see "No Analog Found."

## Ground Truth on Repo State

Confirmed directly (`ls -la` at repo root, 2026-08-29): no `package.json`, no `app/`, no `src/`, no `node_modules/`. The only pre-existing artifacts are `Dockerfile`, `nginx.conf.template`, `prototype-stack.html` (all three scheduled for deletion — D-08/BUILD-02), `text_trail_demo/index.html` + `text_trail_demo/assets/Humane-VF.ttf` (the benchmark being ported), and markdown docs. There is no prior Next.js/React/TypeScript code in this repository. This flips the usual pattern-mapping job: for nearly every new file, the honest answer is "no in-repo analog," and the one file that matters — the trail port — gets the full extraction below.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|-----------------|---------------|
| `package.json` | config | — | none | no analog — greenfield |
| `next.config.ts` | config | — | none | no analog — greenfield |
| `postcss.config.mjs` | config | — | none | no analog — greenfield |
| `tsconfig.json` | config | — | none | no analog — greenfield |
| `app/layout.tsx` | route (root layout) | request-response | none | no analog — greenfield |
| `app/page.tsx` | route/component | request-response | `prototype-stack.html` (dead, being deleted) | no analog — different stack (Kumbh Sans, CSS scroll-timeline), not portable |
| `app/type/page.tsx` | route/component | request-response | none | no analog — greenfield |
| `app/globals.css` | config/stylesheet | — | `text_trail_demo/index.html` `<style>` block (`:8-99`) | partial — CSS values/tokens worth carrying, not a file-shape analog |
| `app/fonts/humane.ts` | config (font loader) | — | `text_trail_demo/index.html` `@font-face` decl. (`:8-14`) | partial — informs axis/family values only; `next/font/local` is a different mechanism |
| `app/fonts/newsreader.ts` (or colocated in layout) | config (font loader) | — | none | no analog — greenfield (Google Font, no local precedent) |
| `app/fonts/Humane-VF.ttf` | asset | file-I/O (move, not code) | `text_trail_demo/assets/Humane-VF.ttf` | exact — same binary, relocated, not modified (D-01) |
| `components/smear-heading/smear-heading-provider.tsx` | provider (Client Component) | event-driven | `text_trail_demo/index.html` `createTextShadowEffect` (`:648-688`) + shared driver `frame()`/`start()`/`resize()` (`:817-881`) | **port source — the load-bearing analog of this phase** |
| `components/smear-heading/use-smear-heading.ts` | hook | event-driven | `text_trail_demo/index.html` `layout(reset)` per-effect method (`:656-661`) + registration lifecycle (`activateApproach`, `:956-1003`) | port source (generalized from single-instance to registry) |
| `components/smear-heading/use-prefers-reduced-motion.ts` | hook | event-driven | `text_trail_demo/index.html` `reducedMotion` matcher + `change` listener (`:328`, `:1066`) | port source (near-verbatim) |
| `playwright.config.ts` | config (test) | — | none | no analog — greenfield |
| `tests/deploy-smoke.spec.ts` | test | request-response | none | no analog — greenfield |
| `tests/viewport.spec.ts` | test | request-response | none | no analog — greenfield |
| `tests/reduced-motion.spec.ts` | test | event-driven | none | no analog — greenfield |
| `tests/font-cls.spec.ts` | test | request-response | none | no analog — greenfield |
| `tests/type-specimen.spec.ts` | test | request-response | none | no analog — greenfield |
| `tests/smear-heading.spec.ts` | test | event-driven | none | no analog — greenfield |

### Deletions (not classified — no pattern to extract, just remove)

| File | Action | Reason |
|------|--------|--------|
| `Dockerfile` | delete | Overrides Railway's Railpack builder; D-08/Pitfall 1, first task of the phase |
| `nginx.conf.template` | delete | Obsolete once `Dockerfile` is gone |
| `prototype-stack.html` | delete | Dead static prototype the `Dockerfile` shipped; nothing references it after `Dockerfile` is gone |

---

## Pattern Assignments

### `components/smear-heading/smear-heading-provider.tsx` (provider, event-driven) — THE PORT

**Analog:** `text_trail_demo/index.html`, `createTextShadowEffect` (`:648-688`) + shared driver `frame()` (`:827-874`), `start()` (`:876-881`), `resize()` (`:817-825`).

**Core draw pattern to port** (`:648-688`, exact source, then adapt per required deviation below):
```js
function createTextShadowEffect() {
  const heading = document.querySelector('#shadow-heading');
  return {
    heading,
    ready: false,
    lagY: 0,
    documentTop: 0,

    layout(reset) {
      const rect = heading.getBoundingClientRect();
      this.documentTop = rect.top + scrollY;
      if (reset) this.lagY = rect.top;
      this.ready = true;
    },

    draw(targetY, trailY, strength, color) {
      const difference = trailY - targetY;
      const distance = Math.abs(difference);
      if (strength <= 0) {
        heading.style.textShadow = 'none';
        return;
      }

      const layers = Math.min(
        MAX_SHADOWS,
        Math.max(2, Math.ceil(distance * 2))
      );
      const shadows = [];
      for (let index = layers; index >= 1; index--) {
        const t = index / layers;
        shadows.push(`0 ${difference * t}px 0 ${color.css}`);
      }
      heading.style.textShadow = shadows.join(',');
    },

    destroy() {
      this.ready = false;
      heading.style.textShadow = 'none';
    }
  };
}
```
**Required deviation (UI-SPEC "Motion & Heading Trail Contract"):** replace `color.css` (fed by the demo's `trailColor()` hue-cycling, `:368-390`) with the fixed literal `'#171714'`. Do not port `trailColor()`, `HUE_SPEED`, or `trailHue` at all — they exist only to visually distinguish the three benchmarked techniques and directly contradict the "earned motion, not ornament" brief.

**Shared rAF driver to port and generalize** (`:827-874`, single-`activeEffect` version — the provider must iterate a registry instead of one `activeEffect`):
```js
function frame(time) {
  const elapsed = Math.min(time - (previousTime || time), 40);
  const smoothing = 1 - Math.exp(-elapsed * 0.009);
  if (!activeEffect?.ready) return;

  const targetY = activeEffect.documentTop - scrollY;
  if (!inputHeld) activeEffect.lagY += (targetY - activeEffect.lagY) * smoothing;
  activeEffect.lagY = targetY + Math.max(-MAX_TRAIL, Math.min(MAX_TRAIL, activeEffect.lagY - targetY));

  const distance = Math.abs(activeEffect.lagY - targetY);
  const strength = Math.min(1, distance / 3);
  activeEffect.draw(targetY, activeEffect.lagY, strength, color);
  previousTime = time;

  if (inputHeld) { animationFrame = 0; previousTime = 0; return; }

  if (distance > 0.15) {
    animationFrame = requestAnimationFrame(frame);
  } else {
    activeEffect.lagY = activeEffect.documentTop - scrollY;
    activeEffect.draw(activeEffect.lagY, activeEffect.lagY, 0, color);
    animationFrame = 0;
    previousTime = 0;
  }
}

function start() {
  if (reducedMotion.matches || animationFrame || !activeEffect?.ready) return;
  previousTime = 0;
  animationFrame = requestAnimationFrame(frame);
}
```
**Generalization required (RESEARCH.md Architecture Pattern 3, not present in the source as-is):** the benchmark drives exactly one `activeEffect` (a tab-switcher UI). The provider must instead hold a `registry: Map<HTMLElement, { documentTop: number; lagY: number }>` and have `frame()` loop `for (const [el, state] of registry)`, running the same per-element math and `el.style.textShadow` write for each registered heading, with the loop still scheduling only **one** shared `requestAnimationFrame` call regardless of registry size (Pitfall 4).

**Reduced-motion gate — port near-verbatim** (`:328`, `:1066`):
```js
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
// ...
reducedMotion.addEventListener('change', () => resize(true));
```
Combined with `start()`'s early return above, this is the entire BUILD-05 answer — checked before any frame is ever scheduled, and re-checked live via the `change` listener (Pitfall 6), not just once at mount.

**Font-ready gate before first measurement** (`:1067`):
```js
document.fonts.ready.then(() => activateApproach('shader'));
```
Port the intent, not the call: only run the initial `layout()`/`getBoundingClientRect()` measurement after `document.fonts.ready` resolves (in addition to waiting for mount), so the first `documentTop` isn't measured against a fallback-font layout.

**Direct DOM write — never through React state** (`:680`, `heading.style.textShadow = shadows.join(',')`):
The original writes the style property directly on the DOM node, not through a framework re-render. The port must do the same via a ref (`headingRef.current.style.textShadow = ...`) inside the rAF callback — never `useState`/`setState` per frame (Pitfall 3, Anti-Pattern in RESEARCH.md).

**Constants to carry unchanged** (`:324-327`, do not retune per UI-SPEC):
```js
const MAX_TRAIL = 280;
const MAX_SHADOWS = 240;
const SCROLL_STOP_DELAY = 120; // ms
// smoothing: 1 - Math.exp(-elapsed * 0.009)
// strength:  Math.min(1, distance / 3)
```

---

### `components/smear-heading/use-smear-heading.ts` (hook, event-driven)

**Analog:** `text_trail_demo/index.html`, `layout(reset)` (`:656-661`) for the per-heading measurement, and `activateApproach` (`:956-1003`) for the register/cleanup lifecycle shape (init → measure → activate; destroy on unmount).

**Per-heading layout/measurement pattern** (`:656-661`):
```js
layout(reset) {
  const rect = heading.getBoundingClientRect();
  this.documentTop = rect.top + scrollY;
  if (reset) this.lagY = rect.top;
  this.ready = true;
}
```
Port as: on mount (`useLayoutEffect`, so `getBoundingClientRect()` runs post-paint, per RESEARCH.md Pattern 3), register `{ el, documentTop, lagY }` into the provider's registry; on unmount, remove the entry and clear any inline `text-shadow` the effect left behind (mirrors `destroy()` at `:683-687`, `heading.style.textShadow = 'none'`).

**No SSR-time computation** (Pitfall 5): server-rendered heading markup must carry no `text-shadow`. `getBoundingClientRect()`/`scrollY` don't exist during SSR — this hook's measurement code must only ever run inside a `useLayoutEffect`/mount path, never at render time.

---

### `components/smear-heading/use-prefers-reduced-motion.ts` (hook, event-driven)

**Analog:** `text_trail_demo/index.html`, `:328` + `:1066` (same excerpt as above, factored into its own reusable hook per RESEARCH.md's recommended project structure — "reusable for any future motion, standing rule").

```js
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
// live-toggle support, not just an initial read:
reducedMotion.addEventListener('change', () => /* re-run gating logic */);
```
**Anti-pattern to avoid** (RESEARCH.md Anti-Patterns): constructing `matchMedia(...)` at module top-level or during render — `window` doesn't exist during SSR. Only call `matchMedia` inside a Client Component's effect.

---

### `app/globals.css` (config/stylesheet) — partial analog

**Analog:** `text_trail_demo/index.html` `<style>` block, specifically the root palette/tokens (`:16-24`), the ornamental rule background (`:36-41`), and the heading style (`:88-99`).

**Palette tokens to carry forward** (`:16-24`, values only — the mechanism changes to Tailwind v4 `@theme`, per D-04):
```css
:root {
  color-scheme: light;
  background: #f2eee5;
  color: #171714;
}
```
Maps directly to UI-SPEC's locked palette (`#f2eee5` dominant / `#171714` ink) — same hex values, same roles, different delivery mechanism (`@theme` custom properties, not a bare `:root` block).

**Ornamental rule background** (`:36-41`, optional polish per UI-SPEC, "ship only after the five success criteria are met"):
```css
body {
  background:
    linear-gradient(rgba(23, 23, 20, 0.052) 1px, transparent 1px) 0 0 / 100% 12.5vh,
    #f2eee5;
}
```
Portable as-is if shipped — it's a hardcoded decorative layer, no data-encoding signifiers (passes PITFALLS #6's checkable rule per UI-SPEC's own Aesthetic Guardrails section).

**Heading style — values to carry, two literals to explicitly NOT carry** (`:88-99`):
```css
.smear-heading {
  position: relative;
  display: inline-block;
  white-space: nowrap;      /* DO NOT PORT — overflows at 375px, D-03 */
  color: #171714;
  font-family: "Humane", Impact, sans-serif;
  font-size: var(--headline-size);   /* DO NOT PORT AS FIXED 160px — replace with clamp() per D-03/UI-SPEC Typography table */
  font-weight: var(--headline-weight); /* fixed 800 in UI-SPEC, not a live variable */
  line-height: 0.82;          /* PORT — validated value, Display role */
  letter-spacing: var(--headline-tracking); /* PORT AS 0em fixed — UI-SPEC caps tracking at 0em for Humane */
}
```
UI-SPEC's own Typography table has already resolved the two disqualified literals (`nowrap`, fixed `160px`) into `clamp()` curves for Display/Heading roles — this excerpt is here so the executor sees exactly which two lines of the source are the trap, not to imply the whole rule block ports unmodified.

**Font-face declaration for reference only** (`:8-14`) — do not copy this mechanism; `next/font/local` replaces it entirely (see below), but the `weight: 100 900` variable-axis range and `font-family: "Humane"` naming are useful to confirm against:
```css
@font-face {
  font-family: "Humane";
  src: url("./assets/Humane-VF.ttf") format("truetype");
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;   /* demo default — UI-SPEC overrides to 'optional' for production */
}
```

---

### `app/fonts/humane.ts` (config, font loader) — partial analog

**Analog:** the `@font-face` declaration above (`:8-14`) — informs the `weight` axis string and confirms the source file is the same asset. The loading mechanism itself (`next/font/local`) has no precedent in this codebase; it's a new, framework-level pattern, not a port.

```tsx
// Pattern verified via Context7 /vercel/next.js (RESEARCH.md Code Examples) —
// values (weight axis, display strategy) resolved by UI-SPEC, not the demo's font-display:swap
import localFont from 'next/font/local'

export const humane = localFont({
  src: './Humane-VF.ttf',
  weight: '100 900',
  display: 'optional',   // UI-SPEC deviates from the demo's `font-display: swap`
  variable: '--font-humane',
})
```

---

## Shared Patterns

### Direct DOM style writes, never React state, for the per-frame animation value
**Source:** `text_trail_demo/index.html:680` (`heading.style.textShadow = shadows.join(',')`)
**Apply to:** `smear-heading-provider.tsx`, `use-smear-heading.ts`
```js
// inside the shared rAF callback, per registered heading:
headingRef.current.style.textShadow = shadows.join(',');
// never: setState(shadows.join(',')) — would re-render ~60x/sec (Pitfall 3)
```

### `prefers-reduced-motion` gated before scheduling, watched for live change
**Source:** `text_trail_demo/index.html:328` (matcher), `:876-881` (`start()` early return), `:1066` (`change` listener)
**Apply to:** `smear-heading-provider.tsx`, `use-prefers-reduced-motion.ts`, and any future motion in this project (standing rule per UI-SPEC)
```js
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function start() {
  if (reducedMotion.matches || animationFrame || !ready) return;
  animationFrame = requestAnimationFrame(frame);
}
reducedMotion.addEventListener('change', () => /* re-evaluate, don't just check once */);
```

### Monochrome ink color — required deviation from the source's rainbow trail
**Source:** UI-SPEC.md "Required deviation" section; contrasts with `text_trail_demo/index.html:368-390` (`trailColor()`, `HUE_SPEED`)
**Apply to:** `smear-heading-provider.tsx` only place that calls `.draw()`
```js
// DO NOT port trailColor()/HUE_SPEED/trailHue.
// Replace every color argument to draw() with a fixed literal:
const INK = { css: '#171714' };
```

### Single shared `requestAnimationFrame` loop over a registry, not one loop per instance
**Source:** RESEARCH.md Architecture Pattern 3, generalizing `text_trail_demo/index.html:827-874`'s single-`activeEffect` loop (the benchmark itself has no multi-instance precedent — this is a designed generalization, not a literal port)
**Apply to:** `smear-heading-provider.tsx` (the only file allowed to call `requestAnimationFrame`), `use-smear-heading.ts` (registers/unregisters, never calls `requestAnimationFrame` itself)

### Font-ready gate before first layout measurement
**Source:** `text_trail_demo/index.html:1067` (`document.fonts.ready.then(...)`)
**Apply to:** `smear-heading-provider.tsx` / `use-smear-heading.ts` initial mount path — measure `getBoundingClientRect()` only after both mount and `document.fonts.ready` resolve, avoiding a stale rect measured against a fallback font.

---

## No Analog Found

Every file below has no precedent in this codebase because there is no prior Next.js/React/TypeScript application code. Planner and executor should follow RESEARCH.md's Architecture Patterns / Code Examples (Context7-sourced, official Next.js/Tailwind/Railway patterns) for these instead of a codebase analog.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `package.json` | config | — | No prior `package.json` in repo; use `create-next-app@16.3.3` scaffold per RESEARCH.md Standard Stack |
| `next.config.ts` | config | — | Greenfield; RESEARCH.md Pitfall 2 specifies what NOT to add (`output: 'export'`/`'standalone'`), not an existing file to model |
| `postcss.config.mjs` | config | — | Greenfield; Tailwind v4's `@tailwindcss/postcss` plugin wiring, no prior PostCSS config exists |
| `tsconfig.json` | config | — | Greenfield; scaffolded by `create-next-app` |
| `app/layout.tsx` | route (root layout) | request-response | No prior React/Next.js layout in repo; follow RESEARCH.md Architecture Patterns' recommended structure and Code Examples (`next/font` wiring, `robots` metadata) |
| `app/page.tsx` | route/component | request-response | `prototype-stack.html` is a dead static-HTML prototype on a different stack (Kumbh Sans, CSS `scroll-timeline` convergence effect, no Humane, no trail) — scheduled for deletion in this same phase; not a usable analog for a Next.js Server Component. Its only residual value is negative precedent: confirms the palette family (`#f0ede6`/`#0e0e0e`) predates and roughly rhymes with, but does not match, the locked `#f2eee5`/`#171714` values — use the locked UI-SPEC values, not the prototype's |
| `app/type/page.tsx` | route/component | request-response | Greenfield; no specimen/reference route exists yet — this phase creates the first one |
| `app/fonts/newsreader.ts` | config (font loader) | — | No Google Font precedent in repo; follow RESEARCH.md's `next/font/google` Code Example |
| `playwright.config.ts` + all `tests/*.spec.ts` | test | various | RESEARCH.md's own Wave 0 Gaps table confirms: zero test files, zero Playwright config exist yet. Follow RESEARCH.md's Validation Architecture section (Phase Requirements → Test Map) for what each spec must assert |

## Metadata

**Analog search scope:** repo root (`ls -la`), `text_trail_demo/index.html` (full file, 1071 lines, read in non-overlapping ranges), `prototype-stack.html` (full file, 203 lines).
**Files scanned:** 2 source files (the only pre-existing code in the repo besides config/docs) + repo root listing to confirm no `package.json`/`app/`/`src/` exist.
**Pattern extraction date:** 2026-08-29
</content>
</invoke>
