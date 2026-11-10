import { Archivo } from 'next/font/google'

// Archivo, the display/UI face of "The Value of Everything" reader's summary
// (~/Developer/personal/value-mazzucato). Only posts with `theme: mazzucato`
// read it, through components/value-screen.tsx.
export const archivo = Archivo({
  subsets: ['latin'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-archivo',
})
