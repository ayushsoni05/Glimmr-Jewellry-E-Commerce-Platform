import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

/**
 * Generate a scannable 2D QR Code data URL
 */
export async function generateQRCodeDataUrl(text, options = {}) {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: options.width || 120,
      margin: options.margin || 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return null;
  }
}

/**
 * Generate a scannable 1D Code128 Barcode data URL
 */
export function generateBarcodeDataUrl(code, options = {}) {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, String(code || '').trim(), {
      format: 'CODE128',
      width: options.width || 1.8,
      height: options.height || 36,
      displayValue: options.displayValue !== undefined ? options.displayValue : false,
      margin: options.margin || 2,
      background: '#ffffff',
      lineColor: '#000000'
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Failed to generate 1D barcode:', err);
    return null;
  }
}

/**
 * Play hardware scanner confirmation tones using Web Audio API
 */
export function playScannerSound(type = 'success') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High crisp A5 note
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else {
      // Error double-buzz
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, ctx.currentTime);
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.18);
    }
  } catch (e) {
    // Audio context may be restricted by autoplay policy
  }
}

/**
 * Print a standard 50x25mm BIS jewellery tag label
 */
export async function printJewelleryThermalTag(product) {
  if (!product) return;

  const sku = product.sku || `MJ-${(product._id || '').slice(-6).toUpperCase()}`;
  const barcodeValue = product.barcode || sku;
  const huid = product.huid ? product.huid.toUpperCase() : '';
  const netWt = (product.netWeight || product.weight || 0).toFixed(3);
  const grossWt = (product.grossWeight || product.weight || 0).toFixed(3);
  const mat = (product.material || 'gold').toLowerCase();
  const purityLabel = mat === 'gold' ? `${product.karat || 22}K 916` : mat === 'silver' ? '925 Silver' : 'Platinum';

  // Generate QR Code with canonical specs payload
  const qrPayload = JSON.stringify({
    sku,
    huid,
    wt: netWt,
    k: product.karat || 22,
    id: product._id
  });

  const [qrDataUrl, barcodeDataUrl] = await Promise.all([
    generateQRCodeDataUrl(qrPayload, { width: 140 }),
    generateBarcodeDataUrl(barcodeValue, { width: 1.6, height: 32 })
  ]);

  const printFrame = document.createElement('iframe');
  printFrame.style.display = 'none';
  document.body.appendChild(printFrame);
  const frameDoc = printFrame.contentDocument || printFrame.contentWindow.document;

  frameDoc.open();
  frameDoc.write(`<!DOCTYPE html>
<html>
<head>
  <title>Tag - ${sku}</title>
  <style>
    @page {
      size: 50mm 25mm;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 50mm;
      height: 25mm;
      font-family: Arial, sans-serif;
      color: #000;
      background: #fff;
      padding: 1.5mm 2mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 0.5px solid #000;
      padding-bottom: 0.5mm;
    }
    .brand {
      font-size: 6.5pt;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .purity {
      font-size: 6pt;
      font-weight: 700;
    }
    .body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0.8mm 0;
    }
    .qr-img {
      width: 14mm;
      height: 14mm;
      object-fit: contain;
    }
    .meta {
      flex: 1;
      padding-left: 2mm;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.4mm;
    }
    .sku {
      font-size: 6.5pt;
      font-weight: 800;
      font-family: 'Courier New', monospace;
    }
    .weight {
      font-size: 5.8pt;
      font-weight: 700;
    }
    .huid {
      font-size: 5.8pt;
      font-weight: 800;
      font-family: 'Courier New', monospace;
      color: #000;
    }
    .footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      border-top: 0.5px solid #000;
      padding-top: 0.5mm;
    }
    .barcode-img {
      height: 5mm;
      width: 38mm;
      object-fit: fill;
    }
    .barcode-txt {
      font-size: 5pt;
      font-family: monospace;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="brand">NEW MONIKA JEWELLERS</span>
    <span class="purity">${purityLabel}</span>
  </div>

  <div class="body">
    ${qrDataUrl ? `<img src="${qrDataUrl}" class="qr-img" alt="QR" />` : ''}
    <div class="meta">
      <div class="sku">${sku}</div>
      <div class="weight">Net: ${netWt}g | Gr: ${grossWt}g</div>
      ${huid ? `<div class="huid">HUID: ${huid}</div>` : ''}
      <div style="font-size: 5pt; color: #444;">${(product.name || 'Ornaments').slice(0, 22)}</div>
    </div>
  </div>

  <div class="footer">
    ${barcodeDataUrl ? `<img src="${barcodeDataUrl}" class="barcode-img" alt="Barcode" />` : ''}
    <span class="barcode-txt">${barcodeValue}</span>
  </div>
</body>
</html>`);
  frameDoc.close();

  setTimeout(() => {
    printFrame.contentWindow.print();
    setTimeout(() => {
      if (document.body.contains(printFrame)) {
        document.body.removeChild(printFrame);
      }
    }, 1500);
  }, 400);
}
