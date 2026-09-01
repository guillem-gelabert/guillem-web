# The backlog write API

Added 2026-09-01, after v1.0 closed. Three endpoints, one table, no admin UI.

## Where it lives

**Use the Railway origin, not the apex:**

```
https://web-production-9cedb.up.railway.app/api/backlog
```

> ⚠️ `https://guillemgelabert.com/api/backlog` returns **404**. The apex is fronted by the
> `guillem-edge` Cloudflare Worker, which lives in a different repository and does not forward
> `/api/*` to this service. Page requests are forwarded fine — only this path is not. Nothing in
> this repo can fix it, and `audit.md` § 2.5 records that this milestone attaches and detaches
> nothing at the edge. Add an `/api/*` passthrough to that Worker if you want the apex to work.

## The token

Set on the Railway `web` service as `BACKLOG_API_TOKEN`. Read it back with:

```
railway variables --service web --kv | grep BACKLOG_API_TOKEN
```

It is 43 characters of base64url from `crypto.randomBytes(32)`. To rotate, set a new one — the
endpoint reads it per request, so a variable change plus the redeploy it triggers is the whole
rotation. A token shorter than 32 characters disables the endpoint entirely (503), on purpose.

## Usage

```bash
TOKEN=$(railway variables --service web --kv | grep BACKLOG_API_TOKEN | cut -d= -f2-)
API=https://web-production-9cedb.up.railway.app/api/backlog

# list
curl -s $API -H "Authorization: Bearer $TOKEN"

# add
curl -s -X POST $API \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"…","description":"…"}'

# remove (ids come from the list)
curl -s -X DELETE $API/<id> -H "Authorization: Bearer $TOKEN"
```

## What it enforces, and why

| Rule | Response | Reason |
|---|---|---|
| Bearer token required, on **every** verb including GET | 401 | GET returns the ids DELETE consumes; handing those out unauthenticated is a gift to whoever finds a hole in DELETE |
| No token configured, or shorter than 32 chars | **503**, not 401 | "The server cannot authenticate anybody" and "your token is wrong" send a debugger to different places |
| Exactly two fields, `name` and `description` | 422, naming the extra field | D-06. Silently dropping `href` would let the caller's misunderstanding survive a 201 |
| Both strings, non-empty, ≤120 / ≤600 chars, no control characters | 422, **all errors at once** | Fixing a request should not be a game of twenty questions |
| At most 4 items | 409 `reason: "full"` | D-02. Curation is the backlog's entire premise; an unbounded list is a wishlist |
| No duplicate name, case-insensitive | 409 `reason: "duplicate"` | — |
| Body ≤16KB | 413 | Checked before the body is buffered, and again after, because `Content-Length` is caller-supplied |
| Malformed JSON | 400 | — |

409 rather than 400 for the last two is deliberate: the request is well-formed and would succeed
against different server state. That is what tells a caller to delete something and retry rather
than to go fix their payload.

Whitespace is collapsed on the way in, so a here-doc's newlines never reach the database. Markup and
SQL are **accepted** and stored as literal text — React escapes on output and every query is
parameterised, so rejecting apostrophes or angle brackets would be cargo-cult defence that breaks a
legitimate title like `Zürich's <untitled> corpus`.

## How it interacts with the rest of the site

**The site still builds and renders with no database.** That is load-bearing, not a nicety:
`next build` runs without `DATABASE_URL` locally and in CI, `tests/build/prerender.test.ts` asserts
against that build's HTML, and 173 Playwright specs run against `next dev`. `lib/backlog.tsx`'s
`BACKLOG` is both the **seed** (written into the table the first time it is found empty) and the
**fallback** (served whenever no database is configured, or a configured one is unreachable).
`getBacklog()` never throws — a paused Postgres costs a visitor the freshest version of three
sentences, not the landing page.

The write path takes the opposite posture and throws. A write that silently did nothing and returned
201 would be far worse than a 500.

**The landing page revalidates every 60s**, and a successful write calls `revalidatePath("/")`, so
the window is a staleness ceiling rather than a typical wait. `/` is still a static asset for
almost every visitor.

**"Last touched" is now derived** — `max(created_at)` across the live rows, which is the honest
reading BACK-02 always specified. Seeded rows are inserted with `created_at = LAST_TOUCHED`, not
`now()`: seeding with `now()` would make a fresh deploy of three-week-old items claim they were
touched today, the exact overclaim the section-level date exists to prevent. The date can move
backwards when the newest item is deleted, which is correct.

## Editing an item

Delete it and add it again. There is no PATCH and no reorder — one round trip more, one concept
less. `DELETE` exists at all because the four-item ceiling would otherwise brick the API after four
calls.

## If you change the seed

Editing `BACKLOG` in `lib/backlog.tsx` changes what a **fresh** database gets seeded with and what
the site renders **without** one. It does not change an already-seeded database — use the API for
that.

If you change any item's **wording** there, `BACKLOG_CONTENT_SHA256` must be updated alongside
`LAST_TOUCHED`; the two are one claim. `npm run test:unit` fails with the recompute command in the
message. Reformatting, retyping or re-commenting the module needs neither.
