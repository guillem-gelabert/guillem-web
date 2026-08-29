# Pitfalls Research

**Domain:** Content-led personal site (Next.js + Railway), migrating a 2020 Jekyll/GitHub Pages archive, typographic/constructivist aesthetic, job-search artifact for data-viz/data-journalism roles.
**Researched:** 2026-08-29
**Confidence:** HIGH for Next.js/Railway deployment mechanics (Context7 + Railway community reports + Next.js source); MEDIUM for Jekyll migration specifics (verified against the live legacy site); MEDIUM for accessibility/font claims (cross-referenced multiple sources); LOW/flagged where noted.

## Critical Pitfalls

### Pitfall 1: The repo's existing Dockerfile silently wins the Railway deploy and ships the wrong app

**What goes wrong:**
`Dockerfile` at the repo root currently does `FROM nginx:alpine` and copies a single static file (`prototype-stack.html`) plus `nginx.conf.template`, which just proxies `$PORT` to nginx serving that one HTML file. This was built for an earlier "MVP = hero + link" scope (see BRIEF.md §11, "conflicts with current planning docs"). Railway auto-detects a `Dockerfile` in the repo root and **prioritizes it over Nixpacks/Railpack with no configuration needed** — and there is no supported way to override this via `railway.toml`/`railway.json` short of removing or renaming the file. If the Next.js app is built and pushed without deleting this Dockerfile, Railway will happily build the nginx image, the deploy will go "green," the health check will pass (nginx serves valid HTML) — and production will serve last year's static placeholder instead of the real site. This is a silent-success failure: nothing errors, nothing crashes, the URL just serves the wrong thing.

**Why it happens:**
Leftover infra artifacts from a prior scope are easy to forget once the framework decision changes (plain React → Next.js per PROJECT.md Key Decisions). Nobody deletes a Dockerfile that "already works."

**How to avoid:**
Delete `Dockerfile` and `nginx.conf.template` at the start of the Next.js build-out (or replace the Dockerfile entirely with a Next.js multi-stage build using `output: 'standalone'`). If a Dockerfile is kept at all, it must `COPY` `.next/standalone`, `.next/static`, and `public/` and run `node server.js` — nginx has no role once Next.js serves its own Node process. Add a one-line CI/deploy checklist item: "grep the Dockerfile for `next build` or `.next/standalone` before every deploy that touches infra."

**Warning signs:**
`git grep nginx` or `git grep prototype-stack` still returning hits after the Next.js app exists. A Railway deploy that finishes in under 30 seconds (a real Next.js build never does). The live URL rendering a page with no Next.js dev tools/hydration in the browser console.

**Phase to address:**
Deployment/infra setup phase — first phase that touches Railway, before any content work lands.

---

### Pitfall 2: Jekyll's Liquid template syntax and Rouge-highlighted code blocks corrupt the migrated Markdown

**What goes wrong:**
Jekyll processes Liquid (`{% %}`, `{{ }}`) *before* Markdown rendering, including inside fenced code blocks. Any of the 13 legacy posts that used `{% highlight lang %}...{% endhighlight %}` (the old Jekyll code-block syntax, common in 2018-2020-era Jekyll sites, predating universal fenced-code adoption) or that referenced Liquid-like syntax inside a code sample (e.g. a Git or TypeScript post showing template-like strings) will not render as inert text in a Next.js/MDX pipeline the way they rendered in Jekyll — MDX has its own parsing rules (it treats bare `{` as a JS expression opener), so content that was safely inert Liquid syntax in Jekyll can outright break an MDX build, and content that used `{% raw %}...{% endraw %}` to escape Liquid will carry those literal tag strings into the new site if not stripped.

**Why it happens:**
Two different templating engines interpret curly-brace syntax completely differently; content authored for one is not portable to the other without a translation pass.

**How to avoid:**
Pull the *original Markdown source* from the `guillem-gelabert.github.io` repo (not scraped rendered HTML — see Pitfall 3). Before migrating each post: (1) search for `{% highlight`, `{% endhighlight %}`, `{% raw %}`, `{% endraw %}`, `{% include`, `{% post_url`, `{% link` and convert/strip each; (2) if using MDX (not plain Markdown via `next-mdx-remote`/`remark`), be stricter still — MDX will throw a build error on unescaped `{`/`<` inside prose, not just render it wrong. Prefer plain Markdown + `remark`/`rehype` (not MDX) for the migrated archive unless the new posts genuinely need JSX components in body copy — it removes an entire class of migration breakage.

**Warning signs:**
Build errors referencing "Unexpected token" or "Could not parse expression" in a migrated `.md`/`.mdx` file. Rendered code samples in the new site showing literal `{% ... %}` text.

**Phase to address:**
Content migration phase.

---

### Pitfall 3: URL/permalink drift breaks existing inbound links and forfeits search equity

