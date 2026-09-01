import { EDUCATION, EXPERIENCE, LANGUAGES, selectedWork } from "@/lib/cv";

// The work list's shipped row rhythm (components/landing/work-list.tsx:8,17),
// reused verbatim across every section below: 32px air between rows, a
// hairline rule from the second row on. border-rule is not optional —
// Tailwind v4 preflight emits `border: 0 solid` with no colour, so a bare
// border-t falls through to currentColor and renders full ink, an 8x darker
// line than --color-rule and a fourth rule weight the Prose Contract forbids.
const LIST_CLASSNAME = "flex list-none flex-col gap-xl";

function rowClassName(index: number): string {
  return "flex flex-col gap-sm" + (index > 0 ? " border-t border-rule pt-xl" : "");
}

// Called only once EXPERIENCE is non-empty (app/(en)/cv/page.tsx branches on
// EXPERIENCE.length before rendering this at all), so the Experience section
// always has at least one row here. Education and Languages are independent
// user-supplied facts and are guarded on their own length — an h2 heading
// the author never filled must not render over an empty list (D-02).
//
// Selected work is not gated the same way: selectedWork.work is lib/work.ts's
// WORK tuple, a fixed two-entry array by type (D-03), so it is always
// non-empty whenever this component renders at all.
//
// v2 note (D-1.4): no print stylesheet ships in this phase — PROF-06 stays
// v2 — but nothing below depends on a screen-only treatment for legibility:
// semantic sectioning, no negative margins, no background-dependent
// contrast. A later print pass is therefore a stylesheet addition, not a
// markup change.
export function CvSections() {
  return (
    <>
      <section aria-labelledby="experience-head" className="flex flex-col gap-lg">
        <h2 id="experience-head" className="section-head">
          Experience
        </h2>
        <ol role="list" className={LIST_CLASSNAME}>
          {EXPERIENCE.map((role, index) => (
            <li key={`${role.org}-${role.years}`} className={rowClassName(index)}>
              {/* D-1.3: one Label-role line — years, role, organisation,
                  place — and one Body-role line underneath saying what the
                  work was ABOUT, never a duties list. The same "about, not
                  built-with" rule WORK-02 imposes on the work list,
                  applied to employment. */}
              <p className="text-label">
                {role.years}: {role.role}, {role.org}, {role.place}
              </p>
              <p className="max-w-prose text-body">{role.note}</p>
            </li>
          ))}
        </ol>
      </section>

      {EDUCATION.length > 0 ? (
        <section aria-labelledby="education-head" className="flex flex-col gap-lg">
          <h2 id="education-head" className="section-head">
            Education
          </h2>
          <ol role="list" className={LIST_CLASSNAME}>
            {EDUCATION.map((entry, index) => (
              <li key={`${entry.institution}-${entry.years}`} className={rowClassName(index)}>
                <p className="text-label">
                  {entry.years}: {entry.qualification}, {entry.institution}, {entry.place}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {LANGUAGES.length > 0 ? (
        <section aria-labelledby="languages-head" className="flex flex-col gap-lg">
          <h2 id="languages-head" className="section-head">
            Languages
          </h2>
          <ol role="list" className={LIST_CLASSNAME}>
            {LANGUAGES.map((entry, index) => (
              <li key={entry.language} className={rowClassName(index)}>
                <p className="text-label">
                  {entry.language}: {entry.level}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section aria-labelledby="selected-work-head" className="flex flex-col gap-lg">
        <h2 id="selected-work-head" className="section-head">
          Selected work
        </h2>
        {/* Verbatim reuse of components/landing/work-list.tsx's row shape:
            the title is the only link in the row, the annotation says what
            the piece is about (never what it was built with), and the host
            line names the outbound destination rather than an icon or arrow
            glyph — this site ships zero icons and zero in-page SVG. Same
            tab: no target="_blank", so no rel attribute either. */}
        <ol role="list" className={LIST_CLASSNAME}>
          {selectedWork.work.map((entry, index) => (
            <li key={entry.href} className={rowClassName(index)}>
              <h3 className="text-standfirst">
                <a className="link-quiet" href={entry.href}>
                  {entry.title}
                </a>
              </h3>
              <p className="max-w-prose text-body">{entry.annotation}</p>
              <p className="text-label">{entry.host}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
