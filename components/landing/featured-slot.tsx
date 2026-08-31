import type { PostEntry } from "@/lib/content";
import { postPath } from "@/lib/locales";
import { SmearTitle } from "@/components/smear-title";
import { PostMeta } from "@/components/post-meta";

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
        <SmearTitle as="h3" className="text-heading">
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
      <SmearTitle as="h3" className="text-heading">
        <a className="link-quiet" href={postPath("en", entry.slug)}>
          {entry.frontmatter.title}
        </a>
      </SmearTitle>
      {/* This nested gap-md wrapper is the same shape app/(en)/writing/page.tsx
          already uses for standfirst + PostMeta, and it is what keeps the
          parent section's single gap-lg correct in both states. */}
      <div className="flex flex-col gap-md">
        <p className="max-w-prose text-standfirst">{entry.frontmatter.standfirst}</p>
        {/* draft is NOT optional here. Omitting it made PostMeta see
            `undefined`, so `draft === true && showDrafts()` was always
            false and the marker never printed — while /writing, which does
            pass it, printed "Draft" beside the identical entry. In dev
            showDrafts() is always true, so the moment Phase 4 authors
            content/the-chart-therefore-changes.mdx with draft: true the
            author would have read two contradictory answers for one file
            on two pages, on the surface where it matters most. */}
        <PostMeta
          locale="en"
          date={entry.frontmatter.date}
          switchHref={null}
          draft={entry.frontmatter.draft}
        />
      </div>
    </>
  );
}
