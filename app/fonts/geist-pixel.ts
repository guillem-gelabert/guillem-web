import { Geist_Pixel } from 'next/font/google'

// Vercel's pixel cut of Geist, offered by the ?dev font picker on Game Boy
// posts (components/gameboy-screen.tsx) with its one axis, ELSH, the shape
// each pixel is drawn as. Not preloaded: nothing uses it by default.
export const geistPixel = Geist_Pixel({
  subsets: ['latin'],
  weight: 'variable',
  axes: ['ELSH'],
  preload: false,
  variable: '--font-geist-pixel',
})
