/**
 * The contact channels' entire content (D-2.1): a typed data module, not
 * markup, mirroring lib/cv.ts and lib/work.ts's shape and comment
 * register. Exactly the three channels the requirements name — email,
 * GitHub, LinkedIn. No Twitter/X, no Mastodon, no Bluesky, no phone, no
 * location, no CV-download link, no contact form (Out of Scope by name). A
 * fourth channel is a content change to this file, not a layout change.
 *
 * Nothing in this file may contain a plausible-looking example value, even
 * commented out — a commented-out fake address is the failure mode this
 * file exists to prevent. That rule is what shapes the two [PLACEHOLDER]
 * values below: both are filled so the contact block renders all three
 * rows at their true length, and both are built out of reserved,
 * unreachable strings so neither can be mistaken for a real channel or
 * accidentally deliver mail to a stranger.
 */

/**
 * [PLACEHOLDER] — PROF-03, launch gate G4, held at noindex by G14
 * (lib/placeholder.ts).
 *
 * example.com is reserved by RFC 2606 precisely so that documentation and
 * placeholders cannot collide with a real domain: it has no MX record and
 * can never accept mail. That is the entire reason it is used here rather
 * than a plausible-looking address — a wrong-but-deliverable address on a
 * live contact block sends a stranger someone else's job enquiries, which
 * is a worse failure than an empty row.
 *
 * A current-employer address is on record in this environment and is still
 * deliberately NOT used: a current-employer address is the wrong channel
 * for a job hunt and is not the user's to publish here by inference
 * (06-CONTEXT.md's no-fabrication rule).
 */
export const EMAIL: string | null = "lorem.ipsum@example.com";

/**
 * [PLACEHOLDER] — PROF-05, launch gate G5, held at noindex by G14.
 *
 * The host is kept real and the slug is kept impossible. A LinkedIn URL is
 * rendered as its own link text, so its measured width is what the contact
 * block's rhythm has to accommodate; pointing this at example.com instead
 * would lay the row out against the wrong string. But the slug must never
 * resolve — a placeholder that lands on a real stranger's profile is the
 * one outcome worse than a broken link, so it is four lorem words no
 * profile will ever hold.
 */
export const LINKEDIN: string | null = "https://www.linkedin.com/in/lorem-ipsum-dolor-sit-amet";

/**
 * Established from evidence, NOT user-supplied: `git remote -v` resolves
 * to https://github.com/guillem-gelabert/guillem-web.git, and the legacy
 * Pages site is guillem-gelabert.github.io. Never gated by the launch
 * gate — a future null here would be a regression, not an absence.
 */
export const GITHUB = "https://github.com/guillem-gelabert";

export type ContactChannel = {
  label: "Email" | "GitHub" | "LinkedIn";
  value: string;
};

/**
 * D-2.2: the same block renders in two places — the #contact section on /
 * and the foot of /cv — from this one function; it is not typed twice.
 * D-2.1's fixed channel order is Email, GitHub, LinkedIn. Parameters
 * default to the module's own shipped state so plan 06-04 can call
 * `channels()` with no arguments, while tests/unit/contact.test.ts passes
 * values in directly so the assembly logic is tested independently of
 * today's shipped state.
 *
 * Returns EXACTLY the non-null channels — with two of three null this
 * returns one entry, never three entries two of which are empty. No
 * branch here ever returns a greyed-out or "not yet available" entry: a
 * dead affordance is worse than no affordance.
 */
export function channels(
  email: string | null = EMAIL,
  linkedin: string | null = LINKEDIN,
  github: string = GITHUB,
): readonly ContactChannel[] {
  const candidates: readonly (ContactChannel | null)[] = [
    email !== null ? { label: "Email", value: email } : null,
    { label: "GitHub", value: github },
    linkedin !== null ? { label: "LinkedIn", value: linkedin } : null,
  ];
  return candidates.filter((channel): channel is ContactChannel => channel !== null);
}
