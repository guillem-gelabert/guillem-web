import assert from "node:assert/strict";
import { test } from "node:test";
import { PERMISSIONS_POLICY, buildCsp } from "../../lib/csp.ts";

// Covers BUILD-04 / D-4.2 / D-4.3: buildCsp({dev}) is a pure function, so
// this suite can assert the exact production policy string without starting
// a server — the thing `tests/security-headers.spec.ts` structurally cannot
// do, because playwright.config.ts's webServer always runs `npm run dev`.

test("buildCsp({dev:false}) equals the exact production policy, character for character", () => {
  // Written as a literal, not re-derived from buildCsp's own directive
  // table — an assertion that imported its expected value from the same
  // function under test would prove nothing.
  const expected =
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'; object-src 'none'; upgrade-insecure-requests";
  assert.equal(buildCsp({ dev: false }), expected);
});

test("the production policy contains no 'unsafe-eval' and no ws: — dev relaxations must never leak", () => {
  const prod = buildCsp({ dev: false });
  assert.ok(!prod.includes("'unsafe-eval'"), "production CSP must not contain 'unsafe-eval'");
  assert.ok(!prod.includes("ws:"), "production CSP must not contain the ws: HMR scheme");
});

test("dev and prod style-src carry the identical token set — the parity Task 3's browser proof depends on", () => {
  // T-06-15: a dev relaxation shipping to production is the threat this
  // assertion mitigates. Compared as sorted token arrays, not string
  // equality, so the failure message names the exact divergent token
  // rather than dumping two whole directive strings at the reader.
  const styleSrcTokens = (policy: string): string[] => {
    const match = policy.match(/style-src ([^;]+)/);
    assert.ok(match, "policy must contain a style-src directive");
    return match![1].trim().split(/\s+/).sort();
  };

  const prodTokens = styleSrcTokens(buildCsp({ dev: false }));
  const devTokens = styleSrcTokens(buildCsp({ dev: true }));

  const inDevOnly = devTokens.filter((t) => !prodTokens.includes(t));
  const inProdOnly = prodTokens.filter((t) => !devTokens.includes(t));
  const divergent = [...inDevOnly, ...inProdOnly];

  assert.deepEqual(
    devTokens,
    prodTokens,
    `style-src must be identical between dev and prod — divergent token(s): ${divergent.join(", ") || "(none found, but arrays differ)"}`,
  );
});

test("PERMISSIONS_POLICY lists only features the site does not use, enumerated by name", () => {
  const expectedFeatures = [
    "accelerometer",
    "camera",
    "geolocation",
    "gyroscope",
    "magnetometer",
    "microphone",
    "payment",
    "usb",
    "browsing-topics",
  ];

  for (const feature of expectedFeatures) {
    assert.ok(
      PERMISSIONS_POLICY.includes(`${feature}=()`),
      `PERMISSIONS_POLICY must disable "${feature}" — the site does not use it`,
    );
  }

  // Set equality, not membership alone: catches a feature silently added
  // (or removed) without this test being updated to name it.
  const declaredFeatures = PERMISSIONS_POLICY.split(",")
    .map((entry) => entry.trim().split("=")[0])
    .sort();
  assert.deepEqual(declaredFeatures, [...expectedFeatures].sort());
});
