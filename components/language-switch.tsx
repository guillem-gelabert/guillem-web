import Link from "next/link";
import type { Locale } from "@/lib/content";
import { otherLocale, UI } from "@/lib/locales";

type LanguageSwitchProps = {
  from: Locale;
  href: string | null;
};

// Absent from the DOM entirely when no translation exists (D-07) — not
// greyed out, not disabled via an ARIA attribute, not a tooltip. A dead
// affordance advertises something that does not exist and is a known
// screen-reader trap.
export function LanguageSwitch({ from, href }: LanguageSwitchProps) {
  if (href === null) {
    return null;
  }

  return (
    // Amendment A3: link-quiet only — deliberately no target-size block
    // padding here. Two concrete reasons: it sits inline inside PostMeta's
    // text line, which is WCAG 2.5.8's explicit inline exception; and
    // padding it to a block box would change the shipped meta-line height
    // on /writing, /texte and every post — a visual regression on shipped
    // surfaces for no accessibility gain.
    <Link href={href} className="text-label link-quiet" hrefLang={otherLocale(from)}>
      {UI[from].switchLabel}
    </Link>
  );
}
