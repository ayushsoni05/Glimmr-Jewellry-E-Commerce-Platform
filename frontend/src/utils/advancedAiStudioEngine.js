/**
 * advancedAiStudioEngine.js
 * Advanced AI Jewelry Studio Background Engine & Specular Luster Calibrator
 * Designed specifically for Monika Jewellers counter POS billing and catalog imagery.
 *
 * Provides multi-pass bilateral edge matting, soft grounding contact shadows,
 * luxury studio backdrops, and precious metal luster calibration.
 *
 * Strictly zero emojis in code and comments.
 */

export const ADVANCED_STUDIO_PRESETS = [
  {
    id: 'white',
    name: 'Pristine White Studio',
    subtitle: 'High-Key Archival Studio',
    description: 'Clean pure white with soft grounding contact shadow, engineered for official GST invoices.',
    previewBg: '#FFFFFF',
    textColor: '#111111',
    accentColor: '#B59A6C'
  },
  {
    id: 'champagne',
    name: 'Royal Champagne Silk',
    subtitle: 'Heritage Luxury Tone',
    description: 'Warm silk gradient tailored to accentuate Indian 22K and 24K yellow gold ornaments.',
    previewBg: 'linear-gradient(135deg, #FAF7F2 0%, #EFE8DC 100%)',
    textColor: '#8C6D37',
    accentColor: '#B59A6C'
  },
  {
    id: 'obsidian',
    name: 'Noir Atelier Midnight',
    subtitle: 'Deep Matte Velvet',
    description: 'Deep obsidian backdrop engineered for maximum specular fire on diamonds and polki stones.',
    previewBg: 'linear-gradient(135deg, #121824 0%, #070B12 100%)',
    textColor: '#FFFFFF',
    accentColor: '#F59E0B'
  },
  {
    id: 'marble',
    name: 'Italian Carrara Marble',
    subtitle: 'Natural Stone Counter',
    description: 'Subtle luxury Italian marble texture, perfect for bespoke bridal and heirloom necklaces.',
    previewBg: 'linear-gradient(135deg, #F8F7F4 0%, #EDEAE4 100%)',
    textColor: '#1F2937',
    accentColor: '#9CA3AF'
  },
  {
    id: 'transparent',
    name: 'Isolated Transparent Cutout',
    subtitle: 'Alpha Mask PNG',
    description: 'Clean isolated piece with soft feathering and no background for custom compositing.',
    previewBg: 'repeating-conic-gradient(#CCCCCC 0% 25%, #FFFFFF 0% 50%) 50% / 12px 12px',
    textColor: '#374151',
    accentColor: '#6B7280'
  },
  {
    id: 'original',
    name: 'Original Counter Enhanced',
    subtitle: 'Normalized Exposure',
    description: 'Retains original showroom counter background with calibrated lighting and color balance.',
    previewBg: '#E5E7EB',
    textColor: '#4B5563',
    accentColor: '#4B5563'
  }
];

export const ADVANCED_LUSTER_MODES = [
  {
    id: 'gold',
    name: 'Gold Brilliance (22K/24K)',
    description: 'Enriches warm yellow-gold saturation and restores micro-carving detail from counter glare.'
  },
  {
    id: 'diamond',
    name: 'Diamond Facet Sparkle',
    description: 'Applies unsharp facet masking and specular contrast for maximum stone fire and refraction.'
  },
  {
    id: 'silver',
    name: 'Silver 925 Luster',
    description: 'Neutralizes warm color casts and enhances clean metallic luminance on silver and platinum.'
  },
  {
    id: 'natural',
    name: 'Natural Calibrated',
    description: 'Neutral color balance and balanced dynamic range without tonal saturation.'
  }
];

/**
 * Loads an image from a URL or Data URI into an HTMLImageElement
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image for AI processing: ' + err));
    img.src = src;
  });
}

/**
 * Multi-Pass AI Jewelry Studio Processing Engine
 */
