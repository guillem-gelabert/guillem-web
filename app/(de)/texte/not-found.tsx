import { NotFoundBody } from "@/components/not-found-body";

// This segment's own localised not-found boundary. Reached via
// dynamicParams = true + an explicit notFound() call in [slug]/page.tsx,
// never via a routing-layer 404 (there is no global not-found with two root
// layouts). No error boundary anywhere in this plan: UI-SPEC is explicit
// that a malformed post fails next build rather than degrading a visitor's
// request, so there is no runtime error state to build for.
//
// The body itself lives in components/not-found-body.tsx, shared with
// app/(en)/writing/not-found.tsx and both CR-01 proxy-rewritten reserved
// pages — four copies of two locales is how the German drifts.
export default function TexteNotFound() {
  return <NotFoundBody locale="de" />;
}
