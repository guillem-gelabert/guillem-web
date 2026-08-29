// The single typographic wrapper around compiled MDX/Markdown output.
// `@tailwindcss/typography` stays as the element-selection engine
// (`prose prose-neutral`); `max-w-none` cancels its own measure so
// `.prose-site` (app/globals.css) supplies every visible value, including
// the 65ch reading measure.
export function Prose({ children }: { children: React.ReactNode }) {
  return <div className="prose prose-neutral max-w-none prose-site">{children}</div>;
}
