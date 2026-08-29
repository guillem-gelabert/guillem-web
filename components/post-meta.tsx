import type { Locale } from "@/lib/content";
import { formatPostDate, UI } from "@/lib/locales";
import { LanguageSwitch } from "@/components/language-switch";

type PostMetaProps = {
  locale: Locale;
  date: string;
  switchHref: string | null;
  draft?: boolean;
};

// Date, language switch and dev-only draft marker on one Label-role line.
export function PostMeta({ locale, date, switchHref, draft }: PostMetaProps) {
  const showDraftMarker = draft === true && process.env.NODE_ENV === "development";

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
