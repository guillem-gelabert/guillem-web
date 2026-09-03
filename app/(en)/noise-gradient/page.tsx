import type { Metadata } from "next";
import { NoiseGradient } from "./noise-gradient";

export const metadata: Metadata = {
  title: "Noise gradient",
  description:
    "A single-colour conic study: a three- or five-tone ramp from light tint to dark shade, joined by noise-dithered transitions.",
  robots: { index: false },
};

export default function NoiseGradientPage() {
  return <NoiseGradient />;
}
