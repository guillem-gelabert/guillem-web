import { Source_Serif_4 } from 'next/font/google'

// Source Serif 4, the reading face of "The Value of Everything" reader's
// summary. Only posts with `theme: mazzucato` read it.
export const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-source-serif-4',
})
