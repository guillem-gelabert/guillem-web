import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findBySlug, loadPostModule, publishedFor, translationOf } from "@/lib/content";
import { indexPath, postPath, UI } from "@/lib/locales";
import { Prose } from "@/components/prose";
import { SmearTitle } from "@/components/smear-title";
import { PostMeta } from "@/components/post-meta";
import { routeOpenGraph } from "@/lib/metadata";

// This route carries no client directive. Phase 1 marked whole pages as
// Client Components to reach the scroll-trail hook; doing that here would
// drag the compiled MDX module, its component imports and every Shiki token
// span into the client bundle and break `fs`. SmearTitle is the one client
// leaf that carries the trail instead.

// Stays true rather than false: with two root layouts there is no global
// not-found, and a routing-layer 404 would bypass this segment's localised
// not-found.tsx entirely. This plus an explicit notFound() call below is
// unambiguous either way.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await publishedFor("de")).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = findBySlug(await publishedFor("de"), slug);
  if (!entry) return {};

  const twin = await translationOf(entry);
  const languages: Record<string, string> = {
    de: postPath("de", entry.slug),
  };
  if (twin) {
    languages.en = postPath("en", twin.slug);
  }
  // A German-only piece still needs a resolvable default alternate: fall
  // back to its own URL when no English twin exists, rather than pointing
  // at a path that would 404.
  languages["x-default"] = twin ? postPath("en", twin.slug) : postPath("de", entry.slug);

  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.standfirst,
    alternates: {
      canonical: postPath("de", entry.slug),
      languages,
    },
    // lib/metadata.ts's routeOpenGraph supplies this route's own og:url
    // without hand-restating og:type/og:site_name/og:locale — see that
    // function's comment for why a bare `openGraph: { url }` would have
    // silently dropped them. og:title/og:description come free from the
    // title/description fields above.
    openGraph: routeOpenGraph("de", postPath("de", entry.slug)),
  };
}

export default async function WritingPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // SECURITY (ASVS V4): the allowlist runs before the dynamic import. Never
  // reorder — findBySlug against publishedFor("de") must resolve, and
  // notFound() must throw, before loadPostModule ever touches the slug.
  const entry = findBySlug(await publishedFor("de"), slug);
  if (!entry) notFound();

  const { default: Post } = await loadPostModule(slug);
  const twin = await translationOf(entry);

  return (
    <main className="flex flex-col gap-3xl px-lg py-3xl">
      <header className="flex flex-col gap-2xl">
        <Link href={indexPath("de")} className="text-label link-quiet inline-block py-xs">
          {UI.de.backLink}
        </Link>
        <div className="flex flex-col gap-lg">
          <SmearTitle as="h1" className="text-heading">
            {entry.frontmatter.title}
          </SmearTitle>
          <div className="flex flex-col gap-md">
            <p className="max-w-prose text-standfirst">{entry.frontmatter.standfirst}</p>
            <PostMeta
              locale="de"
              date={entry.frontmatter.date}
              switchHref={twin ? postPath("en", twin.slug) : null}
              draft={entry.frontmatter.draft}
            />
          </div>
        </div>
      </header>
      <Prose>
        <Post />
      </Prose>
    </main>
  );
}
