// A post's backdrop: a seamless tile repeated behind the whole page
// (front-matter `backdrop`, lib/content.ts). Fixed, so the text scrolls over
// it, and under everything (-z-10 against the body's paper, which html
// hands to the canvas).
//
// The one in use is the Hempton post's DeepDream tile
// (scripts/deepdream-tile.py). It is 1024px and shown at 1024 CSS px: its
// features are a fixed pixel size, and halving it for retina made them too
// fine to read as a dream. It shows at full strength: the text never sits
// on it, only on the white panels app/globals.css gives a backdrop post
// (.backdrop-panel, .backdrop-columns).
export function PostBackdrop({ src }: { src: string | undefined }) {
  if (!src) return null;
  return (
    <div
      aria-hidden="true"
      className="post-backdrop pointer-events-none fixed inset-0 -z-10"
      style={{
        backgroundImage: `url(${src})`,
        backgroundRepeat: "repeat",
        backgroundSize: "1024px 1024px",
      }}
    />
  );
}
