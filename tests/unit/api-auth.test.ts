import assert from "node:assert/strict";
import { test } from "node:test";

// The site's only authentication code, and therefore the only place where
// getting it subtly wrong has consequences beyond a broken page.
//
// Every test below is a REJECTION case except two. That ratio is the point:
// this endpoint can change what a live job-hunting site says about its owner,
// so the property worth proving is not "the right token works" but "nothing
// else does".

const { authorize } = await import("../../lib/api-auth.ts");

const TOKEN = "t".repeat(48);

function request(headers: Record<string, string> = {}): Request {
  return new Request("https://example.com/api/backlog", { method: "POST", headers });
}

function withToken<T>(token: string | undefined, run: () => T): T {
  const previous = process.env.BACKLOG_API_TOKEN;
  if (token === undefined) delete process.env.BACKLOG_API_TOKEN;
  else process.env.BACKLOG_API_TOKEN = token;
  try {
    return run();
  } finally {
    if (previous === undefined) delete process.env.BACKLOG_API_TOKEN;
    else process.env.BACKLOG_API_TOKEN = previous;
  }
}

test("the correct token is accepted", () => {
  withToken(TOKEN, () => {
    assert.deepEqual(authorize(request({ authorization: `Bearer ${TOKEN}` })), { ok: true });
  });
});

test("no configured token disables the endpoint with 503, NOT 401", () => {
  // The distinction is for whoever is debugging at 1am: 401 says "your token
  // is wrong" and sends them hunting for a typo, when the real state is that
  // the server has nothing to authenticate against.
  withToken(undefined, () => {
    const result = authorize(request({ authorization: `Bearer ${TOKEN}` }));
    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.status, 503);
  });
});

test("a configured token that is too short disables the endpoint rather than accepting it", () => {
  // Fail closed. A one-character BACKLOG_API_TOKEN set by accident (a stray
  // `=` in a deploy script, a truncated paste) must not become a working
  // credential that anyone can brute-force in a second.
  withToken("short", () => {
    const result = authorize(request({ authorization: "Bearer short" }));
    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.status, 503);
  });
});

test("a missing, malformed or wrongly-schemed Authorization header is rejected with 401", () => {
  withToken(TOKEN, () => {
    const headerSets: Record<string, string>[] = [
      {},
      { authorization: "" },
      { authorization: TOKEN }, // no scheme
      { authorization: `Basic ${TOKEN}` }, // wrong scheme
      { authorization: `bearer ${TOKEN}` }, // lowercase scheme, deliberately not accepted
      { authorization: "Bearer" }, // scheme with no token
      { authorization: "Bearer " }, // scheme with an empty token
    ];
    for (const headers of headerSets) {
      const result = authorize(request(headers));
      assert.equal(result.ok, false, `${JSON.stringify(headers)} must be rejected`);
      assert.equal(result.ok === false && result.status, 401);
    }
  });
});

test("a wrong token of the SAME length is rejected", () => {
  // The case a length check alone would wave through.
  withToken(TOKEN, () => {
    const wrong = "w".repeat(TOKEN.length);
    assert.equal(authorize(request({ authorization: `Bearer ${wrong}` })).ok, false);
  });
});

test("a correct PREFIX of the token is rejected — the comparison is not a startsWith", () => {
  // The classic bug the padded comparison in constantTimeEquals exists to
  // avoid: pad both buffers to equal width and a shorter candidate compares
  // equal on every byte it has. The length is folded into the result for
  // exactly this.
  withToken(TOKEN, () => {
    for (const truncated of [TOKEN.slice(0, 1), TOKEN.slice(0, 47)]) {
      const result = authorize(request({ authorization: `Bearer ${truncated}` }));
      assert.equal(result.ok, false, `a ${truncated.length}-char prefix must be rejected`);
    }
    // And the other direction: the token plus anything.
    assert.equal(authorize(request({ authorization: `Bearer ${TOKEN}x` })).ok, false);
  });
});

test("no error message ever contains the expected token", () => {
  // A 401 body is returned to an unauthenticated caller. Leaking any part of
  // the credential into it would defeat the whole mechanism.
  withToken(TOKEN, () => {
    const cases: Record<string, string>[] = [{}, { authorization: "Bearer wrong" }, { authorization: "Basic x" }];
    for (const headers of cases) {
      const result = authorize(request(headers));
      assert.equal(result.ok, false);
      const message = result.ok === false ? result.message : "";
      assert.ok(!message.includes(TOKEN), "the token must never appear in an error message");
    }
  });
});
