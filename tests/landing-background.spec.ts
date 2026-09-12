import { expect, test } from "@playwright/test";
import { seamAngleDegrees } from "./seam-geometry";
import { allBlocks, valuesOf } from "./unit/css-source.ts";

// The accent, read from app/globals.css's @theme block rather than
// hardcoded — D-4.4 §3's rule, and the same parser and derivation
// tests/design-budget.spec.ts already uses. It is needed here only to
// assert what the disc's red is NOT.
const themeBlock = allBlocks.find((b) => b.selector === "@theme");
if (!themeBlock) {
  throw new Error("landing-background.spec.ts: expected an @theme block in app/globals.css");
}
const [accentHex] = valuesOf("--color-accent", [themeBlock]);
if (!accentHex) {
  throw new Error("landing-background.spec.ts: expected --color-accent inside @theme");
}
const clean = accentHex.replace("#", "");
const ACCENT_RGB = `rgb(${parseInt(clean.slice(0, 2), 16)}, ${parseInt(clean.slice(2, 4), 16)}, ${parseInt(clean.slice(4, 6), 16)})`;

// What this file guards is the seam's CONSTRUCTION, not its geometry —
// tests/landing-seam-geometry.spec.ts owns where the ray points and which
// corners it threads between. The two overlap on --seam-angle only because
// the rotation here has to be the same number that file asserts the hook
// derived: a mask rotated by anything else would put the ink somewhere the
// boxes were not measured against.
//
// The construction is a riso print in two layers: paper, and one ink the
// dither cuts holes in. Tone is dot density inside a 1-bit PNG
// (public/seam-dither-*.png — an Angle gradient, Photoshop's Image > Mode >
// Bitmap with Diffusion Dither), so every pixel of that file is pure black
// or pure white and nothing in CSS interpolates between them.
//
// It replaced a stack of four feTurbulence fields that crushed shared
// turbulence into binary dots and multiplied them into five plateaus, then
// tinted the result with mix-blend-mode: color. The assertions below are
// mostly NEGATIVE for that reason: the old stack's failure modes were all
// silent — a filter chain that still renders when its numbers drift, a
// blend mode that quietly takes lightness from the wrong layer — and the
// point of the swap was to make them structurally impossible rather than
// tuned. A regression that reintroduced any of them would still paint
// something plausible, which is exactly why it needs asserting.

const DITHER_DESKTOP = "seam-dither-desktop.png";
// The half-size export a phone used to be handed. Kept as a name only so the
// phone test below can assert it is never requested again.
const DITHER_MOBILE = "seam-dither-mobile.png";

// The paper and the ink, from .scene's --gradient-base and
// --gradient-shade. Hard-coded as rgb() because that is what
// getComputedStyle returns, and asserting the pair is what proves the two
// layers did not swap roles — a mask inverted by mask-mode or by polarity
// still covers the same pixels, just with the wrong colour showing.
//
// Neutral grey, and a soft ink: 6.66:1 between them, down from 14.59:1
// when this was cream on near-black. The stylesheet derives both from
// that contrast figure, so a change to either token should be a
// deliberate edit here too, not a surprise.
const PAPER = "rgb(242, 242, 242)";
const INK = "rgb(85, 85, 85)";

// Type is drawn in neither of those. See the note on the colour
// assertions below for why the two ends of the background cannot also be
// the two ends of the type.
const BLACK = "rgb(0, 0, 0)";
const WHITE = "rgb(255, 255, 255)";

