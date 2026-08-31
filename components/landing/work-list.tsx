import { WORK } from "@/lib/work";

// role="list" is required and not redundant: Safari drops list semantics
// when list-style: none is applied, so the role restores what the CSS
// removes.
export function WorkList() {
  return (
    <ol role="list" className="flex list-none flex-col gap-xl">
      {WORK.map((entry, index) => {
        // border-rule is not optional. Tailwind v4's preflight emits
        // `border: 0 solid` with NO colour, so a bare border-t falls
        // through to currentColor and renders full ink — an 8x darker line
        // than --color-rule and a fourth rule weight the Prose Contract
        // forbids (Pitfall 1 / WR-06). No clsx/cn here: the repo has no
        // class-composition helper and must not gain one for this.
        const liClassName =
          "flex flex-col gap-sm" + (index > 0 ? " border-t border-rule pt-xl" : "");

        return (
          <li key={entry.href} className={liClassName}>
            {/* The <ol> already conveys order and count to assistive tech;
                a visible "01" read aloud as "zero one" is noise. */}
            <p className="text-label" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </p>
            {/* The title is the ONLY link in the row: the annotation is not
                linked and the host label is not linked, matching the
                shipped /writing index's headline-is-the-only-link rule. */}
            <h3 className="text-standfirst">
              <a className="link-quiet" href={entry.href}>
                {entry.title}
              </a>
            </h3>
            <p className="max-w-prose text-body">{entry.annotation}</p>
            {/* The outbound marker. Not an arrow glyph or icon (this site
                ships zero icons, and U+2197 is not a character Newsreader
                can be relied on to carry) — the host line names where the
                link goes. Same tab: no new-window attribute, and therefore
                no rel attribute — with no new window there is no
                window.opener to close. Do not "harden" this by opening the
                link in a new tab; that reopens the reverse-tabnabbing
                surface this design deliberately avoids. */}
            <p className="text-label">{entry.host}</p>
          </li>
        );
      })}
    </ol>
  );
}
