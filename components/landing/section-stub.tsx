type SectionStubProps = {
  state: string;
  body: string;
};

// The backlog and contact placeholders (D-02): one component, two copy
// sets. Copy lives at the call site in app/(en)/page.tsx, not in
// lib/locales.ts — the landing is English-only for v1 (UI-SPEC §
// Localisation) and only homeLink crosses into the shared UI map. Reproduces
// the shipped /writing empty-state shape exactly: a Standfirst line stating
// the state, then a Body line stating what is happening.
export function SectionStub({ state, body }: SectionStubProps) {
  return (
    <div className="flex flex-col gap-md">
      <p className="max-w-prose text-standfirst">{state}</p>
      <p className="max-w-prose text-body">{body}</p>
    </div>
  );
}
