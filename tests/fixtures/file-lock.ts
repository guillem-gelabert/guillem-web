import { mkdirSync, rmSync } from "node:fs";

// A minimal cross-process mutex for coordinating source-file mutation
// windows across Playwright worker processes (each a separate OS process
// sharing one dev server). mkdirSync is atomic at the OS level — it either
// creates the directory or throws EEXIST, with no race window — so this is
// safe even when multiple workers attempt to acquire the same lock at
// exactly the same instant, and safe across --repeat-each's duplicated test
// tree, which is exactly the case this exists for.

export async function acquireLock(lockDir: string, timeoutMs = 30000): Promise<void> {
  const start = Date.now();
  for (;;) {
    try {
      mkdirSync(lockDir);
      return;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
      if (Date.now() - start > timeoutMs) {
        throw new Error(
          `file-lock: timed out after ${timeoutMs}ms waiting for ${lockDir} — a previous run may ` +
            "have crashed mid fixture-window; remove it manually (after confirming the source file " +
            "it guards is back to its shipped state) if so.",
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

export function releaseLock(lockDir: string): void {
  rmSync(lockDir, { recursive: true, force: true });
}