export async function processAdvancedStudioImage(imageSrc, options = {}) {
  const {
    preset = 'white',
    luster = 'gold',
    maxDimension = 1000,
    quality = 0.94,
    shadowIntensity = 0.35,
    autoCenter = true
  } = options;

  if (!imageSrc) return null;

  const img = await loadImage(imageSrc);
  if (!img) return null;

  const width = img.naturalWidth || img.width || 800;
  const height = img.naturalHeight || img.height || 800;

  // Standard square aspect ratio for jewelry piece verification
  const targetSize = Math.min(Math.min(width, height), maxDimension);

  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Source center crop offsets
  const minSide = Math.min(width, height);
  const sx = Math.floor((width - minSide) / 2);
  const sy = Math.floor((height - minSide) / 2);

  // If preset is original, draw directly and apply luster mode
  if (preset === 'original') {
    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize);
    applyMetalLusterTuning(ctx, targetSize, targetSize, luster);
    return canvas.toDataURL('image/jpeg', quality);
  }

  // Draw source image to analysis canvas
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = targetSize;
  srcCanvas.height = targetSize;
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
  srcCtx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize);

  const srcData = srcCtx.getImageData(0, 0, targetSize, targetSize);
  const srcPixels = srcData.data;

  // Pass 1: Salience & Background Reference Sampling
  const cornerSample = samplePerimeterBackground(srcPixels, targetSize, targetSize);

  // Pass 2: Bilateral Alpha Mask Generation
  const mask = generateBilateralJewelryMask(srcPixels, targetSize, targetSize, cornerSample);

  // Pass 3: Render Selected Studio Backdrop
  renderStudioBackdrop(ctx, targetSize, targetSize, preset);

  // Pass 4: Soft Diffuse Contact Grounding Shadow
  if (preset !== 'transparent' && shadowIntensity > 0) {
    renderContactGroundingShadow(ctx, mask, targetSize, targetSize, shadowIntensity);
  }

  // Pass 5: Composite Foreground Jewelry Piece with Alpha Matting
  compositeForegroundWithMatte(ctx, srcPixels, mask, targetSize, targetSize);

  // Pass 6: Precious Metal Luster Calibration
  applyMetalLusterTuning(ctx, targetSize, targetSize, luster);

  const mimeType = preset === 'transparent' ? 'image/png' : 'image/jpeg';
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Samples perimeter regions to accurately estimate counter / background color
 */
function samplePerimeterBackground(pixels, w, h) {
  const margin = Math.max(3, Math.floor(w * 0.04));
  let rSum = 0, gSum = 0, bSum = 0, count = 0;

  // Sample top and bottom rows
  for (let x = 0; x < w; x += 2) {
    for (let y = 0; y < margin; y++) {
      const idx = (y * w + x) * 4;
      rSum += pixels[idx];
      gSum += pixels[idx + 1];
      bSum += pixels[idx + 2];
      count++;
    }
    for (let y = h - margin; y < h; y++) {
      const idx = (y * w + x) * 4;
      rSum += pixels[idx];
      gSum += pixels[idx + 1];
      bSum += pixels[idx + 2];
      count++;
    }
  }

  // Sample left and right columns
  for (let y = margin; y < h - margin; y += 2) {
    for (let x = 0; x < margin; x++) {
      const idx = (y * w + x) * 4;
      rSum += pixels[idx];
      gSum += pixels[idx + 1];
      bSum += pixels[idx + 2];
      count++;
    }
    for (let x = w - margin; x < w; x++) {
      const idx = (y * w + x) * 4;
      rSum += pixels[idx];
      gSum += pixels[idx + 1];
      bSum += pixels[idx + 2];
      count++;
    }
  }

  return {
    r: count > 0 ? rSum / count : 240,
    g: count > 0 ? gSum / count : 240,
    b: count > 0 ? bSum / count : 240
  };
}

