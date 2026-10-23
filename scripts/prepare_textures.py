#!/usr/bin/env python3
"""
scripts/prepare_textures.py

Prepares optimized textures for the 3D rim-lit hero portrait:
1. Generates an alpha mask of the subject from assets/source/portrait.png
   (using rembg or PIL/cv2 edge/luma-based background separation).
2. Converts portrait to grayscale with alpha mask.
3. Multiplies depth map by mask to eliminate silhouette bleed / background depth halo.
4. Dilates & smooths depth edges to prevent sharp boundary tearing in parallax.
5. Packs textures:
   - portrait@2x.webp (1536w, RGBA)
   - portrait@1x.webp (768w, RGBA)
   - depth.png (768w, R = depth, G = mask, B = 0)
   - portrait-fallback.webp (pre-toned LCP static fallback image)
Outputs to public/textures/hero/.
"""

import os
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps

SOURCE_PORTRAIT = "assets/source/portrait.png"
SOURCE_DEPTH = "assets/source/depth.png"
OUTPUT_DIR = "public/textures/hero"

def ensure_dirs():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs("assets/source", exist_ok=True)

def extract_mask(portrait_img):
    """
    Attempts rembg with birefnet or u2net if installed.
    Falls back to high-quality threshold/gradient cutout if rembg is unavailable.
    """
    try:
        from rembg import remove, new_session
        print("[prepare_textures] Trying rembg BiRefNet session...")
        try:
            session = new_session("birefnet-general")
            cutout = remove(portrait_img, session=session)
        except Exception as e:
            print(f"[prepare_textures] BiRefNet unavailable ({e}), trying default u2net...")
            session = new_session("u2net")
            cutout = remove(portrait_img, session=session)
        alpha = cutout.split()[3]
        return alpha
    except ImportError:
        print("[prepare_textures] rembg not installed. Generating mask from dark studio background...")
        # Since portrait is on a clean black studio background (#000000):
        # We can extract mask via thresholding & soft matte
        gray = ImageOps.grayscale(portrait_img)
        arr = np.array(gray, dtype=np.float32)
        # Background is near 0. Subject has highlights and clothes.
        # Create a smooth alpha curve
        alpha_arr = np.clip((arr - 4.0) / 18.0 * 255.0, 0, 255).astype(np.uint8)
        mask = Image.fromarray(alpha_arr)
        # Smooth mask slightly
        mask = mask.filter(ImageFilter.GaussianBlur(radius=1.5))
        return mask

def process():
    ensure_dirs()
    if not os.path.exists(SOURCE_PORTRAIT) or not os.path.exists(SOURCE_DEPTH):
        print(f"Error: Missing {SOURCE_PORTRAIT} or {SOURCE_DEPTH}")
        sys.exit(1)

    print(f"Loading {SOURCE_PORTRAIT} and {SOURCE_DEPTH}...")
    portrait = Image.open(SOURCE_PORTRAIT).convert("RGBA")
    depth = Image.open(SOURCE_DEPTH).convert("L")

    width, height = portrait.size
    print(f"Source size: {width}x{height}")

    # 1. Mask
    mask = extract_mask(portrait)
    mask = mask.resize((width, height), Image.Resampling.LANCZOS)
    mask_np = np.array(mask, dtype=np.float32) / 255.0

    # 2. Portrait RGBA (grayscale color channels + mask alpha)
    portrait_gray = ImageOps.grayscale(portrait)
    portrait_rgba = Image.merge("RGBA", (
        portrait_gray,
        portrait_gray,
        portrait_gray,
        mask
    ))

    # Save portrait@2x.webp
    portrait_2x_path = os.path.join(OUTPUT_DIR, "portrait@2x.webp")
    portrait_rgba.save(portrait_2x_path, format="WEBP", quality=90, method=6)
    print(f"Saved {portrait_2x_path}")

    # 3. Portrait@1x.webp
    half_size = (width // 2, height // 2)
    portrait_1x = portrait_rgba.resize(half_size, Image.Resampling.LANCZOS)
    portrait_1x_path = os.path.join(OUTPUT_DIR, "portrait@1x.webp")
    portrait_1x.save(portrait_1x_path, format="WEBP", quality=85, method=6)
    print(f"Saved {portrait_1x_path}")

    # 4. Depth map processing
    # Resize depth to half_size (768px wide)
    depth_half = depth.resize(half_size, Image.Resampling.LANCZOS)
    mask_half = mask.resize(half_size, Image.Resampling.LANCZOS)

    depth_np = np.array(depth_half, dtype=np.float32) / 255.0
    mask_half_np = np.array(mask_half, dtype=np.float32) / 255.0

    # Multiply depth by mask to eliminate silhouette mismatch / depth bleeding outside subject
    # Normalize depth so closest foreground features use full 0-1 range
    masked_depth = depth_np * (mask_half_np > 0.05)
    valid_depths = masked_depth[mask_half_np > 0.1]
    if len(valid_depths) > 0:
        d_min = np.min(valid_depths)
        d_max = np.max(valid_depths)
        if d_max > d_min:
            depth_normalized = np.clip((masked_depth - d_min) / (d_max - d_min), 0.0, 1.0)
        else:
            depth_normalized = masked_depth
    else:
        depth_normalized = masked_depth

    # Subtle gaussian blur to smooth polygon/disparity banding
    depth_img = Image.fromarray((depth_normalized * 255.0).astype(np.uint8))
    depth_smoothed = depth_img.filter(ImageFilter.GaussianBlur(radius=2.0))
    depth_smooth_np = np.array(depth_smoothed)

    # Pack into RGBA image: R = depth, G = mask, B = 0, A = 255
    r_channel = Image.fromarray(depth_smooth_np)
    g_channel = mask_half
    b_channel = Image.fromarray(np.zeros_like(depth_smooth_np))
    a_channel = Image.fromarray(np.full_like(depth_smooth_np, 255))

    packed_depth = Image.merge("RGBA", (r_channel, g_channel, b_channel, a_channel))
    depth_out_path = os.path.join(OUTPUT_DIR, "depth.png")
    packed_depth.save(depth_out_path, format="PNG", optimize=True)
    print(f"Saved {depth_out_path}")

    # 5. Pre-darkened static fallback for LCP & no-WebGL
    # Face ~15-20% exposure, rim highlights preserved
    p_arr = np.array(portrait_gray, dtype=np.float32) / 255.0
    luma = p_arr
    # highlights (> 0.5) stay brighter, shadows darken
    base = p_arr * 0.18
    rim_preserve = np.clip((luma - 0.5) / 0.35, 0.0, 1.0)
    toned = base * (1.0 - rim_preserve) + p_arr * rim_preserve
    toned_img = Image.fromarray((toned * 255.0).astype(np.uint8))
    fallback_rgba = Image.merge("RGBA", (toned_img, toned_img, toned_img, mask))
    fallback_path = os.path.join(OUTPUT_DIR, "portrait-fallback.webp")
    fallback_rgba.save(fallback_path, format="WEBP", quality=85)
    print(f"Saved {fallback_path}")

    print("Asset pipeline complete!")

if __name__ == "__main__":
    process()
