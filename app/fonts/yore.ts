import localFont from 'next/font/local'

// Yore in Peril M'lord, from the "11 Game Boy Font Pack" (variable-width
// cut). An 8-dot pixel face: drawn on a 1024-unit em with 128-unit pixels,
// ascent 6 and descent 2, so it is only ever set at whole multiples of the
// Game Boy dot (components/gameboy-screen.tsx owns that size). Headings on
// posts with `theme: gameboy`; nothing else reads it.
export const yore = localFont({
  src: './Yore-in-Peril.ttf',
  display: 'block',
  variable: '--font-yore',
})