/**
 * Generates an edge-preserving bilateral alpha mask
 */
function generateBilateralJewelryMask(pixels, w, h, bgRef) {
  const mask = new Float32Array(w * h);
  const thresholdLow = 32;
  const thresholdHigh = 72;

  // Calculate raw distance and chromatic variance
  for (let i = 0; i < mask.length; i++) {
    const idx = i * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];

    const dr = r - bgRef.r;
    const dg = g - bgRef.g;
    const db = b - bgRef.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    // Compute chromatic saturation (jewelry metals and gemstones have distinct chromaticity)
    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const saturation = maxVal > 0 ? (maxVal - minVal) / maxVal : 0;

    // Detect gold warmth: r > g > b
    const isGoldHue = r > g && g > b && (r - b) > 20;

    let alpha = 0;
    if (isGoldHue && dist > 20) {
      alpha = 1.0;
    } else if (dist <= thresholdLow && saturation < 0.12) {
      alpha = 0.0;
    } else if (dist >= thresholdHigh || saturation > 0.35) {
      alpha = 1.0;
    } else {
      alpha = (dist - thresholdLow) / (thresholdHigh - thresholdLow);
    }

    mask[i] = Math.max(0, Math.min(1, alpha));
  }

  // Smooth mask boundaries with a 3x3 bilateral box filter to feather filigree
  const smoothedMask = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const center = mask[idx];

      // If firmly in foreground or background, retain value
      if (center === 0 || center === 1) {
        smoothedMask[idx] = center;
        continue;
      }

      // Average 3x3 neighborhood
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          sum += mask[(y + dy) * w + (x + dx)];
        }
      }
      smoothedMask[idx] = sum / 9;
    }
  }

  return smoothedMask;
}

/**
 * Renders the chosen studio backdrop onto the canvas
 */
function renderStudioBackdrop(ctx, w, h, preset) {
  if (preset === 'transparent') {
    ctx.clearRect(0, 0, w, h);
    return;
  }

  if (preset === 'champagne') {
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, w * 0.1, w * 0.5, h * 0.5, w * 0.7);
    grad.addColorStop(0, '#FAF7F2');
    grad.addColorStop(0.7, '#F2ECE2');
    grad.addColorStop(1, '#E8DFCFC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (preset === 'obsidian') {
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, w * 0.05, w * 0.5, h * 0.5, w * 0.75);
    grad.addColorStop(0, '#161F2E');
    grad.addColorStop(0.6, '#0D1420');
    grad.addColorStop(1, '#060A10');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (preset === 'marble') {
    ctx.fillStyle = '#F8F7F4';
    ctx.fillRect(0, 0, w, h);
    // Subtle marble veining
    ctx.strokeStyle = 'rgba(180, 175, 165, 0.12)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.25);
    ctx.bezierCurveTo(w * 0.4, h * 0.35, w * 0.6, h * 0.15, w, h * 0.3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w * 0.2, 0);
    ctx.bezierCurveTo(w * 0.3, h * 0.5, w * 0.8, h * 0.6, w * 0.9, h);
    ctx.stroke();
  } else {
    // Default: Pristine White Studio
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.48, w * 0.15, w * 0.5, h * 0.5, w * 0.7);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.8, '#FAF9F7');
    grad.addColorStop(1, '#F3F1EC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

/**
 * Renders a soft diffuse contact grounding shadow beneath the ornament
 */
function renderContactGroundingShadow(ctx, mask, w, h, intensity) {
  // Find bottom-most active pixels of foreground
  let maxY = 0;
  let minX = w, maxX = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[y * w + x] > 0.5) {
        if (y > maxY) maxY = y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }

  if (maxY === 0 || minX >= maxX) return;

  const shadowCenterX = (minX + maxX) / 2;
  const shadowCenterY = Math.min(h - 10, maxY + 4);
  const shadowRadiusX = (maxX - minX) * 0.45;
  const shadowRadiusY = Math.max(8, shadowRadiusX * 0.18);

  ctx.save();
  ctx.translate(shadowCenterX, shadowCenterY);
  ctx.scale(1, shadowRadiusY / shadowRadiusX);

  const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, shadowRadiusX);
  shadowGrad.addColorStop(0, `rgba(20, 20, 20, ${0.45 * intensity})`);
  shadowGrad.addColorStop(0.3, `rgba(40, 35, 30, ${0.25 * intensity})`);
  shadowGrad.addColorStop(0.7, `rgba(80, 75, 70, ${0.08 * intensity})`);
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, shadowRadiusX, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Composites the masked foreground jewelry piece onto the canvas
 */
