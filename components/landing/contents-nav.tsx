import Link from "next/link";
import { indexPath } from "@/lib/locales";

type NavEntry = {
  label: string;
  href: string;
  kind: "anchor" | "route";
};

// Reader-importance order, not page order (HOME-03): Writing sits second
// because it is the only route in this list that already holds shipped
// content — the other four are interim surfaces this phase ships as stubs
// (D-02). Exactly five entries; do NOT add a sixth #case-study link, because
// that section sits immediately beneath this nav and a link to what the
// reader is already looking at is noise, not navigation.
const NAV: NavEntry[] = [
  { label: "Work", href: "#work", kind: "anchor" },
  { label: "Writing", href: indexPath("en"), kind: "route" },
  { label: "Backlog", href: "#backlog", kind: "anchor" },
  // The literal "/cv" is a deliberate deviation from the house
  // indexPath()/postPath() rule: those helpers exist because the writing
  // routes are locale-parameterised, and /cv is a single static
  // English-only route — inventing a cvPath() for one path is worse than
  // the literal here.
  { label: "CV", href: "/cv", kind: "route" },
  { label: "Contact", href: "#contact", kind: "anchor" },
];

// inline-block + py-xs (4px) is not decoration: a Label-role link's line box
// measures 18.2px, under WCAG 2.5.8's 24px target-size floor. The 4px
// vertical padding takes it to 26.2px, clearing the floor.
const LINK_CLASSNAME = "text-label link-quiet inline-block py-xs";

// The five-item HOME-03 navigation. In-flow inside the page header, never
// sticky, never fixed, no footer repeat, no skip link (there is no repeated
// chrome to skip). No separator glyph between items — the 24px column gap
// and 16px row gap are the separation.
export function ContentsNav() {
  return (
    <nav aria-label="Sections">
      <ul className="flex flex-wrap gap-x-lg gap-y-md">
        {NAV.map((entry) =>
          entry.kind === "anchor" ? (
            // Native fragment navigation, not next/link. Anchor jumps stay
            // instant everywhere on this site (Motion Contract) — animating
            // them is motion, and it fires a long burst of scroll events,
            // each of which advances the trail's trailHue.
            <li key={entry.href}>
              <a href={entry.href} className={LINK_CLASSNAME}>
                {entry.label}
              </a>
            </li>
          ) : (
            <li key={entry.href}>
              <Link href={entry.href} className={LINK_CLASSNAME}>
                {entry.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
