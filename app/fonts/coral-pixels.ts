import { Coral_Pixels } from 'next/font/google'

// Coral Pixels (tanukifont, OFL): title and body on posts with
// `theme: gameboy` (components/gameboy-screen.css). A colour font whose pixels are 77 units
// on a 1000-unit em, so 13 pixels to the em: set at 13 × n Game Boy dots
// each font pixel lands on n whole dots.
export const coralPixels = Coral_Pixels({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-coral-pixels',
})
