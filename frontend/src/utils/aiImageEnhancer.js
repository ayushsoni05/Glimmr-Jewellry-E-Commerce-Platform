/**
 * aiImageEnhancer.js
 * Client-Side AI Studio Background Engine & Jewelry Image Enhancer
 * Provides instant studio backdrops, luster calibration, and square cropping
 * for Monika Jewellers counter POS billing.
 *
 * Strictly zero emojis in code and comments.
 */

export const STUDIO_PRESETS = [
  {
    id: 'white',
    name: 'Pristine White Studio',
    description: 'Clean pure white with soft grounding shadow, ideal for tax invoices.',
    previewBg: '#FFFFFF',
    textColor: '#111111'
  },
  {
    id: 'champagne',
    name: 'Royal Champagne Velvet',
    description: 'Warm luxury silk beige-gold tone matching Monika Jewellers brand.',
    previewBg: 'linear-gradient(135deg, #FAF7F2 0%, #EFE8DC 100%)',
    textColor: '#B59A6C'
  },
  {
    id: 'obsidian',
    name: 'Midnight Obsidian',
    description: 'Deep jewelry velvet black that makes 22K gold and diamonds pop.',
    previewBg: 'linear-gradient(135deg, #18181B 0%, #09090B 100%)',
    textColor: '#FFFFFF'
  },
  {
    id: 'transparent',
    name: 'Clean Cutout (Transparent)',
    description: 'Jewelry piece isolated with ambient rim glow and no background.',
    previewBg: 'repeating-conic-gradient(#CCCCCC 0% 25%, #FFFFFF 0% 50%) 50% / 12px 12px',
    textColor: '#333333'
  },
  {
    id: 'original',
    name: 'Original Balanced',
    description: 'Retains counter background with lighting and color normalization.',
    previewBg: '#E5E7EB',
    textColor: '#4B5563'
  }
];

export const LUSTER_MODES = [
  {
    id: 'gold',
    name: 'Gold Brilliance',
    description: 'Enhances warm golden highlights, yellow tones, and hallmark clarity.'
  },
  {
    id: 'diamond',
    name: 'Diamond Sparkle',
    description: 'Enhances faceting contrast, specular highlights, and stone refraction.'
  },
  {
    id: 'natural',
    name: 'Natural Calibrated',
    description: 'True-to-life balanced exposure and neutral white balance.'
  }
];

/**
 * Loads an image from a URL or Data URI into an HTMLImageElement
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image for processing: ' + err));
    img.src = src;
  });
}

/**
 * Smart background segmentation and studio backdrop rendering
 */
