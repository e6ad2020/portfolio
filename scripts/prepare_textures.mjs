import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SOURCE_PORTRAIT = 'assets/source/portrait.png';
const SOURCE_DEPTH = 'assets/source/depth.png';
const OUTPUT_DIR = 'public/textures/hero';

// Depth values above this are considered part of the subject
const MASK_THRESHOLD = 6;
// Anti-aliasing feather for the visible cutout edge (in full-res pixels)
const CUTOUT_FEATHER_SIGMA = 0.9;
// Width of the inward parallax falloff stored in the depth texture alpha (in 768px texels).
// Must be wide enough that max parallax displacement never pulls samples from outside the subject.
const INTERIOR_FALLOFF_SIGMA = 10;

/** Builds a binary subject mask (0 / 255) from a single-channel depth buffer. */
function binaryMask(depth) {
  const mask = Buffer.alloc(depth.length);
  for (let i = 0; i < depth.length; i++) {
    mask[i] = depth[i] > MASK_THRESHOLD ? 255 : 0;
  }
  return mask;
}

/** Gaussian-blurs a single-channel buffer (output is forced back to 1 channel). */
async function blurMask(mask, width, height, sigma) {
  return sharp(mask, { raw: { width, height, channels: 1 } })
    .blur(sigma)
    .extractChannel(0)
    .raw()
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Loading source images...');
  const { data: dData } = await sharp(SOURCE_DEPTH).grayscale().raw().toBuffer({ resolveWithObject: true });
  const { data: pRgb } = await sharp(SOURCE_PORTRAIT).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const width = 1536, height = 1024;

  // Feathered (anti-aliased) cutout alpha instead of a hard on/off edge
  const cutoutAlpha = await blurMask(binaryMask(dData), width, height, CUTOUT_FEATHER_SIGMA);

  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = pRgb[i * 3];
    rgba[i * 4 + 1] = pRgb[i * 3 + 1];
    rgba[i * 4 + 2] = pRgb[i * 3 + 2];
    rgba[i * 4 + 3] = cutoutAlpha[i];
  }

  await sharp(rgba, { raw: { width, height, channels: 4 } }).webp({ quality: 92 }).toFile(path.join(OUTPUT_DIR, 'portrait@2x.webp'));
  await sharp(rgba, { raw: { width, height, channels: 4 } }).webp({ quality: 90 }).toFile(path.join(OUTPUT_DIR, 'portrait-fallback.webp'));
  await sharp(rgba, { raw: { width, height, channels: 4 } }).resize(768, 512).webp({ quality: 88 }).toFile(path.join(OUTPUT_DIR, 'portrait@1x.webp'));

  // Depth texture: R, G, B = depth, A = wide blurred subject mask
  // (≈0.5 on the silhouette edge, 1.0 deep inside). The shader uses it to fade
  // parallax to zero near the outline so the edge never tears.
  const dw = 768, dh = 512;
  const dHalf = await sharp(SOURCE_DEPTH).grayscale().resize(dw, dh).raw().toBuffer();
  const interiorMask = await blurMask(binaryMask(dHalf), dw, dh, INTERIOR_FALLOFF_SIGMA);

  const depthRgba = Buffer.alloc(dw * dh * 4);
  for (let i = 0; i < dw * dh; i++) {
    const val = dHalf[i];
    depthRgba[i * 4] = val;
    depthRgba[i * 4 + 1] = val;
    depthRgba[i * 4 + 2] = val;
    depthRgba[i * 4 + 3] = interiorMask[i];
  }
  await sharp(depthRgba, { raw: { width: dw, height: dh, channels: 4 } }).png().toFile(path.join(OUTPUT_DIR, 'depth.png'));
  await sharp(depthRgba, { raw: { width: dw, height: dh, channels: 4 } }).webp({ quality: 95, alphaQuality: 100, effort: 6 }).toFile(path.join(OUTPUT_DIR, 'depth.webp'));
  console.log('Saved all textures (feathered cutout + interior falloff mask)!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