test.describe("landing background", () => {
  test("prints one dithered ink on paper, rotated to the seam", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Guillem Gelabert" }),
    ).toBeVisible();

    const scene = page.locator("#seam-scene");
    const field = page.locator(".seam-grain-field").first();

    // Two layers per scene, not six. The count is the assertion: the four
    // .grainArc* plateaus and the .grainColour tinting pass are gone, and
    // the whole ramp they built now arrives inside the PNG.
    await expect(page.locator(".seam-grain-base")).toHaveCount(2);
    await expect(page.locator(".seam-grain-field")).toHaveCount(2);
    await expect(page.locator(".seam-grain-colour")).toHaveCount(0);

    const ink = await field.evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return {
        // Chrome serialises the unprefixed and -webkit- properties
        // separately; Safari needs the prefixed one, so both are declared
        // and both are checked.
        maskImage: styles.maskImage,
        webkitMaskImage: styles.webkitMaskImage,
        maskMode: styles.maskMode,
        maskSize: styles.maskSize,
        maskRepeat: styles.maskRepeat,
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        imageRendering: styles.imageRendering,
        mixBlendMode: styles.mixBlendMode,
        filter: styles.filter,
        transform: styles.transform,
        width: Number.parseFloat(styles.width),
        height: Number.parseFloat(styles.height),
      };
    });

    expect(ink.maskImage).toContain(DITHER_DESKTOP);
    expect(ink.webkitMaskImage).toContain(DITHER_DESKTOP);

    // Alpha, not luminance. The export is a 1-bit palette PNG whose black
    // entry is transparent, so the default mask mode reads it correctly in
    // every engine. It used to be an opaque black-on-white bitmap under
    // mask-mode: luminance, and WebKit ignored that mode whenever the
    // -webkit- prefixed mask-image was also declared — then decoded the
    // 1-bit grayscale file as a stencil, black = paint, which printed the
    // gradient inverted on iOS. A luminance declaration coming back here is
    // the regression this pins.
    expect(ink.maskMode).toBe("match-source");

    // The mask fills its element exactly once. Both halves matter: a
    // repeat would tile a second copy of the ramp into the scene, and a
    // size other than 100% would slide the file's twelve-o'clock seam off
    // the pivot the rotation turns about.
    expect(ink.maskSize).toBe("100% 100%");
    expect(ink.maskRepeat).toBe("no-repeat");

    // One flat ink, cut only by the mask. A background IMAGE here would
    // mean a gradient had crept back into the layer the dither is supposed
    // to be the sole source of tone for.
    expect(ink.backgroundColor).toBe(INK);
    expect(ink.backgroundImage).toBe("none");

    // The dither is one dot per image pixel. Smooth resampling averages
    // neighbouring dots back into the grey that Bitmap conversion existed
    // to destroy, so this is load-bearing, not a hint.
    expect(ink.imageRendering).toBe("pixelated");

    // The three the old stack depended on, now absent by construction.
    // filter: grayscale/contrast/brightness thresholded turbulence into
    // dots; multiply stacked the plateaus; color tinted them — and that
    // last one took LIGHTNESS from underneath, which is why pure white and
    // pure black plateaus used to come through untinted.
    expect(ink.mixBlendMode).toBe("normal");
    expect(ink.filter).toBe("none");

    // Square, and big enough to still reach the far corner once rotated.
    // A mask is clipped to its element's box, so an inset: 0 layer —
    // viewport shaped — cannot hold this: the overhang is cut off and the
    // ink survives only where the two boxes overlap. Asserting squareness
    // is what catches a regression to that.
    expect(ink.width).toBe(ink.height);
    // 250vmax of a 1440x900 viewport. Asserted against the viewport rather
    // than by resolving --dither-size: the declaration is a vmax length on
    // an element that is already the size it describes, so a probe measured
    // inside it comes back constrained by its parent rather than equal to
    // the value.
    expect(ink.width).toBeCloseTo(2.5 * 1440, 0);
    // And that has to clear the reach the rotation demands. The pivot sits
    // near a corner, so the radius the square must cover is the whole
    // viewport diagonal — its side, twice that again.
    const diagonal = Math.hypot(1440, 900);
    expect(ink.width).toBeGreaterThan(2 * diagonal);

    // The rotation IS the seam. The file's ramp starts at twelve o'clock
    // and sweeps clockwise, which is the origin --seam-angle is measured
    // from, so the hook's angle can be applied with no offset — and this
    // is the assertion that keeps that convention honest. Read out of the
    // matrix rather than the declaration: what reaches the compositor is
    // what the ink is actually rotated by.
    const angle = await seamAngleDegrees(page, scene);
    const matrix = ink.transform.match(
      /matrix\(([^,]+),\s*([^,]+),/,
    ) as RegExpMatchArray | null;
    expect(matrix).not.toBeNull();
    const rendered =
      (Math.atan2(
        Number.parseFloat(matrix![2]),
        Number.parseFloat(matrix![1]),
      ) *
        180) /
      Math.PI;
    expect(rendered).toBeCloseTo(angle, 1);

    // The paper under it, which is also the scene's backstop: .scene
    // paints nothing, so this is what covers the safe-area bands the
    // composition runs under.
    await expect(page.locator(".seam-grain-base").first()).toHaveCSS(
      "background-color",
      PAPER,
    );

    // The story sits on a disc, and the CAPTURE is that disc now.
    //
    // This block used to read .seam-circle, a dedicated element behind the
    // copy: first a violet field under three overlapping radial washes,
    // then one flat red. Both are gone — the picture covers the whole disc,
    // so a coloured element behind it would paint nothing and the element
    // was removed rather than left as an invisible placeholder. What the
    // assertions are for survives the move: the disc has to be ACTUALLY
    // round and actually sized off its size-container.
    const disc = await page.locator(".seam-shot").evaluate((element) => {
      const styles = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const box = element.closest(".seam-box-case-study")!;
      const boxStyles = window.getComputedStyle(box);
      const boxRect = box.getBoundingClientRect();
      const pad = (side: string) => Number.parseFloat(boxStyles.getPropertyValue(`padding-${side}`));
      return {
        radius: styles.borderRadius,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        image: styles.backgroundImage,
        fit: styles.objectFit,
        position: styles.position,
        // The box's CONTENT box — what cq units resolve against, and the
        // square the disc must fit inside.
        contentWidth: Math.round(boxRect.width - pad("left") - pad("right")),
        contentHeight: Math.round(boxRect.height - pad("top") - pad("bottom")),
        centreOffsetX: Math.round(
          rect.left + rect.width / 2 - (boxRect.left + pad("left") + (boxRect.width - pad("left") - pad("right")) / 2),
        ),
        centreOffsetY: Math.round(
          rect.top + rect.height / 2 - (boxRect.top + pad("top") + (boxRect.height - pad("top") - pad("bottom")) / 2),
        ),
      };
    });
    // Actually round, and actually a circle: equal sides plus a 50%
    // radius. It is sized in cq units off a container-type: size box, so a
    // non-square result means the sizing lost its container — which is
    // exactly what happened once, when preflight's img{max-width:100%}
    // capped the width to the copy column and left a 356x385 ellipse.
    expect(disc.radius).toBe("50%");
    expect(disc.width).toBe(disc.height);
    expect(disc.width).toBeGreaterThan(0);
    // cover, or a 2.195:1 asset letterboxes inside the circle instead of
    // filling it.
    expect(disc.fit).toBe("cover");

    // Respects the box's padding: min(100cqw, 100cqh) is the largest disc
    // that crosses none of the four padding edges. It used to be sized on
    // the box's DIAGONAL and deliberately overflowed on every side.
    expect(disc.width).toBe(Math.min(disc.contentWidth, disc.contentHeight));

    // And centred on that content box. The picture's containing block is
    // .content, not the box, so its two anchors are compensated
    // (left: 50%, top: 50cqh) — a regression there moved it 100px off
    // without changing its size, which only a centre check catches.
    expect(Math.abs(disc.centreOffsetX)).toBeLessThanOrEqual(1);
    expect(Math.abs(disc.centreOffsetY)).toBeLessThanOrEqual(1);

    // No gradient anywhere in the composition's one coloured object. The
    // washes are what this asserted the presence of; now nothing paints a
    // background here at all, the picture is the surface.
    expect(disc.image).toBe("none");
    // ACCENT_RGB is still read from @theme (top of file) so this file keeps
    // failing loudly if --color-accent is ever what paints the disc:
    // design-budget.spec.ts's (accent) case reserves it to focus.
    expect(disc.image).not.toContain(ACCENT_RGB);

    // The copy has to paint ABOVE it. Positioned elements beat
    // non-positioned ones whatever the DOM order says, so a static
    // .content sibling after an absolute circle is covered by it — which
    // is exactly what happened. Both being positioned is what fixes it.
    expect(disc.position).toBe("absolute");
    await expect(
      page.locator(".seam-box-case-study > .seam-content"),
    ).toHaveCSS("position", "relative");

    // NO blend modes in the composition, with one sanctioned exception.
    // This is the assertion that keeps them from creeping back: difference
    // was load-bearing for three generations of this background (it let one
    // white fill read on both grounds), and every attempt to keep it
    // against real dither dots needed a second gradient layer to blend
    // against. Copy states its colour instead.
    //
    // The exception is the disc's sphere shading, and it is the opposite
    // case on every count that made difference a problem: two 1-bit maps
    // that ink only the terminator and the lit cap, blended against the
    // picture inside the disc rather than against the ground, and needing
    // no second layer to sit on. darken lays the shadow's black down and
    // lighten the highlight's white — the riso rule the seam's own dither
    // already follows. They are named individually here so that anything
    // ELSE acquiring a blend mode still fails this test.
    const SHADING = ["seam-shot-shadow", "seam-shot-highlight"];
    const blended = await page.evaluate(() =>
      [...document.querySelectorAll("#seam-scene *")]
        .filter(
          (element) =>
            window.getComputedStyle(element).mixBlendMode !== "normal",
        )
        .map((element) => element.className.toString().split(" ")[0]),
    );
    expect(blended.filter((name) => !SHADING.includes(name))).toEqual([]);
    // And the exception is present rather than merely tolerated.
    expect(blended.slice().sort()).toEqual(SHADING.slice().sort());

    // And no smooth-ramp layers either — the mechanism that existed only
    // to give those blends a dot-free ground.
    await expect(page.locator(".seam-smooth-ramp")).toHaveCount(0);

    // Colour is a fact about the layout: each element names the ground its
    // box sits on. Black on the paper side, white on the ink side. Getting
    // one backwards is invisible rather than merely wrong — white on the
    // grey paper is 1.12:1 — so every one is asserted.
    //
    // Pure #000/#fff, deliberately NOT the --gradient-* pair the
    // background is built from. That pair is soft on purpose (6.66:1
    // between its ends) and type drawn in those values would inherit the
    // softness on top of it; full black and white buy back what the
    // lighter ink gave away. Type is the one thing here not made of the
    // two inks, which is why these are literals and not tokens.
    await expect(page.locator(".seam-nameplate-text")).toHaveCSS(
      "color",
      BLACK,
    );
    await expect(page.locator(".seam-tagline")).toHaveCSS("color", BLACK);

    // The tagline is the one line that provably crosses the seam: at
    // 1440x900 its box starts on paper and ends on ink, where black is
    // 2.82:1 and stops reading. A white halo carries it across, and it is
    // asserted because without it the last word is unreadable at exactly one
    // viewport size, which is easy to miss.
    //
    // BLURRED, not the four hard 1px offsets this used to require. The line
    // now also crosses the story's arc, and a 1px sticker outline only
    // separates type from a flat ground — against dither dots and other type
    // it reads as a second edge. What matters is unchanged: opaque white, so
    // it never tints the dots, and centred, so it shows only where the ground
    // is dark rather than throwing the line in one direction.
    const shadow = await page
      .locator(".seam-tagline")
      .evaluate((element) => window.getComputedStyle(element).textShadow);
    const layers = shadow.split(/,(?![^(]*\))/).map((layer) => layer.trim());
    expect(layers.length).toBeGreaterThanOrEqual(2);
    for (const layer of layers) {
      // Opaque white, no offset, and a real blur radius on every layer.
      expect(layer).toContain("rgb(255, 255, 255)");
      const lengths = layer.match(/-?[\d.]+px/g) ?? [];
      expect(lengths).toHaveLength(3);
      const [x, y, blur] = lengths.map(Number.parseFloat);
      expect(x).toBe(0);
      expect(y).toBe(0);
      expect(blur).toBeGreaterThan(0);
    }
    await expect(page.locator(".seam-content-case-study").first()).toHaveCSS(
      "color",
      WHITE,
    );
    // The lang switch is centred ON the seam and rotated across it, so its
    // two labels sit on opposite grounds by construction — that is the
    // design of the control, and each link names its own side.
    await expect(page.locator(".seam-lang-en")).toHaveCSS("color", BLACK);
    await expect(page.locator(".seam-lang-de")).toHaveCSS("color", WHITE);
  });

  test("hands a phone the same full-resolution export as the desktop", async ({
    page,
  }) => {
    // A phone used to get seam-dither-mobile.png, a 1300px export, on the
    // reasoning that --dither-size is a viewport length so half the pixels
    // over a smaller viewport would come to the same dots per CSS pixel.
    // They did not: the field is 2130px square on a 393x852 phone against
    // 3600px at 1440x900, so the halved file put ~240 dots across the
    // screen where the desktop has ~1040, and the grain read as the same
    // picture zoomed in. Both devices now mask with the one 2600px file
    // (see .grainField's note in landing-seam.module.css for the
    // angular-size arithmetic), and this asserts the small one is never
    // fetched — which cannot be read off a computed style: a stale
    // declaration in one phone branch would request it while the other
    // correctly used the large one.
    // The stylesheet's phone branches key off (hover: none) and
    // (pointer: coarse) — a device test, not a width one, matching
    // use-seam-alignment.ts's MOBILE_QUERY. The default context reports a
    // fine pointer however narrow its viewport is, so the branch is only
    // reachable from a context built with hasTouch/isMobile.
    const touch = await page.context().browser()!.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      deviceScaleFactor: 2,
    });
    const phone = await touch.newPage();
    const phoneRequests: string[] = [];
    phone.on("request", (request) => {
      const url = request.url();
      if (url.includes("seam-dither")) phoneRequests.push(url);
    });

    await phone.goto("/");
    await expect(
      phone.getByRole("heading", { name: "Guillem Gelabert" }),
    ).toBeVisible();

    const maskImage = await phone
      .locator(".seam-grain-field")
      .first()
      .evaluate((element) => window.getComputedStyle(element).maskImage);
    expect(maskImage).toContain(DITHER_DESKTOP);

    await phone.waitForLoadState("networkidle");
    expect(phoneRequests.some((url) => url.includes(DITHER_DESKTOP))).toBe(true);
    expect(phoneRequests.some((url) => url.includes(DITHER_MOBILE))).toBe(false);

    await touch.close();
  });
});
