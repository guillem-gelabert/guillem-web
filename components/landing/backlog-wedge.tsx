import type { BacklogItem } from "@/lib/backlog";
import styles from "./backlog-wedge.module.css";

type BacklogWedgeProps = {
  // Passed in, like BacklogList's: the page owns the fetch
  // (lib/backlog-store.ts), this only renders.
  items: readonly BacklogItem[];
};

// The backlog as the landing's closing mark: a red wedge in the mirrored
// scene's bottom-left corner, its slope parallel to the seam, holding the
// names and nothing else. The descriptions stay in lib/backlog.tsx for the
// day the backlog has a page of its own.
//
// The bullets alternate square and circle, the two shapes the projects grid
// is made of. They are CSS (backlog-wedge.module.css), not glyphs: the
// site's non-Latin character budget is the two arrows
// (tests/design-budget.spec.ts), so a • is out.
//
// <ul>, not <ol>: the backlog is unranked (D-11.1). role="list" restores
// the semantics Safari drops with list-style: none.
export function BacklogWedge({ items }: BacklogWedgeProps) {
  return (
    <aside aria-labelledby="seam-backlog-title" className={`seam-backlog ${styles.wedge}`}>
      <h2 id="seam-backlog-title" className={`seam-backlog-title ${styles.title}`}>
        Backlog ({items.length})
      </h2>
      <ul role="list" className={`seam-backlog-list ${styles.list}`}>
        {items.map((item, index) => (
          <li
            key={item.name}
            className={`seam-backlog-item ${styles.item}`}
            data-shape={index % 2 === 0 ? "square" : "circle"}
          >
            {item.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}