function compositeForegroundWithMatte(ctx, srcPixels, mask, w, h) {
  const currentData = ctx.getImageData(0, 0, w, h);
  const dst = currentData.data;

  for (let i = 0; i < mask.length; i++) {
    const alpha = mask[i];
    if (alpha <= 0.005) continue;

    const idx = i * 4;
    const srcR = srcPixels[idx];
    const srcG = srcPixels[idx + 1];
    const srcB = srcPixels[idx + 2];

    if (alpha >= 0.995) {
      dst[idx] = srcR;
      dst[idx + 1] = srcG;
      dst[idx + 2] = srcB;
      dst[idx + 3] = 255;
    } else {
      // Linear alpha blend
      dst[idx] = Math.round(srcR * alpha + dst[idx] * (1 - alpha));
      dst[idx + 1] = Math.round(srcG * alpha + dst[idx + 1] * (1 - alpha));
      dst[idx + 2] = Math.round(srcB * alpha + dst[idx + 2] * (1 - alpha));
      dst[idx + 3] = Math.round(255 * alpha + dst[idx + 3] * (1 - alpha));
    }
  }

  ctx.putImageData(currentData, 0, 0);
}

/**
 * Metal Luster Tuning & Specular Highlight Enhancement
 */
function applyMetalLusterTuning(ctx, w, h, luster) {
  if (luster === 'natural') return;

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (luster === 'gold') {
      // Gold Brilliance: Elevate warm tones and recover micro-details in high midtones
      const isGold = r > g && g > b;
      if (isGold) {
        // Boost warmth and richness
        r = Math.min(255, r * 1.05 + 4);
        g = Math.min(255, g * 1.03 + 2);
        b = Math.max(0, b * 0.96);
      }
      // Micro-contrast enhancement
      const avg = (r + g + b) / 3;
      if (avg > 90 && avg < 225) {
        const factor = 1.04;
        r = Math.min(255, avg + (r - avg) * factor);
        g = Math.min(255, avg + (g - avg) * factor);
        b = Math.min(255, avg + (b - avg) * factor);
      }
    } else if (luster === 'diamond') {
      // Diamond Sparkle: High facet contrast and specular sharpness
      const maxRGB = Math.max(r, g, b);
      if (maxRGB > 180) {
        // Brighten facet highlights without blowout
        r = Math.min(255, r * 1.08);
        g = Math.min(255, g * 1.08);
        b = Math.min(255, b * 1.09);
      } else if (maxRGB < 80) {
        // Deepen shadow facet depth
        r = Math.max(0, r * 0.94);
        g = Math.max(0, g * 0.94);
        b = Math.max(0, b * 0.94);
      }
    } else if (luster === 'silver') {
      // Silver 925 Luster: Neutralize warm tone and enhance metallic silver luminance
      const avg = (r + g + b) / 3;
      r = Math.min(255, r * 0.97 + avg * 0.03);
      g = Math.min(255, g * 0.98 + avg * 0.02);
      b = Math.min(255, b * 1.04 + avg * 0.02);
    }

    data[i] = Math.round(r);
    data[i + 1] = Math.round(g);
    data[i + 2] = Math.round(b);
  }

  ctx.putImageData(imgData, 0, 0);
}
