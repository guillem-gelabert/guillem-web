import type { ScreenKind } from "@/components/gameboy-screen";

/**
 * A marker for a Game Boy post: from here down, the page is shown on a
 * different screen. It draws nothing; GameboyScreen reads its position.
 */
export function ScreenSwitch({ to }: { to: ScreenKind }) {
  return <div className="screen-switch" data-screen-switch={to} aria-hidden="true" />;
}
