import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findBySlug, loadPostModule, publishedFor, shadesOf, translationsOf } from "@/lib/content";
import { postAlternates, postPath, translationLinks, UI } from "@/lib/locales";
import { Prose } from "@/components/prose";
import { PostTitle } from "@/components/post-title";
import { PostMeta } from "@/components/post-meta";
import { PostPalette } from "@/components/post-palette";
import { GameboyScreen } from "@/components/gameboy-screen";
import { PinkPaperArticle } from "@/components/pink-paper";
import { ASIDES, isAsideKey } from "@/lib/asides";
import { postOpenGraph } from "@/lib/metadata";

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
  return (await publishedFor("en")).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = findBySlug(await publishedFor("en"), slug);
  if (!entry) return {};

  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.standfirst,
    alternates: {
      canonical: postPath("en", entry.slug),
      languages: postAlternates(entry, await translationsOf(entry)),
    },
    // postOpenGraph, not routeOpenGraph: this is the one segment with a
    // card of its own. The generic helper would name the locale's site-wide
    // card here and, because a declared openGraph object also overrides the
    // opengraph-image FILE CONVENTION for its segment, would silently
    // replace the post's committed card with it — which is exactly what
    // shipped between 2026-09-01's og:image fix and this one. See
    // lib/metadata.ts's postOpenGraph comment for the full account.
    openGraph: postOpenGraph("en", postPath("en", entry.slug), entry.slug),
  };
}

// The Game Boy wrapper only when the post asks for it; a fragment otherwise,
// so the untouched layout keeps its exact DOM for every other post.
function Screen({
  shades,
  children,
}: {
  shades: readonly [string, string, string, string] | null;
  children: React.ReactNode;
}) {
  return shades ? <GameboyScreen shades={shades}>{children}</GameboyScreen> : <>{children}</>;
}

export default async function WritingPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // SECURITY (ASVS V4): the allowlist runs before the dynamic import. Never
  // reorder — findBySlug against publishedFor("en") must resolve, and
  // notFound() must throw, before loadPostModule ever touches the slug.
  const entry = findBySlug(await publishedFor("en"), slug);
  if (!entry) notFound();

  const { default: Post } = await loadPostModule(slug);
  const twins = await translationsOf(entry);

  if (entry.frontmatter.theme === "pink-paper") {
    return (
      <PinkPaperArticle
        locale="en"
        backLabel={UI.en.homeLink}
        kicker={entry.frontmatter.kicker}
        lead={
          entry.frontmatter.leadImage
            ? {
                src: entry.frontmatter.leadImage,
                alt: entry.frontmatter.leadImageAlt ?? "",
                caption: entry.frontmatter.leadCaption,
              }
            : undefined
        }
        pullQuote={entry.frontmatter.pullQuote}
        title={entry.frontmatter.title}
        standfirst={entry.frontmatter.hideStandfirst ? undefined : entry.frontmatter.standfirst}
        meta={
          <PostMeta
            locale="en"
            date={entry.frontmatter.date}
            translations={translationLinks(twins)}
            draft={entry.frontmatter.draft}
          />
        }
        date={entry.frontmatter.date}
        aside={isAsideKey(entry.frontmatter.aside) ? ASIDES[entry.frontmatter.aside].en : undefined}
        post={Post}
      />
    );
  }

  const gameboy = entry.frontmatter.theme === "gameboy" ? shadesOf(entry.frontmatter) : null;

  return (
    <main
      className={`mx-auto flex w-full max-w-page flex-col gap-3xl px-lg py-3xl${gameboy ? " gb-screen" : ""}`}
    >
      <PostPalette frontmatter={entry.frontmatter} />
      <Screen shades={gameboy}>
      <header className="flex flex-col gap-2xl">
        {/* Amendment A3: conformance with Phase 2's own Color section,
            which already reserves the accent for link focus on any
            link. inline-block py-xs is not decoration — this Label-role
            link on its own line measures an 18.2px line box, under WCAG
            2.5.8's 24px floor; the 4px block padding takes it to 26.2px. */}
        <Link href="/" className="text-label link-quiet inline-block py-xs">
          {UI.en.homeLink}
        </Link>
        <div className="flex flex-col gap-lg">
          <PostTitle frontmatter={entry.frontmatter} />
          <div className="flex flex-col gap-md">
            {entry.frontmatter.hideStandfirst ? null : (
              <p className="max-w-prose text-standfirst">{entry.frontmatter.standfirst}</p>
            )}
            <PostMeta
              locale="en"
              date={entry.frontmatter.date}
              translations={translationLinks(twins)}
              draft={entry.frontmatter.draft}
            />
          </div>
        </div>
      </header>
      <Prose>
        <Post />
      </Prose>
      </Screen>
    </main>
  );
}
