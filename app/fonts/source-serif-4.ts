import { Source_Serif_4 } from 'next/font/google'

// The headline face of theme: pink-paper (components/pink-paper.tsx), a
// display serif in the place a business paper sets its headlines. Only
// posts with that theme read it. The optical-size axis is what makes it a
// display face at headline sizes.
export const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-source-serif-4',
})
