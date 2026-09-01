import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { BACKLOG_MODULE, LAST_TOUCHED, backlogContentFingerprint, backlogSource } from "./backlog-source.ts";

// D-09.2's repo-tier freshness guard: the module's newest change must never
// be later than the hand-set LAST_TOUCHED. Two halves, deliberately
// separated (05-RESEARCH.md Q1 §H):
//
//   1. The pure predicate (isStale) — runs unconditionally, on every
//      invocation, including when the environment half below skips.
//   2. The environment probe (lastChangeDate) — five branches, four of
//      which are skips. A guard that has never been observed failing is a
//      claim, not a guard (Task 3 of this plan proves all three fail on a
//      real defect); a skip with no stated reason is indistinguishable
//      from a pass in TAP output, which is why every skip below carries a
//      reason through BOTH t.skip and t.diagnostic.

const ROOT = process.cwd();

// ---------------------------------------------------------------------------
// Half one — the pure predicate. Always runs.
// ---------------------------------------------------------------------------

// ISO YYYY-MM-DD strings order lexicographically exactly as they order
// chronologically, so no Date is constructed here and none of its
// timezone hazards apply.
export function isStale(lastTouched: string, lastChange: string): boolean {
  return lastChange > lastTouched;
}

// This half is what runs on EVERY invocation, even in environments where
// the git probe below skips (shallow clone, no .git, no git binary).
// Mirrors how assertFrontmatter is tested directly at
// tests/unit/content.test.ts:93-136, rather than by proving a build fails.

test("isStale: module changed after the claim -> true", () => {
  assert.equal(isStale("2026-01-01", "2026-01-02"), true);
});

test("isStale: same day as the claim -> false", () => {
  assert.equal(isStale("2026-01-01", "2026-01-01"), false);
});

test("isStale: claim newer than the change -> false (allowed — the hand-set date may run ahead of the last edit; that is the whole point of D-09's hand-set date)", () => {
  assert.equal(isStale("2026-01-05", "2026-01-01"), false);
});

test("isStale: month boundary", () => {
  assert.equal(isStale("2026-01-31", "2026-02-01"), true);
});

// ---------------------------------------------------------------------------
// Half two — the environment probe. Five branches, verified against real
// fixtures in 05-RESEARCH.md Q1 §C-G. Do not put git anywhere near
// `next build` — this file is the only place in the repo that invokes git,
// and test:unit is never called by the build script.
// ---------------------------------------------------------------------------

type GitResult = { ok: true; out: string } | { ok: false; reason: string };

// argv array, never a shell string, never a shell-mode spawn, never a
// string-interpolated subprocess call (Security Domain: command
// injection, T-05-07).
function git(args: string[]): GitResult {
  const r = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  if (r.error) {
    return { ok: false, reason: `git not runnable (${(r.error as NodeJS.ErrnoException).code})` };
  }
  if (r.status !== 0) {
    return { ok: false, reason: (r.stderr || "").trim() || `git exited ${r.status}` };
  }
  return { ok: true, out: r.stdout.trim() };
}

type Verdict = { skip: string } | { source: string; date: string };

function lastChangeDate(): Verdict {
  // rev-parse --is-inside-work-tree — NOT a directory-existence check on
  // ".git". In a linked git worktree, .git is a FILE, not a directory,
  // and this project's executors run in linked worktrees, so a
  // directory-existence probe on ".git" would skip in exactly the
  // environment the guard is meant to cover — the "silently never runs"
  // failure in its purest form.
  const inRepo = git(["rev-parse", "--is-inside-work-tree"]);
  if (!inRepo.ok || inRepo.out !== "true") {
    return { skip: `no git work tree: ${inRepo.ok ? inRepo.out : inRepo.reason}` };
  }

  // In a --depth 1 clone, `git log -1 --format=%cs -- <path>` returns
  // HEAD's date, not the file's, because history simplification treats
  // every file as ADDED in the grafted root commit. Verified with a
  // fixture, not reasoned about (05-RESEARCH.md Q1 §C). Without this
  // branch any shallow CI clone would fail permanently against today's
  // date.
  const shallow = git(["rev-parse", "--is-shallow-repository"]);
  if (!shallow.ok) return { skip: `shallow probe failed: ${shallow.reason}` };
  if (shallow.out === "true") {
    return { skip: "shallow clone — `git log -- <path>` reports HEAD's date, not the file's" };
  }

  const dirty = git(["status", "--porcelain", "--", BACKLOG_MODULE]);
  if (!dirty.ok) return { skip: `status failed: ${dirty.reason}` };
  if (dirty.out !== "") {
    // Fall back to the file's own mtime date, consulted ONLY here. mtime
    // is unreliable in general (a fresh clone stamps every file with
    // clone time), which is exactly why it is used only when git has
    // already confirmed the file is dirty — a fresh clone is never
    // dirty. This is also the branch that keeps the guard non-vacuous
    // during this phase's own execution.
    const mtimeDate = new Date(statSync(path.join(ROOT, BACKLOG_MODULE)).mtime)
      .toISOString()
      .slice(0, 10);
    return { source: "worktree mtime (module has uncommitted changes)", date: mtimeDate };
  }

  // Empty output on a clean tree means no commit touches the module yet
  // (verified against this repo pre-Wave-1: exit 0, empty stdout). %cs
  // (committer date) is what D-09 specifies, and is correct here because
  // this repo merges worktrees rather than rebasing (%as, author date,
  // would be the one-token change if it ever false-positives).
  const log = git(["log", "-1", "--format=%cs", "--", BACKLOG_MODULE]);
  if (!log.ok) return { skip: `log failed: ${log.reason}` };
  if (log.out === "") return { skip: "clean, but no commit touches the module yet" };
  return { source: "git log -1 --format=%cs", date: log.out };
}

