import localFont from 'next/font/local'

// Departure Mono 1.500 (Helena Zhang, OFL 1.1), from the
// official release. An 11px pixel face: set at 11px (or whole multiples)
// each font pixel is one CSS px. The colour-depth explorer's NES-style UI
// (components/mdx/colour-depth) is the only reader, so it is not preloaded.
export const departureMono = localFont({
  src: './DepartureMono-Regular.woff2',
  display: 'swap',
  preload: false,
  variable: '--font-departure-mono',
})
