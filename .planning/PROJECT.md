# Guillem Web

## What This Is

A personal brand website for Guillem, a developer targeting roles in data journalism, data visualization, creative development, and adjacent studio work. It is not a generic portfolio site: the site itself needs to communicate visual taste, technical craft, and curiosity before a visitor reads much copy.

The initial release is intentionally ultra-minimal. It will ship as a single-page React site centered on a variable-font hero and a GitHub link, with later expansions for project showcase, point-of-view/about content, contact, and eventually long-form data-story or technical writing.

## Core Value

The website must immediately signal that Guillem is a highly creative developer with strong technical ability and broad curiosity about the kinds of subjects that power compelling data stories.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Ship a single-page React site with an expressive hero that feels distinctive and personal rather than portfolio-generic.
- [ ] Use the visual execution itself to support Guillem's job search in data journalism, data visualization, creative development, and animation or interactive studios.
- [ ] Keep the initial MVP intentionally minimal: a variable-font hero and a GitHub link only.

### Out of Scope

- Multi-page portfolio structure — deferred until there is a finished data story or stronger body of work to showcase.
- Contact, CV, LinkedIn, and broader outbound profile links — excluded from the first release to preserve focus on the minimal concept.
- Blog or writing archive — deferred until the core site direction is established and there is finished material worth publishing.

## Context

- The target audience is a mix of hiring managers, recruiters, editors or newsroom leads, and creative studios or agencies.
- The desired impression after roughly two minutes is that Guillem is a very creative person with deep knowledge and curiosity across multiple subject areas such as economics and the environment, not just someone who can code.
- The positioning is explicitly against a generic developer portfolio. The execution is part of the pitch.
- The design direction is influenced by constructivist geometry, bold typography, and kinetic motion, with inspiration drawn from sites like `itssharl.ee` and `p5aholic.me`.
- Planned future directions include project showcase, about/POV, contact, blog posts, microinteractions, scrollytelling patterns, and possible Three.js elements.
- Existing older writing includes security headers, Git topics, and TypeScript notes, which may later inform a blog or writing section.

## Constraints

- **Tech stack**: React — already decided for implementation.
- **Structure**: Single page for the first release — expand only after there is a finished data story to support broader content.
- **MVP scope**: Hero plus GitHub link only — the narrowness is intentional to force clarity and strong execution.
- **Hosting**: Railway — deployment target is already chosen.
- **Positioning**: Must feel like Guillem before any text is read — this constrains visual and interaction decisions more than conventional portfolio norms.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Start with an ultra-minimal MVP | A minimal surface keeps focus on execution quality and avoids filling the site with weak or premature content | — Pending |
| Make the site single-page for now | There is no finished data story yet, so a broader information architecture would be premature | — Pending |
| Include only GitHub as the initial outbound link | Keeps the first version focused and avoids diluting the concept with standard portfolio scaffolding | — Pending |
| Use React | Stack choice already made | — Pending |
| Optimize for hiring in data journalism, data visualization, and creative development | The site is a job-search asset, not a general personal homepage | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check -> still the right priority?
3. Audit Out of Scope -> reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-04 after initialization*
