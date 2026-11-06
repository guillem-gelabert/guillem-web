// A right arrow drawn on Coral Pixels' grid, because the font has no arrow
// glyphs and a fallback "→" arrives as a smooth outline among pixel letters.
// Coral Pixels has 13 font pixels to the em (77 units on a 1000 em), so one
// viewBox unit here is 1/13 em: at the Game Boy body size that is exactly
// one dot. Sits on the baseline, seven pixels tall like the x-height
// letters, with a 2-pixel stroke like the font's own ">". The real "→"
// stays in the text for screen readers and copy-paste.
const ROWS = [
  "....##..",
  ".....##.",
  "########",
  "########",
  ".....##.",
  "....##..",
  "........",
];

const WIDTH = 9; // eight drawn columns and one of spacing, as the font's glyphs carry
const HEIGHT = ROWS.length;

export function PixelArrow() {
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width={`${WIDTH / 13}em`}
        height={`${HEIGHT / 13}em`}
        shapeRendering="crispEdges"
        fill="currentColor"
        style={{ display: "inline", verticalAlign: "baseline" }}
        data-testid="pixel-arrow"
      >
        {ROWS.flatMap((row, y) =>
          [...row].map((cell, x) => (cell === "#" ? <rect key={`${x},${y}`} x={x} y={y} width={1} height={1} /> : null)),
        )}
      </svg>
      <span className="sr-only">→</span>
    </>
  );
}
