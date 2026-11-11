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
import { postOpenGraph } from "@/lib/metadata";

// app/(de)/texte/[slug]/page.tsx's twin. See that file for why there is no
// client directive here and why dynamicParams stays true.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await publishedFor("ca")).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = findBySlug(await publishedFor("ca"), slug);
  if (!entry) return {};

  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.standfirst,
    alternates: {
      canonical: postPath("ca", entry.slug),
      languages: postAlternates(entry, await translationsOf(entry)),
    },
    openGraph: postOpenGraph("ca", postPath("ca", entry.slug), entry.slug),
  };
}

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
  // reorder.
  const entry = findBySlug(await publishedFor("ca"), slug);
  if (!entry) notFound();

  const { default: Post } = await loadPostModule(slug);
  const twins = await translationsOf(entry);

  if (entry.frontmatter.theme === "pink-paper") {
    return (
      <PinkPaperArticle
        backLabel={UI.ca.homeLink}
        backHrefLang="en"
        kicker={entry.frontmatter.kicker}
        title={entry.frontmatter.title}
        standfirst={entry.frontmatter.hideStandfirst ? undefined : entry.frontmatter.standfirst}
        meta={
          <PostMeta
            locale="ca"
            date={entry.frontmatter.date}
            translations={translationLinks(twins)}
            draft={entry.frontmatter.draft}
          />
        }
      >
        <Post />
      </PinkPaperArticle>
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
        <Link href="/" hrefLang="en" className="text-label link-quiet inline-block py-xs">
          {UI.ca.homeLink}
        </Link>
        <div className="flex flex-col gap-lg">
          <PostTitle frontmatter={entry.frontmatter} />
          <div className="flex flex-col gap-md">
            {entry.frontmatter.hideStandfirst ? null : (
              <p className="max-w-prose text-standfirst">{entry.frontmatter.standfirst}</p>
            )}
            <PostMeta
              locale="ca"
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
