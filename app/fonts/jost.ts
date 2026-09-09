import { Jost } from 'next/font/google'

// The site's body face — every reading register, the labels, the landing
// tagline. It replaced Newsreader, the serif that held --font-body from
// Phase 1 to 2026-09-09. Geometric, a Futura descendant.
//
// Both styles: the prose's <em> and blockquote set in italic, and
// tests/prose-typography.spec.ts proves the italic file actually loaded
// rather than the browser slanting the roman.
//
// No `axes` entry here, unlike the other faces that carry one: Jost ships a
// weight axis and nothing else, so the tagline's extended look comes from
// letter-spacing in landing-seam.module.css rather than from a `wdth` the
// font does not have. That is a real difference, not a substitution:
// tracking moves the letters apart, it does not widen the letterforms.
export const jost = Jost({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  // 'optional', matching humane.ts, not the 'swap' Newsreader used. The
  // tagline is a nowrap, justified line sitting directly under a ~300px
  // name, so a late swap is an unmetered reflow of exactly the element
  // whose fit is load-bearing; tests/font-cls.spec.ts is what holds this.
  // The cost is the other way round: on a first visit slow enough to miss
  // the block period, that visit reads the fallback sans throughout. The
  // file is self-hosted and preloaded, so that window is small.
  display: 'optional',
  variable: '--font-jost',
})
