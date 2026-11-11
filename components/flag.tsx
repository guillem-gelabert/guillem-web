import type { Locale } from "@/lib/content";

// The language switch's flags (components/language-switch.tsx), drawn as
// inline SVG rather than emoji: Windows renders no flag emoji at all, and
// Catalonia has none. Each keeps its own proportions at one height
// (.lang-flag in app/globals.css). Decorative: the link carries the name.
//
//   en  the Union Jack, simplified (the diagonals' counterchange is dropped;
//       at 14px it is not visible)
//   de  black, red and gold
//   ca  the senyera: four red stripes on gold
export function Flag({ locale }: { locale: Locale }) {
  if (locale === "en") {
    return (
      <svg className="lang-flag" viewBox="0 0 60 30" aria-hidden="true" focusable="false">
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </svg>
    );
  }
  if (locale === "de") {
    return (
      <svg className="lang-flag" viewBox="0 0 5 3" aria-hidden="true" focusable="false">
        <rect width="5" height="1" y="0" fill="#000" />
        <rect width="5" height="1" y="1" fill="#DD0000" />
        <rect width="5" height="1" y="2" fill="#FFCE00" />
      </svg>
    );
  }
  return (
    <svg className="lang-flag" viewBox="0 0 9 6" aria-hidden="true" focusable="false">
      <rect width="9" height="6" fill="#FCDD09" />
      {[1, 3, 5, 7].map((stripe) => (
        <rect key={stripe} width="9" height={2 / 3} y={(stripe * 2) / 3} fill="#DA121A" />
      ))}
    </svg>
  );
}
