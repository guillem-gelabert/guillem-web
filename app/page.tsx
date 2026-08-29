"use client";

import { useSmearHeading } from "@/components/smear-heading/use-smear-heading";

export default function Home() {
  const headingRef = useSmearHeading<HTMLHeadingElement>();

  return (
    <main className="flex min-h-screen flex-col justify-center gap-md px-lg">
      <h1 ref={headingRef} className="text-display">
        Guillem Gelabert
      </h1>
      <p className="text-body">Developer.</p>
    </main>
  );
}
