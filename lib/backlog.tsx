/**
 * The backlog's entire content (D-05): a typed data module, not markup.
 * Mirrors lib/work.ts's shape and comment register. Adding or dropping an
 * item later is a change to BACKLOG below and nothing else.
 */
/**
 * Exactly two fields (D-06) — no date, no status, no tag, no href, no
 * ordinal (order is array order per D-04).
 *
 * `description` was a ReactNode, which was the stated reason this file is
 * .tsx and not .ts (D-05): the type was chosen so a description could reach
 * for <em> on a book title. No shipped description ever did, and as of
 * 2026-09-01 the field is a plain string, because items can now arrive over
 * HTTP from lib/backlog-store.ts and a ReactNode is not something a JSON body
 * can carry. Rendering untrusted markup would also be a genuine injection
 * surface where rendering text is not.
 *
 * The file keeps its .tsx extension deliberately. tests/unit/backlog-source.ts,
 * tests/unit/launch-gate.test.ts and tests/build/prerender.test.ts all read
 * this path as a literal string to scrape COPY_REVIEWED out of it; renaming it
 * to .ts to save one character of honesty would break three gates for nothing.
 * If a description genuinely needs emphasis later, the right move is a
 * constrained inline-markup parser, not a ReactNode field that only the
 * hardcoded seeds below could ever populate.
 */
export type BacklogItem = {
  name: string; // what the work is called — NOT a repo name
  description: string; // one paragraph, plain text (D-08)
};

/**
 * D-14 TRIPWIRE — the copy below is DRAFTED from repository evidence and
 * has NOT been reviewed by the author. Marked HERE in source and NOWHERE
 * on screen: tests/landing.spec.ts (s) bans "todo"/"placeholder"/"tbd"
 * from rendered text, and a visible "draft" badge on a live URL during a
 * job hunt is exactly what D-02 exists to prevent. Flip to true only
 * after the author's editorial pass. Must not reach Phase 6's FIND-02
 * robots flip while false.
 */
export const COPY_REVIEWED = false;

/**
 * D-02: three items, hard ceiling of four. D-04: array order IS the
 * editorial order, widest-range-first. D-13: an empty array fails the
 * build below — there is no empty state.
 *
 * These are also the SEED. lib/backlog-store.ts writes them into the
 * database the first time it finds the table empty, and serves them
 * directly whenever no database is configured — which is every local build,
 * every CI build, and every run of `npm run test:build`. Editing this array
 * therefore changes what a fresh database gets seeded with, and what the site
 * renders without one; it does NOT change an already-seeded database. Use the
 * API for that.
 */
export const BACKLOG: readonly BacklogItem[] = [
  {
    name: "A data portrait of the Swiss commodity trade",
    description:
      "The physical commodity trade runs through Switzerland in private partnerships with no " +
      "disclosure duty and no regulator of their own. The question is what can actually be " +
      "measured about a business whose defining feature is that it is not.",
  },
  {
    name: "The house names of Zürich",
    description:
      "Before street numbers, houses in Zürich were known by name. The question is how many of " +
      "those names survived from the eighteenth century into the present — and whether what " +
      "disappeared was the houses or only the naming.",
  },
  {
    name: "The Pudding, read as a corpus",
    description:
      "Two hundred-odd visual essays by one publication, read together instead of one at a time. " +
      "The question is whether a house style is visible in the aggregate — which subjects recur, " +
      "which forms get reused, and what the publication has quietly stopped doing.",
  },
] as const;

/**
 * BACK-02 / D-09. The honest reading is max(item last-touch) — measured
 * masterarbeit 2026-08-31, hausnamen 2026-08-26, pudding-pudding
 * 2026-08-19 — not "when I last edited this file". On 2026-08-31 both
 * readings coincide because item 1 was touched that day; if item 1 were
 * ever dropped the honest value would fall back to 2026-08-26. Bump it
 * when the WORK moves, not when the copy does. Plan 02's repo-tier guard
 * enforces the floor: LAST_TOUCHED may never be earlier than the
 * module's own last change.
 */
export const LAST_TOUCHED = "2026-08-31";

/**
 * sha256 of the BACKLOG array's normalised content, authored TOGETHER with
 * LAST_TOUCHED above and meaningless apart from it. The pair says: "these
 * exact words were last touched on that date."
 *
 * It exists because BACK-02's repo-tier guard used to ask "when did this file
 * last change?" and treat any answer later than LAST_TOUCHED as a stale claim.
 * That was the right question while the file WAS the backlog. It stopped being
 * the right question when the file also became the seed for
 * lib/backlog-store.ts: re-encoding a description from a JSX fragment to a
 * string literal changed every byte of the array and not one word a reader
 * sees, and the guard demanded a date bump that would itself have been the
 * overclaim BACK-02 exists to prevent.
 *
 * So the guard now asks the narrower question. Change a word and this hash
 * changes and the guard fails until both this and LAST_TOUCHED are updated.
 * Reformat, retype or re-comment the module and it does not.
 *
 * Recompute with:
 *   node --input-type=module -e 'import {backlogContentFingerprint} from "./tests/unit/backlog-source.ts";
 *     import {createHash} from "node:crypto";
 *     console.log(createHash("sha256").update(backlogContentFingerprint()).digest("hex"))'
 */
export const BACKLOG_CONTENT_SHA256 =
  "671088913caf253831c8aeb17d5e6bb2cb1315f959158bd8969a292d238cf194";

// D-09.1 — fail-loud at build, mirroring assertFrontmatter's
// collect-then-throw shape (lib/content.ts:34-76). NO GIT HERE: git
// metadata is absent or misleading in build environments
// (05-RESEARCH.md Q1 §D) — putting it in the build path is the one thing
// that would genuinely break Railway. Freshness-vs-source-control is Plan 02's tier.
{
  const problems: string[] = [];
  if (BACKLOG.length === 0) {
    problems.push("BACKLOG must not be empty (D-13: there is no empty state)");
  }
  if (BACKLOG.length > 4) {
    problems.push(`BACKLOG holds ${BACKLOG.length} items; the ceiling is 4 (D-02)`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(LAST_TOUCHED)) {
    problems.push(`LAST_TOUCHED "${LAST_TOUCHED}" must be an ISO date (YYYY-MM-DD)`);
  } else {
    // Shape is not validity: 2026-02-31 passes the regex above and
    // silently rolls to 2026-03-03 (lib/content.ts:46-61 documents the
    // same trap for post front-matter dates).
    const parsed = new Date(`${LAST_TOUCHED}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== LAST_TOUCHED) {
      problems.push(`LAST_TOUCHED "${LAST_TOUCHED}" is not a real calendar date`);
    } else if (parsed.getTime() > Date.now() + 36 * 60 * 60 * 1000) {
      // +36h, not 0 (Pitfall 4): LAST_TOUCHED is authored in local time
      // (CEST = UTC+2) and the build runs in UTC, so a strict comparison
      // would fail a legitimate late-evening edit. 36h still rejects a
      // date genuinely in the future (e.g. a month ahead).
      problems.push(`LAST_TOUCHED "${LAST_TOUCHED}" is in the future`);
    }
  }
  if (problems.length) {
    throw new Error(`lib/backlog.tsx: ${problems.join("; ")}`);
  }
}
