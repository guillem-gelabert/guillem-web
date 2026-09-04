import type { Metadata } from "next";
import { ObfuscatedEmailLink } from "@/components/contact-block";
import { EMAIL } from "@/lib/contact";
import { POSITIONING_PLACEHOLDER, WORK } from "@/lib/work";

export const metadata: Metadata = {
  description: POSITIONING_PLACEHOLDER,
  alternates: { canonical: "/" },
};

export default function Landing() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[80rem] flex-col gap-2xl px-md py-xl sm:px-xl sm:py-2xl">
      <header className="flex flex-col gap-sm">
        <h1 className="text-display">Guillem Gelabert</h1>
        <p className="text-standfirst">{POSITIONING_PLACEHOLDER}</p>
      </header>

      <ul role="list" className="flex list-none flex-col gap-xl">
        {WORK.map((work) => (
          <li key={work.href} className="flex flex-col gap-sm">
            <a className="text-heading link-quiet inline-flex min-h-6 items-center" href={work.href}>
              {work.title}
            </a>
            <p className="text-body max-w-prose">{work.annotation}</p>
          </li>
        ))}
      </ul>

      <p className="text-body">
        <ObfuscatedEmailLink address={EMAIL} tone="body" />
      </p>
    </main>
  );
}
