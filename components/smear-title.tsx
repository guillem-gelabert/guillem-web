"use client";

import { useSmearHeading } from "@/components/smear-heading/use-smear-heading";

type SmearTitleProps = {
  as?: "h1" | "h2";
  className?: string;
  children: React.ReactNode;
};

// The only new client boundary in this phase. Phase 1 marked whole page
// files as Client Components to reach the scroll-trail hook; repeating
// that on a post route would drag the compiled MDX module, its component
// imports, and every Shiki token span into the client bundle. This
// four-line leaf keeps the page above it a Server Component while its
// Humane title still carries the trail.
export function SmearTitle({ as: Tag = "h1", className, children }: SmearTitleProps) {
  const ref = useSmearHeading<HTMLHeadingElement>();

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
