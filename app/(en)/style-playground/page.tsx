import type { Metadata } from "next";
import { SeamPlayground } from "./seam-playground";

export const metadata: Metadata = {
  title: "Style Playground",
  description: "A responsive conical-gradient geometry study.",
  robots: { index: false },
};

export default function StylePlaygroundPage() {
  return <SeamPlayground />;
}
