/**
 * One flag, consulted by every gate that used to ask "is this value
 * filled?" and now has to ask the harder question: "is this value REAL?"
 *
 * Phases 1–6 shipped `null`/`[]`/`"Developer."` for the six user-supplied
 * facts, and `tests/unit/launch-gate.test.ts` turned "is it filled" into a
 * biconditional against the `index: false` directive in both root layouts.
 * That worked while the only two states were *absent* and *real*. There is now a third state:
 * lorem-ipsum content, deliberately committed by the site owner so every
 * surface renders at full length before the real words exist.
 *
 * Lorem content satisfies "filled" and fails "real". Without this flag the
 * biconditional would read a page of `Lorem ipsum dolor sit amet` as a
 * finished CV and start DEMANDING `index: true` — the exact drift the gate
 * was built to make impossible. So the flag joins the gate as row G14: while
 * it is true, both root layouts must stay `index: false`, no matter how full
 * the data modules look.
 *
 * Flipping it to false is not a formality. It asserts that every value
 * carrying a `[PLACEHOLDER]` tag in lib/cv.ts, lib/contact.ts and
 * lib/work.ts has been replaced with a real one, and that no lorem string
 * survives anywhere in the shipped bundle. The build-tier sweep in
 * tests/build/prerender.test.ts holds you to it: with this false, "lorem"
 * goes back to being a banned word in every prerendered route, so a stale
 * flip fails the suite rather than shipping quietly.
 */
export const PLACEHOLDER_CONTENT = true;

/**
 * The marker words that must NEVER reach a rendered page, whatever state
 * the site is in. "todo", "tbd", "coming soon" and "under construction" are
 * apologies — they tell a reader the site is broken. Lorem ipsum is not an
 * apology; it is standard pre-copy furniture, and the owner asked for it
 * explicitly. That is the whole distinction this split encodes.
 *
 * Shared by tests/cv.spec.ts, tests/landing.spec.ts and
 * tests/build/prerender.test.ts so the ban is stated once rather than
 * copied into six places that can drift apart (it previously was, and they
 * had already drifted by one word).
 */
export const ALWAYS_BANNED_MARKERS = [
  "todo",
  "coming soon",
  "under construction",
  "tbd",
] as const;

/**
 * Banned only once the placeholder content is gone. Kept separate rather
 * than deleted: these are the words that prove the swap actually happened.
 */
export const PLACEHOLDER_MARKERS = ["lorem", "placeholder"] as const;

/**
 * What a rendered surface may not contain right now. With
 * PLACEHOLDER_CONTENT true this is the four apologies; with it false it is
 * all six, and the site is back under the original D-02 rule.
 */
export const BANNED_MARKERS: readonly string[] = PLACEHOLDER_CONTENT
  ? ALWAYS_BANNED_MARKERS
  : [...ALWAYS_BANNED_MARKERS, ...PLACEHOLDER_MARKERS];
