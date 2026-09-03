import type { Metadata } from "next";
import { NoiseGradient } from "./noise-gradient";

export const metadata: Metadata = {
  title: "Noise gradient",
  description: "A monochrome-noise and conical-gradient blend-mode study.",
  robots: { index: false },
};

export default function NoiseGradientPage() {
  return <NoiseGradient />;
}
