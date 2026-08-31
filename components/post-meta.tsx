import { showDrafts, type Locale } from "@/lib/content";
import { formatPostDate, UI } from "@/lib/locales";
import { LanguageSwitch } from "@/components/language-switch";

type PostMetaProps = {
  locale: Locale;
  date: string;
  switchHref: string | null;
  /**
   * A REQUIRED key with an optional value, not an optional key. `draft?:
   * boolean` let components/landing/featured-slot.tsx omit it silently,
   * which read as `undefined` and made showDraftMarker permanently false —
   * a draft case study rendered on / with no marker while /writing showed
   * one for the same file (code review WR-02). Phase 2's WR-07 made the
   * draft rule a single exported predicate; that is undermined just as
   * effectively by not feeding it its input as by restating it. Omission is
   * now a type error; passing `entry.frontmatter.draft` through, undefined
   * and all, is the only way to call this.
   */
  draft: boolean | undefined;
};

// Date, language switch and dev-only draft marker on one Label-role line.
export function PostMeta({ locale, date, switchHref, draft }: PostMetaProps) {
  // One predicate, imported — never a second inline copy of D-11 (WR-07).
  const showDraftMarker = draft === true && showDrafts();

  return (
    <p className="text-label">
      <time dateTime={date}>{formatPostDate(date, locale)}</time>
      {switchHref ? (
        <>
          {" · "}
          <LanguageSwitch from={locale} href={switchHref} />
        </>
      ) : null}
      {showDraftMarker ? (
        <>
          {" · "}
          {UI[locale].draftMarker}
        </>
      ) : null}
    </p>
  );
}
