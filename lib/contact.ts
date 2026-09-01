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
 * file exists to prevent.
 */

/**
 * [USER-SUPPLIED] — PROF-03, launch gate G4. null is the shipped state.
 * The contact block renders only the channels that exist
 * (components/language-switch.tsx's null-rather-than-greyed-out pattern) —
 * a dead affordance is worse than no affordance. NEVER invent an address.
 *
 * A current-employer address is on record in this environment and is
 * deliberately NOT used here: a current-employer address is the wrong
 * channel for a job hunt and is not the user's to publish here by
 * inference (06-CONTEXT.md's no-fabrication rule).
 */
export const EMAIL: string | null = null;

/**
 * [USER-SUPPLIED] — PROF-05, launch gate G5. null is the shipped state.
 * NEVER invent a LinkedIn profile URL.
 */
export const LINKEDIN: string | null = null;

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
