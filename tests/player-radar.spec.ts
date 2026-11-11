import { expect, test } from "@playwright/test";

// Interactive 5 in "What Are Embeddings": the radar starts on Wirtz and van
// Dijk, toggles between 6 and 29 axes, takes up to five players, and draws
// the PES avatars into a WebGL canvas quantised to the page's four shades.

const ROUTE = "/writing/what-are-embeddings";

test.describe("player radar", () => {
  test("starts on Wirtz and van Dijk, with their exact ratings", async ({ page }) => {
    await page.goto(ROUTE);
    const radar = page.getByTestId("player-radar");
    await radar.scrollIntoViewIfNeeded();
    expect(await radar.evaluate((el) => getComputedStyle(el).filter)).toBe("none");
    await expect(page.getByTestId("player-0")).toHaveValue("deu-wirtz");
    await expect(page.getByTestId("player-1")).toHaveValue("nld-dijk");
    const table = page.getByTestId("ratings");
    await expect(table.locator("tbody tr")).toHaveCount(6);
    // Wirtz: PAC 80, DEF 54; van Dijk: PAC 73, DEF 90 (ea_fc26_players.csv)
    await expect(table.locator("tbody tr").nth(0).locator("td")).toHaveText(["80", "73"]);
    await expect(table.locator("tbody tr").nth(4).locator("td")).toHaveText(["54", "90"]);
  });

  test("switches to 29 axes and takes up to five players", async ({ page }) => {
    await page.goto(ROUTE);
    await page.getByTestId("player-radar").scrollIntoViewIfNeeded();
    await page.getByTestId("view-29").click();
    await expect(page.getByTestId("ratings").locator("tbody tr")).toHaveCount(29);
    const add = page.getByTestId("add-player");
    for (let i = 0; i < 3; i++) await add.click();
    await expect(page.getByTestId("series")).toHaveCount(5);
    await expect(add).toBeDisabled();
    await page.getByTestId("player-1").selectOption("fra-kante");
    await expect(page.getByTestId("series")).toHaveCount(5);
  });

  test("draws the avatars in full colour on the TFT screen", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(ROUTE);
    const canvas = page.getByTestId("avatar-canvas");
    await canvas.scrollIntoViewIfNeeded();
    // the avatars have loaded once the darkest shade covers a real share of the strip
    const shareOfInk = () =>
      canvas.evaluate((c: HTMLCanvasElement) => {
        const off = document.createElement("canvas");
        off.width = c.width;
        off.height = c.height;
        const ctx = off.getContext("2d")!;
        ctx.drawImage(c, 0, 0);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        const seen = new Set<string>();
        let ink = 0;
        for (let i = 0; i < d.length; i += 4) {
          seen.add(`${d[i]},${d[i + 1]},${d[i + 2]}`);
          if (d[i] < 0x40) ink++;
        }
        return { shades: seen.size, ink: ink / (d.length / 4) };
      });
    await expect.poll(async () => (await shareOfInk()).ink, { timeout: 20_000 }).toBeGreaterThan(0.01);
    await expect(page.locator("html")).toHaveAttribute("data-screen", "tft");
    await expect.poll(async () => (await shareOfInk()).shades).toBeGreaterThan(16);
    expect(errors.filter((e) => /Content Security Policy|glb|GLTF/i.test(e))).toEqual([]);
  });
});
