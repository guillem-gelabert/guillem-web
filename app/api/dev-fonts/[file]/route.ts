import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * GET /api/dev-fonts/:file — the pixel faces in design/fonts, for the ?dev
 * font picker on Game Boy posts (components/gameboy-screen.tsx). Development
 * only: production answers 404, so the design folder never ships. Served by
 * a route rather than public/ for that reason.
 */
export const dynamic = "force-dynamic";

const DIR = path.join(process.cwd(), "design", "fonts");
const TYPES: Record<string, string> = { ".ttf": "font/ttf", ".otf": "font/otf" };

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  const { file } = await params;
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type || file !== path.basename(file)) return new Response(null, { status: 404 });
  try {
    return new Response(await readFile(path.join(DIR, file)), { headers: { "Content-Type": type } });
  } catch {
    return new Response(null, { status: 404 });
  }
}
