import { timingSafeEqual } from "node:crypto";

/**
 * Bearer-token auth for the one write surface this site has.
 *
 * The whole posture here is FAIL CLOSED. This endpoint can change what a live
 * job-hunting site says about its owner, so every ambiguous condition —
 * no token configured, a token too short to be meaningful, a malformed header
 * — is a rejection rather than a pass. There is no development bypass and no
 * "allow when NODE_ENV is not production" branch, because that is precisely
 * the kind of branch that ends up enabled in production.
 */

const MIN_TOKEN_LENGTH = 32;

export type AuthResult = { ok: true } | { ok: false; status: 401 | 503; message: string };

/**
 * Constant-time comparison, over SHA-free fixed-length buffers.
 *
 * `timingSafeEqual` throws when the two buffers differ in length, and that
 * throw would itself be an oracle for the token's length. Comparing padded
 * buffers of equal length, and folding the length check into the boolean
 * result, keeps the timing flat with respect to both content and length.
 */
function constantTimeEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");
  const width = Math.max(bufferA.length, bufferB.length, 1);
  const paddedA = Buffer.alloc(width);
  const paddedB = Buffer.alloc(width);
  bufferA.copy(paddedA);
  bufferB.copy(paddedB);
  return timingSafeEqual(paddedA, paddedB) && bufferA.length === bufferB.length;
}

export function authorize(request: Request): AuthResult {
  const expected = process.env.BACKLOG_API_TOKEN;

  // 503, not 401. The distinction matters to whoever is debugging: 401 says
  // "your token is wrong", which would send them hunting for a typo when the
  // real state is that the server has no token to check against and cannot
  // authenticate anybody.
  if (!expected || expected.length < MIN_TOKEN_LENGTH) {
    return {
      ok: false,
      status: 503,
      message:
        "the write API is disabled: BACKLOG_API_TOKEN is unset or shorter than " +
        `${MIN_TOKEN_LENGTH} characters`,
    };
  }

  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer (.+)$/.exec(header);
  if (!match) {
    return { ok: false, status: 401, message: "expected an Authorization: Bearer <token> header" };
  }

  if (!constantTimeEquals(match[1], expected)) {
    return { ok: false, status: 401, message: "invalid token" };
  }

  return { ok: true };
}
