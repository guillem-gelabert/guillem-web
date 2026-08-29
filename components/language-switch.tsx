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
    <Link href={href} className="text-label" hrefLang={otherLocale(from)}>
      {UI[from].switchLabel}
    </Link>
  );
}
