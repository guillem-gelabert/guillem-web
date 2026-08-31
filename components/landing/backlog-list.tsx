import { BACKLOG } from "@/lib/backlog";

// The work list's row grammar (D-10), minus three affordances (D-11): no
// ordinal, no destination host line, and the name is plain text, not a
// link. The absence is the marker — a later reader must not "restore"
// them. <ul>, not <ol>: the backlog is unranked (D-11.1). role="list" is
// required and not redundant: Safari drops list semantics when
// list-style: none is applied.
export function BacklogList() {
  return (
    <ul role="list" className="flex list-none flex-col gap-xl">
      {BACKLOG.map((item, index) => {
        // border-rule is not optional. Tailwind v4's preflight emits
        // `border: 0 solid` with NO colour, so a bare border-t falls
        // through to currentColor and renders full ink — an 8x darker
        // line than --color-rule and a fourth rule weight the Prose
        // Contract forbids. Carried from work-list.tsx:11-13; this is a
        // recurring defect in this repo. No clsx/cn: the repo has no
        // class-composition helper and must not gain one for this.
        const liClassName =
          "flex flex-col gap-sm" + (index > 0 ? " border-t border-rule pt-xl" : "");

        return (
          <li key={item.name} className={liClassName}>
            {/* No ordinal (D-11.1) — the work list marks order with a
                hidden-from-assistive-tech "01"/"02" line here; the
                backlog is unranked and gets none. */}
            <h3 className="text-standfirst">{item.name}</h3>
            <p className="max-w-prose text-body">{item.description}</p>
            {/* No host line (D-11.2) — backlog items go nowhere; there
                is no destination to name. No link on the name either
                (D-11.3) — it stays plain text, unstyled as a navigation
                affordance. */}
          </li>
        );
      })}
    </ul>
  );
}