export async function processStudioImage(imageSrc, options = {}) {
  const {
    preset = 'white',
    luster = 'gold',
    maxDimension = 900,
    quality = 0.92
  } = options;

  if (!imageSrc) return null;

  const img = await loadImage(imageSrc);

  // Determine square dimensions
  const minSide = Math.min(img.width, img.height);
  const targetSize = Math.min(minSide, maxDimension);

  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Source square crop bounds
  const sx = Math.floor((img.width - minSide) / 2);
  const sy = Math.floor((img.height - minSide) / 2);

  // If preset is original, draw directly and apply luster
  if (preset === 'original') {
    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize);
    applyLusterEnhancement(ctx, targetSize, targetSize, luster);
    return canvas.toDataURL('image/jpeg', quality);
  }

  // Draw source image to offscreen canvas for pixel analysis
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = targetSize;
  tempCanvas.height = targetSize;
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
  tempCtx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize);

  const imgData = tempCtx.getImageData(0, 0, targetSize, targetSize);
  const pixels = imgData.data;

  // Sample corner regions to determine background color
  const sampleCornerColors = () => {
    const cornerSize = Math.max(4, Math.floor(targetSize * 0.05));
    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    const sampleBox = (startX, startY) => {
      for (let y = startY; y < startY + cornerSize; y++) {
        for (let x = startX; x < startX + cornerSize; x++) {
          const idx = (y * targetSize + x) * 4;
          rSum += pixels[idx];
          gSum += pixels[idx + 1];
          bSum += pixels[idx + 2];
          count++;
        }
      }
    };
    // Top-left, top-right, bottom-left, bottom-right
    sampleBox(0, 0);
    sampleBox(targetSize - cornerSize, 0);
    sampleBox(0, targetSize - cornerSize);
    sampleBox(targetSize - cornerSize, targetSize - cornerSize);

    return {
      r: rSum / count,
      g: gSum / count,
      b: bSum / count
    };
  };

  const bgRef = sampleCornerColors();
  const threshold = 42; // Distance threshold for background detection

  // Alpha mask generation
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const dist = Math.sqrt(
      (r - bgRef.r) ** 2 +
      (g - bgRef.g) ** 2 +
      (b - bgRef.b) ** 2
    );

    if (dist < threshold) {
      // Background pixel: feather alpha smoothly
      const featherFactor = dist / threshold;
      pixels[i + 3] = Math.round(255 * (featherFactor ** 2));
    } else {
      // Foreground jewelry pixel
      pixels[i + 3] = 255;
    }
  }

  tempCtx.putImageData(imgData, 0, 0);

  // Render Studio Backdrop onto main canvas
  renderStudioBackdrop(ctx, targetSize, targetSize, preset);

  // Draw soft grounding shadow beneath the jewelry piece
  if (preset !== 'transparent') {
    ctx.save();
    ctx.filter = 'blur(14px)';
    ctx.fillStyle = preset === 'obsidian' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(181, 154, 108, 0.28)';
    ctx.beginPath();
    ctx.ellipse(
      targetSize / 2,
      targetSize * 0.76,
      targetSize * 0.32,
      targetSize * 0.08,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  // Draw isolated jewelry over the studio backdrop
  ctx.drawImage(tempCanvas, 0, 0);

  // Apply Luster & Contrast Calibration
  applyLusterEnhancement(ctx, targetSize, targetSize, luster);

  const format = preset === 'transparent' ? 'image/png' : 'image/jpeg';
  return canvas.toDataURL(format, quality);
}

/**
 * Draws the selected studio background pattern/gradient
 */
function renderStudioBackdrop(ctx, width, height, preset) {
  if (preset === 'white') {
    // Pure clean white with ultra-subtle radial highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const grad = ctx.createRadialGradient(
      width / 2, height * 0.45, width * 0.1,
      width / 2, height / 2, width * 0.65
    );
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(1, '#F8F8F8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (preset === 'champagne') {
    // Luxury warm gold silk gradient
    const grad = ctx.createRadialGradient(
      width / 2, height * 0.42, width * 0.1,
      width / 2, height / 2, width * 0.7
    );
    grad.addColorStop(0, '#FAF7F2');
    grad.addColorStop(0.65, '#F4EDE2');
    grad.addColorStop(1, '#EAE1D2');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle gold rim vignette
    ctx.strokeStyle = 'rgba(181, 154, 108, 0.25)';
    ctx.lineWidth = Math.max(1, Math.floor(width * 0.01));
    ctx.strokeRect(0, 0, width, height);
  } else if (preset === 'obsidian') {
    // Rich jewelry box obsidian velvet
    const grad = ctx.createRadialGradient(
      width / 2, height * 0.45, width * 0.05,
      width / 2, height / 2, width * 0.75
    );
    grad.addColorStop(0, '#222226');
    grad.addColorStop(0.5, '#141416');
    grad.addColorStop(1, '#09090B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (preset === 'transparent') {
    // Clears to transparent
    ctx.clearRect(0, 0, width, height);
  }
}

/**
 * Applies fine jewelry luster and color balance adjustments
 */
function applyLusterEnhancement(ctx, width, height, luster) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  if (luster === 'gold') {
    // Warm gold booster: boosts yellow and red in mid/high tones
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // If pixel is yellowish/metallic
      if (r > 120 && g > 90) {
        data[i] = Math.min(255, Math.round(r * 1.05));     // Boost Red
        data[i + 1] = Math.min(255, Math.round(g * 1.03)); // Boost Green
        data[i + 2] = Math.max(0, Math.round(b * 0.95));   // Warm up Blue
      }
    }
  } else if (luster === 'diamond') {
    // Diamond sparkle: expands contrast and clarity
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue;
      for (let c = 0; c < 3; c++) {
        const val = data[i + c];
        // Contrast S-Curve
        const normalized = val / 255;
        const contrasted = normalized < 0.5
          ? 2 * normalized * normalized
          : 1 - 2 * (1 - normalized) * (1 - normalized);
        data[i + c] = Math.min(255, Math.max(0, Math.round(contrasted * 255)));
      }
    }
  }
  // Natural keeps standard linear exposure

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Compresses an image data URL to ensure lightweight storage
 */
export async function optimizeImageForInvoice(imageSrc, maxSide = 640) {
  if (!imageSrc) return '';
  try {
    const img = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;

    if (width > maxSide || height > maxSide) {
      if (width > height) {
        height = Math.round((height * maxSide) / width);
        width = maxSide;
      } else {
        width = Math.round((width * maxSide) / height);
        height = maxSide;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', 0.88);
  } catch {
    return imageSrc;
  }
}