// ---------------------------------------------------------------------------
// Half three — the content fingerprint, which narrows what "changed" means.
//
// The probe above answers "when did the FILE change?". Since lib/backlog.tsx
// became the seed for lib/backlog-store.ts as well as the fallback content, a
// file change no longer implies a content change: adding a comment, changing
// the BacklogItem type, or re-encoding a description from a JSX fragment to a
// string literal all move the mtime and move nothing a reader sees. Demanding
// a LAST_TOUCHED bump for those would manufacture exactly the freshness
// overclaim BACK-02 exists to prevent.
//
// So the date check below is gated on the content actually having moved.
// ---------------------------------------------------------------------------

function recordedContentSha(): string {
  const match = backlogSource.match(/export const BACKLOG_CONTENT_SHA256\s*=\s*\n?\s*"([0-9a-f]{64})"/);
  if (!match) {
    throw new Error(
      `could not find \`export const BACKLOG_CONTENT_SHA256 = "<64 hex>"\` in ${BACKLOG_MODULE} — ` +
        "if the declaration was reformatted, fix this reader, do not delete it.",
    );
  }
  return match[1]!;
}

function currentContentSha(): string {
  return createHash("sha256").update(backlogContentFingerprint()).digest("hex");
}

test("BACKLOG_CONTENT_SHA256 matches the array's actual content — the pair with LAST_TOUCHED is authored together", () => {
  assert.equal(
    currentContentSha(),
    recordedContentSha(),
    "the backlog's wording changed but BACKLOG_CONTENT_SHA256 was not updated — update it AND " +
      "LAST_TOUCHED in lib/backlog.tsx together; they are one claim, not two",
  );
});

test("lib/backlog.tsx's last change is not later than LAST_TOUCHED (D-09.2, five-branch environment probe)", (t) => {
  // Content-unchanged short-circuit. If the words are the ones LAST_TOUCHED
  // was authored against, no edit to this file can have made the date a
  // stale claim, whatever the mtime says.
  if (currentContentSha() === recordedContentSha()) {
    t.diagnostic(
      `content fingerprint unchanged (${recordedContentSha().slice(0, 12)}…) — the module may have ` +
        "been edited, but not one word of the backlog moved, so LAST_TOUCHED is not a stale claim",
    );
    return;
  }

  const verdict = lastChangeDate();

  if ("skip" in verdict) {
    // Never skip silently — a skip with no reason is indistinguishable
    // from a pass in TAP output (05-RESEARCH.md Pitfall 5).
    t.diagnostic(`skipped: ${verdict.skip}`);
    t.skip(verdict.skip);
    return;
  }

  // Emitted on the success path too, so a reader of the output can see
  // which of the five branches ran, even when the assertion passes.
  t.diagnostic(`branch: ${verdict.source}; comparison date: ${verdict.date}; LAST_TOUCHED: ${LAST_TOUCHED}`);

  assert.ok(
    !isStale(LAST_TOUCHED, verdict.date),
    `lib/backlog.tsx's LAST_TOUCHED ("${LAST_TOUCHED}") is earlier than its last change ` +
      `(${verdict.date}, via ${verdict.source}) — bump LAST_TOUCHED in lib/backlog.tsx when ` +
      "the work moved, and never the other way round",
  );
});
