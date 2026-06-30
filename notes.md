# guillem-web — Notes

## Log

---

## Goal

Personal brand site to support a job search targeting data viz, creative dev, and animation studios (The Pudding, Reuters Graphics, NZZ Visuals, SRF Data, Interactivethings, etc.).

Not a generic dev portfolio — the site itself should feel like Guillem before anyone reads a word. The execution *is* the pitch.

---

## Design direction

- **Aesthetic:** El Lissitzky — constructivist geometry, bold typography, kinetic feel
- **Tone:** personal brand (you as a person/creator, projects are one piece)
- **Reference feel:** itssharl.ee (best), p5aholic.me (second) — minimal copy, technical quality visible immediately

---

## Ideas

### Interaction / visual
- **Hero:** name in a width-variable font, ultra condensed + full screen height on load. As you scroll down, font gets less condensed until it reaches a normal readable size. Feel: iPhone clock expanding when scrolling up to reveal notifications, but more exaggerated.
- **Three.js 3D elements** somewhere on the page
- **Scrollytelling** as a structural pattern
- **Microinteractions** throughout — planned after completing Josh Comeau's animation course

### Structure (MVP first)
- **MVP (now):** variable font hero + GitHub link. Nothing else.
- **Next:** project showcase, about/POV section, contact
- **Later:** blog (see below)

### Blog
See "Blog content ideas" section below.

---

## Existing content (guillem-gelabert.github.io, 2020)

### Security Headers series
- X-XSS-Protection
- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- Referrer-Policy
- X-Frame-Options
- X-Powered-By
- X-Permitted-Cross-Domain-Policies

### Git series
- Git aliases
- Git Amend
- Git Undo
- Git Rebase Interactive

### TypeScript
- Fix typing issues locally with `paths`

---

## Blog content ideas

### Security headers: exploitation walkthroughs
Pair each header post with a companion post showing the actual attack the header prevents. Demo on OWASP WebGoat, HackTheBox, or DVWA (Damn Vulnerable Web App). Format: attack first, then defence. Makes the posts memorable and practical vs. pure documentation.

Candidates per header:
- **CSP** → XSS injection demo
- **X-Frame-Options** → Clickjacking demo
- **Strict-Transport-Security** → SSL stripping / downgrade attack
- **Referrer-Policy** → Data leakage via referrer in URLs
- **X-Content-Type-Options** → MIME sniffing / content injection
- **X-XSS-Protection** → Reflected XSS (and why the header is now deprecated/counterproductive)

### Project deep-dives (technical learnings)
Long-form posts on the technical side of personal projects — not "what I built" but "what I learned building it."

- **Pop-up book simulator (Three.js):** Blender → three.js pipeline, rigging paper mechanisms in 3D, GLSL shaders for paper material, configurability architecture
- **Data-Driven Stories:** data sourcing and cleaning, D3/scrollytelling implementation, balancing journalistic and technical decisions

---

## Inspiration

### ★★★ [itssharl.ee](https://itssharl.ee/fr) — Sharlee (Charles Bruyerre)
Graphic designer, UX/UI, front-end dev. Tagline: "Matérialisation des formes."
- Polished WebGL/Three.js hero, strong motion design
- Clean nav, minimal text, work lets the visuals lead
- **Borrow:** Quality of motion execution, restraint in copy

### ★★☆ [p5aholic.me](https://p5aholic.me/) — Keita Yamada
Designer & developer (Osaka). Awwwards SOTY. Stack: Three.js + GLSL background, GSAP animations, Alpine.js.
- Extremely minimal UI — just a name, title, and scrolling project list
- Light/Dark/Monospaced theme switcher
- Work is purely client-facing (no personal projects)
- **Borrow:** Confidence of minimal text, GLSL background as personality signal

### ★☆☆ [lauren-waller.com](https://lauren-waller.com/) — Lauren Waller
Product designer & Framer dev. Image-heavy carousel hero, clear 4-section nav (Work / About / Shop / Contact).
- More conventional structure — useful as content reference
- **Borrow:** Section clarity, how she handles the "available for work" signal

### ★☆☆ [tamalsen.dev](https://tamalsen.dev/) — Tamal Sen
Front-end & app developer. WordPress-based, traditional portfolio.
- Sections: expertise → work → experience → contact
- Testimonials block is effective
- **Borrow:** Content structure, expertise-first ordering

### ★★☆ [vytautastattoo.com](https://vytautastattoo.com/) — Vytautas
Tattoo artist. Included for brand voice, not visual design.
- Extremely strong POV ("Healed First®" standard — every decision is for how it ages)
- Anti-trend positioning, copy-driven, no portfolio grid
- **Borrow:** Confidence of a clear point of view, writing that takes a stand
