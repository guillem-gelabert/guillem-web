import { expect, test, type Page } from "@playwright/test";

/* Measure luminosity and palette coverage on a fixed polar grid. */
async function sampleSweep(page: Page, plateaus: number[]) {
  const png = await page.getByTestId("noise-gradient-study").screenshot();
  return page.evaluate(
    async ({ uri, levels }) => {
      const img = new Image();
      img.src = uri;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no 2d context");
      ctx.drawImage(img, 0, 0);
      const { data, width } = ctx.getImageData(0, 0, img.width, img.height);
      const cx = img.width / 2;
      const cy = img.height / 2;
      const rMax = Math.min(cx, cy);
      const wedges = [];
      for (let angle = 30; angle < 360; angle += 30) {
        let lumSum = 0;
        let onPalette = 0;
        let rSum = 0;
        let gSum = 0;
        let sampleCount = 0;
        for (let angleOffset = -7; angleOffset <= 7; angleOffset++) {
          const a = ((angle + angleOffset) * Math.PI) / 180;
          for (let radiusStep = 0; radiusStep < 120; radiusStep++) {
            const r = rMax * (0.3 + ((radiusStep + 0.5) / 120) * 0.6);
            const x = Math.round(cx + r * Math.sin(a));
            const y = Math.round(cy - r * Math.cos(a));
            const idx = (y * width + x) * 4;
            const R = data[idx] / 255;
            const G = data[idx + 1] / 255;
            const B = data[idx + 2] / 255;
            const lum = 0.3 * R + 0.59 * G + 0.11 * B;
            lumSum += lum;
            rSum += R;
            gSum += G;
            if (levels.some((p: number) => Math.abs(lum - p) < 0.06)) {
              onPalette++;
            }
            sampleCount++;
          }
        }
        wedges.push({
          lum: lumSum / sampleCount,
          onPalette: onPalette / sampleCount,
          meanR: rSum / sampleCount,
          meanG: gSum / sampleCount,
        });
      }
      return wedges;
    },
    { uri: `data:image/png;base64,${png.toString("base64")}`, levels: plateaus },
  );
}

test("/noise-gradient sweeps one pink through a three- or five-tone dithered ramp", async ({
  page,
}) => {
  await page.goto("/noise-gradient");

  await expect(page.getByTestId("noise-gradient-study")).toBeVisible();
  await expect(page.locator("main")).toHaveCSS(
    "background-color",
    "rgb(17, 17, 17)",
  );

  const base = page.getByTestId("base-layer");
  const colour = page.getByTestId("colour-layer");
  const fields = page.locator('[data-testid^="dither-field-"]');
  const fiveBands = page.getByRole("radio", { name: "5 bands" });
  const threeBands = page.getByRole("radio", { name: "3 bands" });

  await expect(base).toHaveCSS("background-color", "rgb(242, 242, 242)");
  await expect(colour).toHaveCSS("background-color", "rgb(255, 20, 147)");
  await expect(colour).toHaveCSS("mix-blend-mode", "color");

  await expect(page.getByRole("radiogroup", { name: "Bands" })).toBeVisible();
  await expect(fiveBands).toBeChecked();
  await expect(threeBands).not.toBeChecked();

  const modes = [
    {
      radio: fiveBands,
      fieldCount: 4,
      plateaus: [0.95, 0.7, 0.41, 0.2, 0.07],
    },
    {
      radio: threeBands,
      fieldCount: 2,
      plateaus: [0.95, 0.41, 0.07],
    },
  ];

  for (const mode of modes) {
    await mode.radio.check();
    await expect(mode.radio).toBeChecked();
    await expect(fields).toHaveCount(mode.fieldCount);

    // The sweep darkens clockwise and mostly uses the mode's palette tones.
    const wedges = await sampleSweep(page, mode.plateaus);
    expect(wedges[0].lum).toBeGreaterThan(0.85);
    expect(wedges[wedges.length - 1].lum).toBeLessThan(0.13);
    for (let i = 1; i < wedges.length; i++) {
      expect(wedges[i].lum).toBeLessThan(wedges[i - 1].lum);
    }
    for (const wedge of wedges) {
      expect(wedge.onPalette).toBeGreaterThan(0.5);
    }
    // Deep pink itself appears midway between its tint and shade.
    const midSweep = wedges[Math.floor(wedges.length / 2)];
    expect(midSweep.meanR).toBeGreaterThan(0.8);
    expect(midSweep.meanG).toBeLessThan(0.3);
  }
});
