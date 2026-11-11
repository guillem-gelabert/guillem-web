import Link from "next/link";

type NavEntry = {
  label: string;
  href: string;
  kind: "anchor" | "route";
};

// Reader-importance order, not page order (HOME-03). Exactly four entries;
// do NOT add a #case-study link, because that section sits immediately
// beneath this nav and a link to what the reader is already looking at is
// noise, not navigation.
const NAV: NavEntry[] = [
  { label: "Work", href: "#work", kind: "anchor" },
  { label: "Backlog", href: "#backlog", kind: "anchor" },
  { label: "CV", href: "/cv", kind: "route" },
  { label: "Contact", href: "#contact", kind: "anchor" },
];

// inline-block + py-xs (4px) is not decoration: a Label-role link's line box
// measures 18.2px, under WCAG 2.5.8's 24px target-size floor. The 4px
// vertical padding takes it to 26.2px, clearing the floor.
const LINK_CLASSNAME = "text-label link-quiet inline-block py-xs";

// The four-item HOME-03 navigation. In-flow inside the page header, never
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