**What goes wrong:**
The legacy site is live today at `guillem-gelabert.github.io`. A direct check of the site shows its permalinks are **`/posts/[slug]/`** — no date, no category segment, despite a categories archive existing (`/categories`, paginated at `/page/2/`) — so Jekyll's default date-based permalink was overridden with a custom one. Crawling the front page only surfaces 10 of the 13 known posts (missing Content-Security-Policy, Strict-Transport-Security, and X-XSS-Protection, which are on page 2 of the paginated index) — meaning a developer who "checks the site" for the URL list without also checking the repo source or a sitemap will miss exactly the posts most likely to have inbound links (CSP and HSTS are the two most commonly linked-to headers in security writing). If the new site's writing index uses a different slug shape (e.g. `/writing/csp` instead of `/posts/content-security-policy`), every existing bookmark, every link from another blog or Hacker News/Reddit thread, and any accumulated search ranking for those exact URLs is lost the moment the old site stops resolving them — and because the new site is launching on a different domain entirely (Railway's generated subdomain, not `guillem-gelabert.github.io`), path preservation alone doesn't solve this; a cross-domain redirect is also needed for the old URLs to survive.

**Why it happens:**
"Migrate the content" gets treated as "move the words," and URL structure is treated as an implementation detail rather than as the actual contract with the outside web (search indexes, other people's links, the developer's own memory of what he's linked to before).

**How to avoid:**
1. Get the authoritative list from the source repo (`guillem-gelabert.github.io` on GitHub) or its `sitemap.xml`, not from crawling the rendered homepage — confirm all 13 posts, not just the 10 visible on page 1.
2. Decide the new URL slug for each post *before* writing any migration code, and make it a 1:1, reversible mapping from the old `/posts/[slug]/` path (reusing the same slug under a new prefix, e.g. `/writing/[slug]`, is the lowest-risk choice — it keeps the mapping table trivial).
3. Because the new site currently lives on a **provisional Railway URL** (custom domain is an open question per BRIEF.md §12), don't build the redirect-from-old-domain infrastructure yet — that would point real traffic at a subdomain that may not exist in six months. Do fix the *new site's own* URL scheme now so it never has to change again once a custom domain lands (one redirect hop later — old domain → custom domain — instead of two).
4. When a custom domain is chosen, add redirect stubs on the GitHub Pages side (Jekyll `redirect_from` front matter, or plain meta-refresh HTML pages, since GitHub Pages can't do server-side 301s) pointing each old `/posts/[slug]/` at the new domain's equivalent path.

**Warning signs:**
No documented old→new slug mapping exists before migration starts. The writing index URL scheme is decided ad hoc per-post rather than as a single rule. Nobody has pulled the full 13-post list from the source repo (only from the rendered site).

**Phase to address:**
Content migration phase, decided before any post is written into the new system (URL scheme is a one-way door).

---

### Pitfall 4: Next.js Railway deploy fails or "succeeds" with broken assets — standalone output, PORT binding, sharp, and static file copying

**What goes wrong:**
Four distinct, well-documented failure modes stack on a first Railway + Next.js deploy:
- **Hardcoded port.** If the app (or a custom server) binds to a fixed port like `3000` instead of `process.env.PORT`, Railway's gateway can't route to it — the container starts, looks "up," and every request times out.
- **Missing `output: 'standalone'`.** Without it, Railway/Nixpacks still builds a working app, but the image ships the entire `node_modules` tree and full `.next` cache rather than the pruned standalone bundle — this is what actually causes most Railway build OOM/timeout complaints on Next.js, not the app being "too big."
- **Missing `sharp` in production.** Next.js's built-in Image Optimization requires `sharp` when running via `output: 'standalone'`; without it in the final image, image-optimized routes 500 at runtime even though the build succeeded and the rest of the site works fine — a partial, easy-to-miss failure since it only shows up on pages using `next/image`.
- **Forgetting to copy `public/` and `.next/static`.** The standalone output does not include static assets — a Dockerfile that copies only `.next/standalone` produces a server that runs and responds, but every CSS file, font, and public image 404s. The site "deploys successfully" and looks completely broken.

**Why it happens:**
Each of these is a real Next.js/Railway integration detail, not something obvious from a plain `next build && next start` local test — locally, `next start` doesn't use the standalone bundle at all, so none of these four issues reproduce until the exact Railway build path is exercised.

**How to avoid:**
Set `output: 'standalone'` in `next.config`. Use the official multi-stage Docker pattern: deps stage → build stage → runner stage that copies `public/`, `.next/standalone`, and `.next/static` explicitly, sets `ENV PORT=3000` and `ENV HOSTNAME="0.0.0.0"`, and runs `node server.js`. Install `sharp` in the stage that ships to production (or set `NEXT_SHARP_PATH`). Read the actual port from `process.env.PORT` — never hardcode it, since Railway assigns it dynamically per deploy.

**Warning signs:**
Deploy succeeds but the live URL times out on every request (port binding). Build fails with heap-allocation errors during `next build` on Railway even though it builds fine locally on a machine with more RAM (missing standalone output bloating the build). Images specifically are broken/500 while everything else works (missing sharp). CSS/fonts are missing entirely though HTML renders (missing static asset copy).

**Phase to address:**
Deployment/infra setup phase.

---

### Pitfall 5: Email obfuscation that either fails against scrapers or breaks for real users/screen readers

**What goes wrong:**
The brief calls for "obfuscated email" in the contact block. Three tempting approaches all fail in a specific way: (1) client-side JavaScript reassembly (à la Cloudflare's old email-obfuscation trick) stops naive regex scrapers but is trivially defeated by any headless-browser scraper (Puppeteer/Playwright execute the JS and read the DOM) — and it silently breaks for the shrinking-but-nonzero population of users/bots browsing without JS, including some assistive tech configurations. (2) CSS tricks (reversed text visually flipped back with `direction: rtl` or `unicode-bidi`, or content injected via `::before`/`::after` pseudo-elements) look correct to sighted users but are frequently misread by screen readers, and pseudo-element content is not selectable/copyable — a real user who wants to actually copy the address into their mail client cannot. (3) Rendering the address as an image defeats simple scrapers and looks fine visually, but is unselectable, uncopyable, invisible to screen readers, and is not actually robust — OCR-based scrapers can still read it.

**Why it happens:**
"Obfuscated" gets treated as a binary (hidden vs not) rather than as a spectrum of scraper sophistication traded against real accessibility cost, and the easy-to-implement options (JS reassembly, CSS reversal) are exactly the ones with the worst accessibility failure modes.

**How to avoid:**
The best-documented balance for a real, low-effort personal site: split the address across HTML entities / a simple character-substitution scheme (e.g. `guillem [at] domain [dot] ch` rendered as normal selectable text, or entity-encoded `&#64;`) rather than JS reconstruction or CSS tricks — this defeats the majority of unsophisticated scrapers (still overwhelmingly regex/pattern-based against raw HTML) while remaining a normal, selectable, screen-reader-readable text node. If a clickable `mailto:` is wanted, build the `href` at build/render time from parts (still readable by any scraper that executes JS, but this is an acceptable trade — a determined scraper will get any email a human can reach anyway; the actual goal is deterring cheap harvesting, not achieving cryptographic protection). Whatever the final choice, test it by (a) tabbing to it with a keyboard, (b) reading it with VoiceOver/NVDA, and (c) selecting and copying it — all three must work.

**Warning signs:**
The email is implemented as an image or is generated purely by client-side JS with no `<noscript>` fallback and no real text node in the DOM. A screen reader reads the address as garbled characters or individual reversed letters. Right-click "copy email address" does nothing because the visible text isn't the real text.

**Phase to address:**
Contact-block build phase (small, but do the accessibility test before calling it done — it's cheap to get wrong and cheap to verify).

---

### Pitfall 6: The "looks like data, isn't" aesthetic trap (BRIEF.md §8) shipping unnoticed

**What goes wrong:**
BRIEF.md is explicit: any composition that adopts *chart signifiers specifically* — axes, tick marks, plotted points, gridlines, anything implying an encoded scale — will be read as a chart by this exact audience (graphics editors, people who build charts for a living), and if it encodes nothing real, it reads as either incompetence or dishonesty in front of the one audience segment most primed to notice. This is easy to violate accidentally: a decorative diagonal-line motif that happens to include tick marks, a background pattern with dot-grid points that looks like a scatter plot, a section divider styled with axis-like rules. Pure geometry (wedges, diagonals, planes, type-as-structure) carries none of this risk — the danger is specifically the middle ground of "decoration with axes."

**Why it happens:**
Constructivism (the chosen aesthetic source, per BRIEF.md §8) and data visualization share literal visual vocabulary — that's the whole reason it was chosen — so the same geometric moves that look great as pure ornament can accidentally cross into "this implies an encoded value" territory without the designer/developer intending it.

**How to avoid:**
Concrete, checkable rule for every decorative geometric element added to the design system: **does this element take a data prop, or is every coordinate/length/angle hardcoded?** If hardcoded and the shape includes anything that reads as an axis, tick, or plotted point — remove the signifier (drop the ticks, drop the axis line, keep the diagonal/wedge/plane) or bind it to real data (the backlog, per BRIEF.md §7, is explicitly named as the one object that can legitimately be rendered as a chart, because it's real data). Run a "does this look like a chart to a chart-literate person" gut check on every ornamental component during design review, specifically asking whether axes/ticks/points are present and whether they encode anything.

**Warning signs:**
Any SVG/canvas decorative component with variable names like `axis`, `tick`, `scale`, `xValue`/`yValue` where the values are constants, not props. A component that would look at home in a D3 chart's axis layer but has no data source feeding it.

**Phase to address:**
Design system / component build phase — check at component-review time, not at final QA, since retrofitting is more expensive than catching it at first build.

---

### Pitfall 7: The dateless, stateless backlog reads as a wishlist (BRIEF.md §7, anti-goal #4 — explicitly accepted risk in PROJECT.md)

**What goes wrong:**
PROJECT.md records this as a **known, accepted risk**: the user chose backlog items with name + rich-text description only, explicitly against BRIEF.md §7's advice to add dates/states/a shipped column. BRIEF.md's own language is blunt about the failure mode: "a backlog that never moves becomes evidence of not finishing — the worst available reading," and anti-goal #4 is literally "started a lot, finished nothing." Without any temporal or state signal, a visitor scanning for 90 seconds cannot distinguish "this is what Guillem is actively doing right now" from "this is a list of ideas he wrote down once and never touched again" — and because the audience is explicitly people evaluating whether this person *finishes things*, that ambiguity resolves in the worst direction by default, not a neutral one.

**Why it happens:**
The decision removes the only two signals (recency, movement) that would let the format do the work automatically, while keeping the requirement that the section read as "active" rather than "aspirational" — those two things are now in tension and nothing in the data model resolves it.

**How to avoid:**
Since dates/states are off the table by explicit decision, the burden shifts entirely to copy discipline and curation, both cheap to do at build time:
- **Write each description in progress-report voice, not wishlist voice.** "Currently sourcing commodity-flow data for X, blocked on licensing" reads as active without a timestamp; "Would like to do something with maps someday" reads as a wishlist regardless of formatting. This is a writing constraint to enforce during content drafting, not an engineering one.
- **Curate aggressively — cap the visible list short.** 3-5 items reads as a working set; 12 items reads as a graveyard of intentions, dated or not.
- **Order by editorial priority, most-recently-relevant first**, using list position as an implicit recency signal even without an explicit date field.
- **Placement matters**: keep the backlog below the featured case study and the shipped-work list, so it functions as supporting texture rather than the primary evidence of "does this person finish things" — reducing the blast radius if it does read as static.
- Flag for the user directly (not silently override the decision): a single section-level "last touched" note (one date for the whole section, not per item) would resolve most of the risk without contradicting "no dates, no states" on individual items — this is worth raising explicitly before build, since it's a small addition that closes most of the gap.

**Warning signs (post-launch, checkable without waiting months):**
Every description reads in future/aspirational tense ("I want to," "someday," "would be cool to"). A test reader, asked "does this feel like things Guillem is doing now, or a list of ideas," answers "ideas." The list is long enough that no single item stands out as current. Six months post-launch, the section is byte-identical to launch while the rest of the site has visibly changed (checkable via git history on that content).

**Phase to address:**
Copywriting/content phase for the backlog entries themselves (voice and curation); flag the "one section-level timestamp" mitigation to the user during requirements/roadmap definition, since it's a decision that should be made deliberately rather than defaulted.

---

### Pitfall 8: Broken or missing Open Graph/Twitter metadata — the site previews badly when pasted into Slack

**What goes wrong:**
The primary distribution channel for this site is exactly the scenario named in the brief — someone pastes the link into Slack, an email, or a shortlist doc. Next.js's Metadata API resolves `openGraph`/`twitter` fields per-route via `generateMetadata`, but several defaults trip up a first pass: `metadataBase` must be an absolute URL for OG image/canonical resolution to work correctly — if it's left unset or pointed at `localhost`, generated `og:image` URLs resolve to relative or `localhost` paths that Slack's unfurler can't fetch, so the link preview shows no image or a broken one. Because this site deploys to a **Railway-generated URL that can change** (no custom domain yet, per PROJECT.md), `metadataBase` needs to track the actual live domain via an environment variable set correctly in the Railway dashboard for the production environment — not hardcoded, and not left to fall back to a dev default. `robots.txt` metadata also merges non-additively per route (a child route's `robots` field fully overwrites the parent's, it does not deep-merge) — an easy way to accidentally leave a low-value route (or none at all) unindexed or, worse, accidentally set `noindex` too broadly from a layout-level default.

**Why it happens:**
Metadata correctness is invisible in normal local dev — `next dev` never triggers the failure mode where a relative OG image URL fails to resolve, and nobody pastes their own localhost link into Slack to test the unfurl.

**How to avoid:**
Set `metadataBase` from an explicit `NEXT_PUBLIC_SITE_URL` (or equivalent) environment variable, configured in the Railway dashboard for the production service, not inferred. Provide a real, absolute `og:image` per key page (landing page, case study, CV) at the standard 1200×630 size. Actually paste the live Railway URL into Slack (or use a link-preview debugger) as a manual test step before considering the site done — don't rely on believing the metadata is correct. Generate a real `sitemap.xml` (Next.js `sitemap.ts` route) and `robots.ts`, and verify the resolved `robots` value per route rather than assuming layout-level settings inherit correctly.

**Warning signs:**
Pasting the production URL into Slack shows no preview image, or shows a broken-image icon. `view-source:` on the deployed site shows `<meta property="og:image" content="/some/relative/path">` instead of a full `https://` URL. `robots.txt` on the live site is empty, missing, or blocks routes that should be indexed.

**Phase to address:**
SEO/metadata pass — should be a checklist item in the same phase that wires up deployment (env vars) and revisited once the final domain is confirmed.

---

## Moderate Pitfalls

### Pitfall 9: Rouge/Pygments syntax-highlighting classes don't carry over to the new site's highlighter
**What goes wrong:** Jekyll's default highlighter (Rouge) emits `<div class="highlight"><pre><code>` with Pygments-style token classes (`.k`, `.s`, `.nx`, etc.). Most Next.js MDX pipelines use Shiki (via `rehype-pretty-code`) or highlight.js, which emit entirely different class names/inline styles. If the migrated posts' code blocks are copied as rendered HTML rather than re-run through the new site's highlighter from raw Markdown, the code samples in the Git/TypeScript/security-header posts will render as unstyled plain text (or with orphaned CSS classes that match nothing in the new stylesheet).
**Prevention:** Migrate from the original Markdown source and let the new site's own highlighter process every code fence fresh — never carry over pre-rendered `<div class="highlight">` HTML.
**Phase to address:** Content migration phase.

### Pitfall 10: Jekyll frontmatter/filename date mismatch
**What goes wrong:** Jekyll posts are typically named `YYYY-MM-DD-slug.md` with the date implicit in the filename, not necessarily in the frontmatter body. A migration script that only reads frontmatter fields will silently produce postswith no publish date, or a wrong one, if the date lived in the filename.
**Prevention:** Extract the date from the filename explicitly during migration (or from git log history as a cross-check) and write it into the new content's frontmatter/schema; verify against the visible "posted on" date already rendered on each legacy page before decommissioning access to the old repo.
**Phase to address:** Content migration phase.

### Pitfall 11: Extreme type weights/condensed widths and letter-spacing break screen-reader pronunciation and contrast
**What goes wrong:** A typographic/constructivist aesthetic invites large display type at heavy weights, condensed widths, and generous letter-spacing for structural headings. Two concrete accessibility failures follow: (1) CSS `letter-spacing` wide enough to visually "space out" a word can cause VoiceOver and other screen readers to read the word letter-by-letter instead of as a whole word — a documented, reproducible bug, not a hypothetical; (2) heavy/condensed display faces at large sizes can still fail WCAG contrast minimums if paired with a mid-value brand color rather than tested against the actual rendered weight (contrast ratio math should be checked against large-text thresholds — 3:1 — only where the type genuinely qualifies as "large text" per WCAG's point-size/weight definition, not assumed).
**Prevention:** Cap letter-spacing on real words (fine for isolated glyphs/logotype treatments, not for words a screen reader will announce); run every heading style through a contrast checker at its actual rendered size/weight, not just against the base palette; keep body copy in a non-condensed face regardless of what the display type does.
**Phase to address:** Design system / component build phase.

### Pitfall 12: Motion sneaks in below the "Typographic tier" line without a `prefers-reduced-motion` check
**What goes wrong:** "No performative motion" (PROJECT.md constraint) is easy to honor at the level of "no scroll-driven hero" while still shipping small hover transitions, list-reveal animations, or transform-based micro-interactions that ignore `prefers-reduced-motion`. These are individually minor, but they violate WCAG 2.3.3 intent and are exactly the kind of motion a visitor with vestibular sensitivity would want disabled — and are easy to add later without anyone re-checking the constraint.
**Prevention:** Gate all CSS transitions/animations behind a `@media (prefers-reduced-motion: no-preference)` wrapper (or equivalent JS check) from the first component built, not retrofitted at the end.
**Phase to address:** Design system / component build phase.

### Pitfall 13: Font loading undermines the very thing it's supposed to demonstrate
**What goes wrong:** On a type-led design, the headline/body typeface *is* the craft signal — so FOUT/FOIT or layout shift on font load is a worse failure here than on a generic site, because it's visibly undercutting the design argument in the first 90 seconds. Loading fonts from `fonts.googleapis.com` via a plain `<link>` also adds an extra DNS+TLS round trip on the critical path and — for a site whose audience includes European newsroom contacts — creates the same IP-disclosure-to-Google issue a German court (Landgericht München, Jan 2022) ruled a GDPR violation, specifically because self-hosting was available and not used.
**Prevention:** Use `next/font/google` or `next/font/local`, which self-hosts font files at build time (same-origin, no third-party request, no GDPR exposure) and auto-generates fallback-font metric overrides to reduce layout shift on swap. Set `display` explicitly per font role — `swap` for body copy, consider `optional` for a distinctive display face where a fallback substitution would look visually broken rather than just "different." If only one or two static weights are actually used, don't ship a full variable font file just to have the axis available — pick the smaller of (one variable font) vs (N static weight files) based on actual usage count.
**Phase to address:** Design system / component build phase (fonts should be wired up before any typographic component is built on top of them, not retrofitted).

### Pitfall 14: The photograph becomes the uncontrolled LCP element
**What goes wrong:** On a text-first landing page, the one photograph is a likely Largest Contentful Paint candidate by sheer pixel area, and if it's dropped in as a plain `<img>` without explicit dimensions or priority hints, it both shifts layout on load (CLS) and delays LCP behind non-critical resources.
**Prevention:** Use `next/image` with explicit `width`/`height` (or an aspect-ratio-locked container with `fill`), mark it `priority` if it's above the fold, and confirm `sharp` is present in production (see Pitfall 4) since Next Image Optimization silently 500s without it.
**Phase to address:** Landing-page assembly phase.

### Pitfall 15: Generic-developer-portfolio drift (anti-goal #5)
**What goes wrong:** BRIEF.md ranks this the least likely but still-real failure — a build that, section by section, converges on the same hero-about-skills-projects-contact template every bootstrapped portfolio uses, even while nominally following the brief. PROJECT.md's own Out-of-Scope list (card grids, three-across rows, blog-primary homepage at launch volume) exists specifically to prevent this drift; the risk is that any one of those gets quietly reintroduced mid-build because it's the "normal" way to build a portfolio section.
**Prevention:** At each landing-page section's implementation, check it against the Out-of-Scope list in PROJECT.md by name before merging — if a section matches an explicitly excluded pattern, that's the signal, not a judgment call.
**Phase to address:** Landing-page assembly phase, as a review gate rather than a one-time check.

## Minor Pitfalls

### Pitfall 16: CV page breaks under print
**What goes wrong:** A CV built as an in-design-system HTML page (tight measures, negative margins, brand-color backgrounds typical of a constructivist layout) often looks correct on screen but is unreadable or ugly when a recruiter hits Cmd/Ctrl+P to save it as a PDF — a very likely real-world action for this specific artifact.
**Prevention:** Add a `@media print` stylesheet pass — collapse to single-column, force dark-text-on-white, remove decorative backgrounds — and manually test print-to-PDF once before shipping.
**Phase to address:** CV page build.

### Pitfall 17: Railway preview/PR deploys get indexed
**What goes wrong:** If Railway is later configured with preview environments per branch/PR, each preview gets its own URL; if `robots`/metadata isn't environment-aware, a preview deploy can get crawled and indexed as a duplicate of production.
**Prevention:** Gate `robots: { index: false }` behind a check on the deploy environment (e.g. `VERCEL_ENV`-equivalent Railway environment variable), not just on `NODE_ENV`.
**Phase to address:** Deployment/infra setup phase (only relevant once/if preview deploys are added — not a v1 blocker given a single production service).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|-----------------|------------------|
| Scrape rendered HTML from the old Jekyll site instead of pulling Markdown source from the repo | Faster to start migrating | Carries over Rouge highlighting classes, loses original frontmatter/dates, may miss paginated posts (see Pitfall 3, 9, 10) | Never — the source repo is available and free to clone |
| Ship without `output: 'standalone'` because `next start` works locally | One less config line | Railway build cost/memory balloons, first real deploy fails for a reason invisible in local dev | Never for Railway/Docker deploys |
| Use MDX for the migrated archive "in case" body components are needed later | Slight future flexibility | Every Liquid-syntax-shaped code sample in the legacy posts becomes a build-breaking edge case (Pitfall 2) | Only if a specific post genuinely needs embedded JSX; default to plain Markdown otherwise |
| Skip the `robots.txt`/OG-image pass for v1, "add SEO later" | Ships faster | The site fails at its actual job (being found, previewing well when shared) for the entire window it's being actively shared during a job search | Never — this is table stakes for a job-search artifact, not a nice-to-have |
| Leave the backlog without any temporal signal, per the explicit decision | Simpler data model, no state-machine to design | Reads as evidence for anti-goal #4 if copy discipline lapses (Pitfall 7) | Acceptable only if the copy-voice and curation mitigations in Pitfall 7 are actually enforced, not just decided |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|-------------------|
| Railway (build) | Assuming Nixpacks/Railpack is used by default once Next.js is added, without checking for a leftover Dockerfile | Explicitly confirm which builder Railway is using per deploy (build logs state it); delete/rename any Dockerfile not intended for production |
| Railway (runtime) | Hardcoding a port instead of reading `process.env.PORT` | Always bind to `process.env.PORT`; never assume a fixed port number across environments |
| Railway (env vars) | Setting `NEXT_PUBLIC_SITE_URL`/`metadataBase` only in `.env.local`, forgetting to also set it in the Railway dashboard for the production service | Configure the variable explicitly per Railway environment; verify by inspecting resolved metadata on the live deploy, not just locally |
| Next.js Image Optimization | Relying on `next/image` in standalone/Docker without installing `sharp` in the production image | Install `sharp` in the stage that ships to production, or set `NEXT_SHARP_PATH` |
| GitHub Pages (legacy site) | Treating the old site as a static archive with nothing left to do once content is copied | The old site still needs a resolution plan (kept live as-is until custom domain lands, then redirect stubs added) — it doesn't just disappear |
| Google Fonts | Loading via `<link href="fonts.googleapis.com">` instead of `next/font` | Use `next/font/google`, which self-hosts at build time — same performance and GDPR benefit as manual self-hosting with none of the manual font-file management |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| Missing `output: 'standalone'` | Railway build is slow, memory-heavy, or times out even for a small app | Set `output: 'standalone'` in `next.config` | First Docker/Railway build once the app has real dependencies, not necessarily locally |
| `next/image` without `sharp` in production | Images 500 at runtime while rest of the site works | Install `sharp` in the production image stage | Any page using `next/image` in standalone mode |
| Font loaded from third-party CDN | Extra DNS/TLS round trip, visible FOUT, GDPR exposure | Use `next/font` self-hosting | Immediately, on first content-full paint |
| Photograph without explicit dimensions | CLS on load, delayed LCP | `next/image` with explicit size or aspect-ratio container, `priority` if above the fold | As soon as the photo is added to the landing page |
| Full variable font shipped for 1-2 static weight uses | Larger font payload than necessary | Compare variable-font-file size vs sum of needed static weight files; ship whichever is smaller | Only matters once more than one weight/width axis position is actually used in the design |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Loading fonts from Google's CDN directly instead of self-hosting | Discloses EU visitors' IP addresses to Google without consent — ruled a GDPR violation by a German court (Jan 2022); relevant given the target audience includes European newsroom contacts | Use `next/font` (self-hosts automatically) |
| Client-side-only email reconstruction with no accessible fallback | Not actually a security risk to the site, but a false sense of protection — headless-browser scrapers defeat it trivially while real users on JS-disabled/some assistive setups lose the address entirely | Use simple text-substitution obfuscation (character/entity splitting) that degrades gracefully rather than JS-dependent reconstruction |
| The legacy security-headers blog series ships without the site itself demonstrating those headers | Undercuts the content's credibility directly — a security-headers series on a site with no CSP/HSTS/X-Content-Type-Options set is a visible, checkable contradiction for exactly the audience most likely to open dev tools | Set the headers the posts describe on the new site itself (via Next.js `headers()` in `next.config`, verified with a header-check tool post-deploy) |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| Backlog reads as a wishlist | Reviewer concludes "started a lot, finished nothing" — the exact anti-goal it exists to avoid | Progress-report copy voice, tight curation, position below stronger evidence (Pitfall 7) |
| Decorative geometry with chart signifiers | Reviewer concludes "looks like data, isn't" in front of the audience most likely to notice | Strip axis/tick/point signifiers from anything not bound to real data (Pitfall 6) |
| Broken link preview when the URL is shared | The single most common real-world use of this site (pasting into Slack/email during a job search) fails silently | Test the actual production URL in a real Slack message before considering launch done (Pitfall 8) |
| Legacy post migrated with broken code formatting | Undercuts the technical-craft signal on exactly the content meant to demonstrate it | Re-render every code block from source through the new highlighter (Pitfall 9) |

## "Looks Done But Isn't" Checklist

- [ ] **Railway deploy:** Confirm the build logs show Railway using the Next.js builder/Dockerfile you intend — not a leftover static-file Dockerfile from an earlier scope.
- [ ] **Static assets on Railway:** Load the live URL and check that CSS, fonts, and public images all return 200 (not just the HTML shell) — standalone output does not auto-copy `public/`/`.next/static`.
- [ ] **Image optimization:** Load a page using `next/image` on the live Railway deploy specifically (not local dev) — confirm it doesn't 500 due to missing `sharp`.
- [ ] **Every migrated post:** Confirm its exact old URL (from the source repo/sitemap, all 13 posts, not just what's visible on the old homepage's first page) has either an identical new path or a working redirect plan.
- [ ] **Every migrated code block:** Confirm it renders with real syntax highlighting in the new site, not as plain unstyled text or literal `{% highlight %}` tags.
- [ ] **Link preview:** Paste the actual production Railway URL into a real Slack message (or a link-preview debugger) and confirm title, description, and image all render.
- [ ] **Email contact:** Tab to it with a keyboard, read it with a screen reader, and select-and-copy it — all three must work, not just "look right visually."
- [ ] **CV page:** Print-to-PDF it once and confirm it's legible, not just correct on screen.
- [ ] **Reduced motion:** Toggle `prefers-reduced-motion: reduce` in devtools and confirm all transitions/animations actually stop, not just the ones remembered during initial build.
- [ ] **Decorative geometry:** For every ornamental SVG/canvas element, confirm it either has no axis/tick/point signifiers, or is genuinely bound to real data (the backlog).

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|----------------|------------------|
| Stale Dockerfile deployed to production | LOW | Delete/replace the Dockerfile, redeploy — no data loss, just a wasted deploy cycle |
| URL/permalink mismatch discovered post-launch | MEDIUM | Add redirects retroactively (Next.js `redirects()` in `next.config`, or Railway/edge-level rewrite rules); search-equity loss during the gap is not fully recoverable but stops compounding once fixed |
| Backlog reads as stale/wishlist after launch | LOW-MEDIUM | Rewrite descriptions in progress-report voice, prune the list, revisit the "one section-level timestamp" mitigation with the user |
| Chart-signifier ornament shipped | LOW | Remove axis/tick/point elements from the specific component; this is a targeted CSS/SVG fix, not a redesign |
| Broken email obfuscation shipped | LOW | Swap the implementation for a text-substitution approach; no data migration involved |
| Font/image performance regressions found post-launch via Core Web Vitals | LOW-MEDIUM | Add `next/font` self-hosting or `next/image` sizing after the fact; a straightforward swap, not an architectural change |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|----------------|
| Stale Dockerfile wins the deploy (1) | Deployment/infra setup | Build logs confirm correct builder; live URL shows the real Next.js app, not the static placeholder |
| Liquid/Rouge syntax corrupts migrated content (2, 9) | Content migration | Every migrated post builds clean from source Markdown with real syntax highlighting |
| URL/permalink drift (3) | Content migration (decided before any post lands) | Old→new slug mapping table exists and covers all 13 posts, confirmed against source repo, not just the rendered homepage |
| Standalone output / PORT / sharp / static assets (4) | Deployment/infra setup | Live Railway deploy serves CSS/fonts/images correctly and `next/image` routes don't 500 |
| Email obfuscation accessibility (5) | Contact-block build | Keyboard, screen-reader, and copy-paste test all pass |
| Chart-signifier trap (6) | Design system / component build | Every decorative geometric component reviewed against the axis/tick/point checklist |
| Backlog reads as wishlist (7) | Copywriting/content (backlog entries) + explicit user decision on section-level timestamp | Test-reader check: "active work or idea list?" |
| Broken OG/metadata previews (8) | SEO/metadata pass, tied to deployment env-var setup | Real Slack paste test of the production URL |
| Frontmatter/date mismatch (10) | Content migration | Migrated post dates cross-checked against legacy site's visible dates |
| Extreme type/letter-spacing accessibility (11) | Design system / component build | Contrast checker run at actual rendered weight/size; VoiceOver/NVDA read-through of headings |
| Motion without reduced-motion gate (12) | Design system / component build | `prefers-reduced-motion: reduce` toggle test |
| Font loading regressions (13) | Design system / component build | `next/font` used exclusively; Lighthouse/CWV check for CLS and font-load timing |
| Photograph as uncontrolled LCP (14) | Landing-page assembly | `next/image` with explicit dimensions/priority; CWV LCP check |
| Generic-portfolio drift (15) | Landing-page assembly (ongoing review gate) | Each section checked against PROJECT.md's Out-of-Scope list |
| CV print breakage (16) | CV page build | Manual print-to-PDF check |
| Preview-deploy indexing (17) | Deployment/infra setup (only if/when preview environments are added) | `robots` value confirmed environment-aware |

## Sources

- [Next.js: `output` config reference (standalone, export limitations)](https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/05-config/01-next-config-js/output.mdx) — HIGH confidence (Context7, official docs)
- [Next.js official Docker example (multi-stage standalone build)](https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile) — HIGH confidence
- [Next.js: `generateMetadata` API reference](https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/04-functions/generate-metadata.mdx) — HIGH confidence
- [Next.js: sharp missing in production](https://nextjs.org/docs/messages/sharp-missing-in-production) — HIGH confidence
- [Next.js: install sharp message](https://nextjs.org/docs/messages/install-sharp) — HIGH confidence
- [Next.js font optimization / `next/font` docs](https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/02-components/font.mdx) — HIGH confidence
- [Next.js memory usage guide](https://nextjs.org/docs/app/guides/memory-usage) — HIGH confidence
- [Railway: Deploy a Next.js App guide](https://docs.railway.com/guides/nextjs) — MEDIUM-HIGH confidence (official Railway docs)
- [Railway Central Station: builder priority (Dockerfile over Nixpacks) discussions](https://station.railway.com/questions/builder-not-changing-from-dockerfile-to-0079fa6a) — MEDIUM confidence (community reports, consistent across multiple threads)
- [DEV Community: Railway.io config mistakes](https://dev.to/jeah84/-5-railwayio-config-mistakes-that-silently-break-deployments-and-how-to-fix-them-5c44) — MEDIUM confidence
- Live fetch of `guillem-gelabert.github.io` (permalink structure, post inventory, pagination gap) — MEDIUM-HIGH confidence, direct observation; recommend cross-checking against the source repo before finalizing the migration mapping
- [Jekyll Liquid raw/endraw code-fence trap discussions](https://mcgarrah.org/jekyll-liquid-code-fence-rendering-trap/), [ozzieliu.com on Liquid-in-Markdown](https://ozzieliu.com/2016/04/26/writing-liquid-template-in-markdown-with-jekyll/) — MEDIUM confidence
- [Nick Tomlin: Migrating from Jekyll to Next.js](https://nick-tomlin.com/posts/my-migrating-from-jekyll-to-next-technical-challenges/) — MEDIUM confidence, single-source real-world account
- [Email obfuscation: what works in 2026 (Lobsters/DEV Community discussion)](https://dev.to/onsen/email-obfuscation-what-works-in-2026-3oma) — MEDIUM confidence, cross-referenced across multiple 2026 sources
- [Adrian Roselli: Don't Override Screen Reader Pronunciation](https://adrianroselli.com/2023/04/dont-override-screen-reader-pronunciation.html), [Accessible Website Services: letter spacing and screen readers](https://accessiblewebsiteservices.com/accessible-content-letter-spacing-screen-readers/) — MEDIUM confidence
- [WP Tavern / The Hacker News / decoded.legal: Munich court Google Fonts GDPR ruling, Jan 2022](https://thehackernews.com/2022/01/german-court-rules-websites-embedding.html) — MEDIUM-HIGH confidence, corroborated across multiple independent sources, though the ruling itself is German-court-specific (not EU-wide binding precedent)
- `BRIEF.md` (repo root) §7, §8, §9, §11 — primary source for anti-goals, the aesthetic trap, and the backlog risk
- `.planning/PROJECT.md` — primary source for the accepted-risk framing of the dateless backlog decision
- `notes.md` (repo root) — primary source for the legacy post inventory (13 posts across 3 series)
- `Dockerfile`, `nginx.conf.template` (repo root) — primary source for Pitfall 1, read directly

---
*Pitfalls research for: guillem-web v1.0 "Working Site" milestone*
*Researched: 2026-08-29*
