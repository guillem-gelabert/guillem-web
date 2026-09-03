import Link from "next/link";
import type { PostEntry } from "@/lib/content";
import { postPath } from "@/lib/locales";
import { SmearTitle } from "@/components/smear-title";

type FeaturedSlotProps = {
  entry: PostEntry | null;
};

// The two-state CASE-03 slot (D-07, D-10). Phase 4 changes copy and adds one
// <a> — it changes no layout, no role, no gap and no order, which is the
// entire reason this slot is built now, ahead of the case study existing.
//
// The headline is an <h3> beneath the section's <h2> section head even
// though it renders far larger: semantics follow structure, visual weight
// follows editorial hierarchy. An <h2> here would put two <h2>s inside
// <section id="case-study"> and silently break the outline
// aria-labelledby depends on.
export function FeaturedSlot({ entry }: FeaturedSlotProps) {
  if (entry === null) {
    return (
      <>
        {/* Not a link, and must not become one: the case study does not
            exist yet and /writing is at n=0, so there is nowhere honest
            for it to point. A link to an empty index is a circular dead
            end. */}
        <SmearTitle as="h3" className="text-heading text-heading-serif">
          The case study is being written.
        </SmearTitle>
        <p className="max-w-prose text-body">
          On the Mallorca piece: what was expected, what the data showed, and how the visual
          form changed in response.
        </p>
      </>
    );
  }

  return (
    <>
      <SmearTitle as="h3" className="text-heading text-heading-serif">
        {/* next/link, not a bare <a>: this is internal navigation to
            /writing/<slug>. Every other internal link in the repo uses
            Link — both indexes, both [slug] templates, all three not-found
            boundaries, /cv, /type, LanguageSwitch and ContentsNav's
            kind: "route" branch. The only raw <a> elements left are
            work-list.tsx (external absolute URLs) and contents-nav.tsx
            (hash fragments), both correct and both documented.

            ESLint's @next/next/no-html-link-for-pages caught exactly this
            bug in /type during Wave 2 (03-04-SUMMARY.md:89-95) but cannot
            see it here: the href is a computed expression the rule cannot
            statically resolve. A bare <a> costs the route prefetch and
            does a full document navigation, tearing down and rebuilding
            the trail provider — on the slot's only interactive affordance
            and the whole reason it was built ahead of the content. */}
        <Link className="link-quiet" href={postPath("en", entry.slug)}>
          {entry.frontmatter.title}
        </Link>
      </SmearTitle>
      {/* No PostMeta: the landing carries no dates. The date and the draft
          marker still print on /writing and on the post itself, which is
          where a reader who wants to know when this was published goes —
          on the front page the line was the only thing between the pitch
          and the fold. Note what this drops with it: the draft marker for
          the featured entry. /writing is the surface that answers "is this
          published?" now. */}
      <p className="max-w-prose text-standfirst">{entry.frontmatter.standfirst}</p>
    </>
  );
}
