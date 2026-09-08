import { Jost } from 'next/font/google'

// The landing tagline only. Geometric — a Futura descendant — which is what
// the line is set in.
//
// No `axes` entry here, unlike the other faces that carry one: Jost ships a
// weight axis and nothing else, so the tagline's extended look comes from
// letter-spacing in landing-seam.module.css rather than from a `wdth` the
// font does not have. That is a real difference, not a substitution:
// tracking moves the letters apart, it does not widen the letterforms.
export const jost = Jost({
  subsets: ['latin'],
  weight: 'variable',
  // 'optional', matching humane.ts, not 'swap' like the two text faces. The
  // tagline is a nowrap, justified line sitting directly under a ~300px
  // name, so a late swap is an unmetered reflow of exactly the element
  // whose fit is load-bearing. tests/font-cls.spec.ts is what holds this.
  display: 'optional',
  variable: '--font-jost',
})
