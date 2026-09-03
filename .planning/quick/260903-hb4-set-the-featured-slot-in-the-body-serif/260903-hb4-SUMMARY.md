---
quick_id: 260903-hb4
status: complete
completed: 2026-09-03
commit: 3b1a3b4
---

# Featured slot set in the body serif, meta line dropped

The case-study headline on `/` now renders in the body family at the Heading
curve, and the landing carries no dates.

## What changed

- Both `SmearTitle` elements in `components/landing/featured-slot.tsx` moved
  from `.text-heading` to `.text-heading-serif`. That class was already in
  `app/globals.css` as of `6cc7c43`, declared for this caller and unused until
  now: same `clamp(2rem, 1rem + 4vw, 4.5rem)`, same `530`, same `0.035em`,
  `--font-body` instead of `--font-display`.
- `PostMeta` and its `gap-md` wrapper are gone from the published state. The
  standfirst is now a direct child, which keeps the parent section's single
  `gap-lg` correct in both states.
- Added `public/noise.svg`, currently unreferenced.

## What this drops

The featured entry's **draft marker**. `PostMeta` was the only thing printing
it on `/`, and Phase 3 wired `draft={entry.frontmatter.draft}` through
precisely so the landing and `/writing` could not disagree about one file.
They can no longer disagree because the landing no longer answers. `/writing`
is the surface that answers "is this published?" from here.

The date goes with it, by intent — it was the only thing between the pitch and
the fold, and `/writing` and the post itself still carry it.

## Known-red tests

Committed deliberately at the user's instruction; **not** fixed, and none of
these contracts was rewritten to match.

| Test | Assertion | Cause |
|---|---|---|
| `tests/unit/post-meta-contract.test.ts:78` | at least 5 `<PostMeta>` call sites, found 4 | Task 2 |
| `tests/unit/post-meta-contract.test.ts:99` | the featured slot must render a `<PostMeta>` passing `draft={entry.frontmatter.draft}` (WR-02) | Task 2 |
| `tests/landing.spec.ts:351` | `caseStudy.locator("h3.text-heading")` → 1 | Task 1 |
| `tests/landing-trail.spec.ts:44,59` | the heading count **and** the trail target both select `section#case-study h3.text-heading` | Task 1 |
| `tests/landing-viewport.spec.ts:79` | the featured headline tracks the Heading curve, via `h3.text-heading` | Task 1 |

The three Playwright specs fail for one reason: `.text-heading` and
`.text-heading-serif` are distinct class tokens, so a `h3.text-heading`
selector matches nothing after Task 1. Note that
`tests/build/prerender.test.ts:642` **passes** — it matches
`class="[^"]*text-heading[^"]*"` as a substring, which `text-heading-serif`
satisfies. Two assertions written against the same element now disagree about
whether it exists, which is worth resolving in whichever direction the
contract is meant to go.

## Pre-existing red, inherited from `6cc7c43`, untouched here

Confirmed against a clean tree before this task's changes were staged:

- `robots: is declared in exactly the two root layouts a FIND-02 flip must edit`
- prose-contract `(m)`, `(n)`, `(o)` — `6cc7c43` added `.text-nameplate` and
  `.text-heading-serif` to `app/globals.css`, taking it past the four-size,
  two-weight budget those three tests enforce. `.text-nameplate`'s own comment
  in the stylesheet says so.

`npm run test:all` therefore cannot go green from this commit alone; the
budget question predates it.

## Verification

- `npm run test:unit`: 145 pass, 6 fail — 4 pre-existing, 2 from this task, as
  tabled above.
- Playwright and the production build were **not** run. The three specs above
  are known-red by inspection of their selectors.

## Commit

- `3b1a3b4 feat(260903-hb4): set the featured slot in the body serif, drop its meta line`
