import { channels, type ContactChannel } from "@/lib/contact";

type ContactBlockProps = {
  // Mirrors channels()'s own parameter shape rather than inventing a new
  // one. Left undefined, each argument falls through to channels()'s own
  // default (EMAIL/LINKEDIN/GITHUB), so both call sites (/ and /cv) render
  // <ContactBlock /> with no arguments. Plan 06-09's Playwright spec passes
  // `email` in directly so the three-part accessibility test (tab to it,
  // read it, select and copy it) can be proven against a real address
  // rather than only against absence.
  email?: string | null;
  linkedin?: string | null;
  github?: string;
};

// D-2.2: standalone Label-role links take inline-block + padding-block: 4px
// for the WCAG 2.5.8 24px target floor — the same shape
// components/landing/contents-nav.tsx and components/language-switch.tsx
// already ship for exactly this reason.
const VALUE_LINK_CLASSNAME = "text-label link-quiet inline-block py-xs";

/**
 * The email row's only escape hatch on the entire site (T-06-22).
 *
 * React SSR escapes `&` in BOTH text nodes and attribute values — measured
 * across all four {text, attribute} x {entity, plain} combinations
 * (06-RESEARCH.md Pattern 2 / Pitfall 3). So `<span>{"a&#64;b"}</span>`
 * ships as `a&amp;#64;b` on the wire, and writing the entity straight into
 * JSX text doesn't survive either: JSX decodes literal entities in *source*
 * at compile time, so `&#64;` in JSX text becomes a plain `@` before React
 * ever sees it. Both paths fail, and neither fails loudly — the page just
 * quietly ships a broken obfuscation and a broken `mailto:`.
 * `dangerouslySetInnerHTML` is the only route left to real entities in the
 * emitted bytes.
 *
 * This is safe here, and confined to here. `address` is always either the
 * `EMAIL` module constant from lib/contact.ts or, for this component's own
 * exercise by tests, a literal test string passed as a prop — this site has
 * no user input anywhere: no forms, no query-parameter rendering, no
 * database. The goal is deterring cheap regex/DOM-scrape harvesting, not
 * cryptographic protection: a determined scraper reads any address a human
 * can read, and that is explicitly accepted (T-06-27, D-2.3). This pattern
 * must never spread beyond this one component — grep for
 * `dangerouslySetInnerHTML` across app/, components/ and lib/ should find
 * exactly this line.
 */
function entityEncode(value: string): string {
  return value.replace(/@/g, "&#64;").replace(/\./g, "&#46;");
}

function EmailRow({ address }: { address: string }) {
  const encoded = entityEncode(address);

  return (
    <li className="flex flex-col gap-xs">
      <p className="text-label">Email</p>
      <span
        dangerouslySetInnerHTML={{
          __html: `<a class="${VALUE_LINK_CLASSNAME}" href="mailto:${encoded}">${encoded}</a>`,
        }}
      />
    </li>
  );
}

function ValueRow({ channel }: { channel: ContactChannel }) {
  if (channel.label === "Email") {
    return <EmailRow address={channel.value} />;
  }

  return (
    <li className="flex flex-col gap-xs">
      <p className="text-label">{channel.label}</p>
      {/* Same tab, no target="_blank", therefore no rel attribute — with no
          new window there is no window.opener to close (T-06-23). This
          keeps tests/build/prerender.test.ts's
          doesNotMatch(/target="_blank"/) assertion on the landing HTML
          passing. */}
      <a className={VALUE_LINK_CLASSNAME} href={channel.value}>
        {channel.value}
      </a>
    </li>
  );
}

/**
 * D-2.2: one component, two call sites — the #contact section on / and the
 * foot of /cv — reading one data module. Renders a labelled list of plain
 * links: no icons, because the design system ships zero icons and zero
 * in-page SVG site-wide.
 *
 * Absence renders as absence (components/language-switch.tsx's shipped
 * null-rather-than-greyed-out pattern): channels() already returns only the
 * non-null rows, so an empty result here means every channel is absent, and
 * the whole component returns null rather than an empty <ol> or a disabled
 * row. No branch here ever renders a "coming soon" placeholder — the caller
 * (app/(en)/page.tsx) supplies its own fallback copy for that state.
 */
export function ContactBlock({ email, linkedin, github }: ContactBlockProps = {}) {
  const rows = channels(email, linkedin, github);

  if (rows.length === 0) {
    return null;
  }

  return (
    <ol role="list" className="flex list-none flex-col gap-lg">
      {rows.map((channel) => (
        <ValueRow key={channel.label} channel={channel} />
      ))}
    </ol>
  );
}
