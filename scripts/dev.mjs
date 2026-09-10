#!/usr/bin/env node
// `next dev`, but it checks the port first.
//
// Next refuses to start when something already holds the port — it prints
// "Another next dev server is already running" and exits 1. That is fine when
// you are at a terminal and can read it. It is not fine for Playwright, whose
// webServer block runs this script: a stale server left over from an earlier
// run makes the whole suite fail in ways that look like application bugs
// (routes 500, the accessibility tree comes back empty, unrelated specs go
// red) rather than like a port conflict.
//
// So: find what holds the port, and if it is a dev server for THIS project,
// stop it and take the port. Anything else is left alone and reported, because
// killing a process a developer did not start is not this script's business.

import { spawn, execFileSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const args = process.argv.slice(2);

// --port wins over PORT, matching Next's own precedence.
const portFlag = args.indexOf("--port");
const port = Number(
  portFlag !== -1 ? args[portFlag + 1] : (process.env.PORT ?? 3000),
);

function listeners(p) {
  try {
    // -sTCP:LISTEN so a browser tab connected to the port is not mistaken for
    // the server itself.
    return execFileSync("lsof", ["-nP", `-iTCP:${p}`, "-sTCP:LISTEN", "-t"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map(Number);
  } catch {
    // lsof exits non-zero when nothing matches, which is the common case.
    return [];
  }
}

function describe(pid) {
  try {
    return execFileSync("ps", ["-o", "command=", "-p", String(pid)], {
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

// Next refuses to start a second dev server for the same PROJECT, whatever
// port it is asked for — "Another next dev server is already running" — so
// freeing the port is not enough on its own. This finds any dev server whose
// working directory is this one, on any port at all. Without it, a server
// left running on 3001 silently breaks a Playwright run on 3000, and the
// whole suite fails in ways that look like application bugs.
function projectDevServers() {
  let candidates = [];
  try {
    candidates = execFileSync("pgrep", ["-f", "next-server|next dev"], {
      encoding: "utf8",
    })
      .split("\n")
      .map((line) => Number(line.trim()))
      .filter((pid) => Number.isInteger(pid) && pid > 0 && pid !== process.pid);
  } catch {
    return [];
  }

  // Never touch our own ancestors: `npm run dev` and the shell above it can
  // match the pattern, and killing them kills this process mid-flight — which
  // is exactly the failure this function is meant to prevent.
  const ancestors = new Set();
  try {
    let pid = process.pid;
    for (let i = 0; i < 12 && pid > 1; i += 1) {
      ancestors.add(pid);
      pid = Number(
        execFileSync("ps", ["-o", "ppid=", "-p", String(pid)], {
          encoding: "utf8",
        }).trim(),
      );
      if (!Number.isInteger(pid)) break;
    }
  } catch {
    /* best effort */
  }

  const here = process.cwd();
  return candidates.filter((pid) => {
    if (ancestors.has(pid)) return false;
    try {
      // lsof is the portable way to read another process's cwd on macOS.
      const out = execFileSync("lsof", ["-a", "-p", String(pid), "-d", "cwd", "-Fn"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      const cwd = out.split("\n").find((line) => line.startsWith("n"))?.slice(1);
      return cwd === here;
    } catch {
      return false;
    }
  });
}

const strays = projectDevServers().filter((pid) => !listeners(port).includes(pid));
if (strays.length > 0) {
  console.log(
    `stopping a dev server for this project on another port (${strays.join(", ")}) — ` +
      `Next allows only one at a time`,
  );
  for (const pid of strays) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      /* already gone */
    }
  }
  await sleep(600);
}

const held = listeners(port);

if (held.length > 0) {
  // "next-server" is what the worker renames itself to; "next dev" catches it
  // before the rename, and the cwd check keeps another project's server safe.
  const ours = held.filter((pid) => {
    const command = describe(pid);
    return /next-server|next dev|scripts\/dev\.mjs/.test(command);
  });
  const others = held.filter((pid) => !ours.includes(pid));

  if (others.length > 0) {
    console.error(
      `port ${port} is held by something that is not a Next dev server:\n` +
        others.map((pid) => `  ${pid}  ${describe(pid)}`).join("\n") +
        `\nstop it yourself, or run with a different PORT.`,
    );
    process.exit(1);
  }

  console.log(`port ${port} held by a stale dev server (${ours.join(", ")}) — stopping it`);
  for (const pid of ours) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // Already gone between the check and here; nothing to do.
    }
  }

  // Give it a moment to release the socket, then escalate once.
  for (let i = 0; i < 20 && listeners(port).length > 0; i += 1) {
    await sleep(250);
  }
  if (listeners(port).length > 0) {
    for (const pid of listeners(port)) {
      try {
        process.kill(pid, "SIGKILL");
      } catch {
        /* gone */
      }
    }
    await sleep(500);
  }
  if (listeners(port).length > 0) {
    console.error(`port ${port} is still held after SIGKILL; giving up.`);
    process.exit(1);
  }
}

// --port is passed explicitly so PORT and the flag cannot disagree.
const passthrough = portFlag === -1 ? args : args.filter((_, i) => i !== portFlag && i !== portFlag + 1);
const next = spawn(
  "npx",
  ["next", "dev", "--port", String(port), ...passthrough],
  { stdio: "inherit" },
);

// Forward signals so Ctrl-C and Playwright's teardown actually stop the server
// rather than orphaning it — an orphan here is the exact thing this script
// exists to clean up.
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => next.kill(signal));
}
next.on("exit", (code, signal) => {
  process.exit(signal ? 1 : (code ?? 0));
});
