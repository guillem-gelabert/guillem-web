"use client";

import { useSmearHeading } from "@/components/smear-heading/use-smear-heading";
import type { WorkShot } from "@/lib/work";

type SmearShotProps = {
  shot: WorkShot;
};

/**
 * The disc — the story's thumbnail, masked to a circle — carrying the scroll
 * trail.
 *
 * A client leaf for the same reason components/smear-title.tsx is one: it
 * reaches the trail registry, and keeping it to this element leaves
 * story-slot.tsx and the landing route above it Server Components.
 *
 * It registers with "boxShadow" rather than the registry's default
 * "textShadow". The layer syntax is identical, and because box-shadow
 * respects border-radius, a border-radius: 50% element smears as a trail of
 * circles — the same gesture the nameplate makes with its glyphs. The
 * headline does NOT trail: it is set on an arc around this disc and stays
 * flat, so the trail belongs to the picture alone.
 *
 * Every attribute below is the same as the plain <img> this replaces, and
 * for the same reasons — see the comment in story-slot.tsx.
 */
export function SmearShot({ shot }: SmearShotProps) {
  const ref = useSmearHeading<HTMLImageElement>("boxShadow");

  return (
    // eslint-disable-next-line @next/next/no-img-element -- no `sharp` at runtime; see components/portrait.tsx
    <img
      ref={ref}
      src={shot.src}
      alt={shot.alt}
      width={shot.width}
      height={shot.height}
      loading="eager"
      fetchPriority="low"
      className="seam-shot"
    />
  );
}
