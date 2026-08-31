import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findBySlug, loadPostModule, publishedFor, translationOf } from "@/lib/content";
import { indexPath, postPath, UI } from "@/lib/locales";
import { Prose } from "@/components/prose";
import { SmearTitle } from "@/components/smear-title";
import { PostMeta } from "@/components/post-meta";

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

  const twin = await translationOf(entry);
  const languages: Record<string, string> = {
    en: postPath("en", entry.slug),
  };
  if (twin) {
    languages.de = postPath("de", twin.slug);
  }
  languages["x-default"] = postPath("en", entry.slug);

  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.standfirst,
    alternates: {
      canonical: postPath("en", entry.slug),
      languages,
    },
  };
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
  const twin = await translationOf(entry);

  return (
    <main className="flex flex-col gap-3xl px-lg py-3xl">
      <header className="flex flex-col gap-2xl">
        {/* Amendment A3: conformance with Phase 2's own Color section,
            which already reserves the accent for link hover/focus on any
            link. inline-block py-xs is not decoration — this Label-role
            link on its own line measures an 18.2px line box, under WCAG
            2.5.8's 24px floor; the 4px block padding takes it to 26.2px. */}
        <Link href={indexPath("en")} className="text-label link-quiet inline-block py-xs">
          {UI.en.backLink}
        </Link>
        <div className="flex flex-col gap-lg">
          <SmearTitle as="h1" className="text-heading">
            {entry.frontmatter.title}
          </SmearTitle>
          <div className="flex flex-col gap-md">
            <p className="max-w-prose text-standfirst">{entry.frontmatter.standfirst}</p>
            <PostMeta
              locale="en"
              date={entry.frontmatter.date}
              switchHref={twin ? postPath("de", twin.slug) : null}
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
