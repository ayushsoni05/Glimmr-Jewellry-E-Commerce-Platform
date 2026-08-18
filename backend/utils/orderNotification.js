const nodemailer = require('nodemailer');
const axios = require('axios');
const Order = require('../models/Order');
const User = require('../models/User');

// Log Brevo configuration
console.log('[ORDER_MAIL] BREVO_API_KEY present:', !!process.env.BREVO_API_KEY);
console.log('[ORDER_MAIL] BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL);

function createMailTransport() {
  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    const isBrevo = host.includes('brevo');
    console.log('[ORDER_MAIL] Using SMTP host:', host, 'port:', port, 'user:', user ? 'set' : 'missing');
    console.log('[ORDER_MAIL] SMTP provider is Brevo:', isBrevo);
    return nodemailer.createTransport({
      host,
      port,
      secure: false,
      pool: false,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 5000,
      socketTimeout: 8000,
    });
  }

  console.warn('SMTP credentials not configured. Falling back to console email logger. Configure SMTP_* env vars for production.');
  return nodemailer.createTransport({ jsonTransport: true });
}

const mailTransport = createMailTransport();

// Helper function to send email: try Resend REST API, Brevo API, or SMTP
async function sendEmail({ to, subject, html }) {
  const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const fromName = 'Glimmr Jewelry';

  console.log('[ORDER_EMAIL] Attempting to send...');
  console.log('[ORDER_EMAIL] To:', to);
  console.log('[ORDER_EMAIL] From:', fromEmail);
  console.log('[ORDER_EMAIL] Subject:', subject);

  // 1. Try Resend REST API if key is present
  const resendKey = process.env.RESEND_API_KEY || (process.env.SMTP_PASS && process.env.SMTP_PASS.startsWith('re_') ? process.env.SMTP_PASS : null);
  if (resendKey) {
    try {
      console.log('[ORDER_EMAIL] Sending via Resend REST API (HTTPS)...');
      const response = await axios.post(
        'https://api.resend.com/emails',
        {
          from: process.env.RESEND_FROM_EMAIL || 'Glimmr Jewelry <onboarding@resend.dev>',
          to: [to],
          subject,
          html,
        },
        {
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );
      console.log('[ORDER_EMAIL] Sent via Resend REST API successfully:', response.data?.id);
      return response.data;
    } catch (resendError) {
      const errDetail = resendError.response?.data?.message || resendError.message;
      console.warn('[ORDER_EMAIL] Resend REST API failed:', errDetail);
    }
  }

  // 2. Try Brevo API if available
  if (process.env.BREVO_API_KEY) {
    try {
      console.log('[ORDER_EMAIL] Sending via Brevo REST API...');
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { email: fromEmail, name: fromName },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        },
        {
          headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
          timeout: 8000,
        }
      );
      console.log('[ORDER_EMAIL] Sent via Brevo API successfully:', response.data?.messageId || 'success');
      return response.data;
    } catch (brevoError) {
      console.warn('[ORDER_EMAIL] Brevo API failed:', brevoError.message);
    }
  }

  // 3. Try SMTP fallback
  try {
    const result = await mailTransport.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
    });
    console.log('[ORDER_EMAIL] Sent via SMTP successfully:', result?.messageId || 'success');
    return result;
  } catch (smtpError) {
    console.warn('[ORDER_EMAIL] SMTP failed:', smtpError.message);
    throw smtpError;
  }
}

function getProgressBarHTML(stage) {
  const stages = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const stageIndex = stages.indexOf(stage);
  
  let html = `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0;">
      <tr>
  `;
  
  stages.forEach((s, i) => {
    const isActive = i <= stageIndex;
    const isLast = i === stages.length - 1;
    
    html += `
        <td style="text-align: center; position: relative; width: 25%;">
          <div style="width: 20px; height: 20px; border-radius: 50%; background-color: ${isActive ? '#B59A6C' : '#E5E2D9'}; border: 2px solid #FFFFFF; margin: 0 auto; position: relative; z-index: 2;"></div>
          ${!isLast ? `
          <div style="position: absolute; top: 10px; left: 50%; width: 100%; height: 4px; background-color: ${i < stageIndex ? '#B59A6C' : '#E5E2D9'}; z-index: 1;"></div>
          ` : ''}
          <div style="font-size: 10px; text-transform: uppercase; color: ${isActive ? '#111111' : '#999999'}; margin-top: 8px; font-weight: bold; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">${s}</div>
        </td>
    `;
  });
  
  html += `
      </tr>
    </table>
  `;
  
  return html;
}

const getFooterHTML = () => `
  <tr>
    <td style="padding: 30px; background-color: #111111; text-align: center;">
      <p style="margin: 0 0 10px 0; font-size: 18px; color: #B59A6C; font-family: Georgia, serif; letter-spacing: 3px;">GLIMMR</p>
      <p style="margin: 0 0 10px 0; font-size: 12px; color: #999999; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        Need help? Contact us at <a href="mailto:${process.env.SMTP_USER || 'support@glimmr.com'}" style="color: #B59A6C; text-decoration: none;">${process.env.SMTP_USER || 'support@glimmr.com'}</a><br/><br/>
        This is an automated email. Please do not reply to this message.
      </p>
      <p style="margin: 10px 0 0 0; font-size: 10px; color: #999999; text-transform: uppercase; letter-spacing: 1px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        BIS HALLMARKED • IGI CERTIFIED
      </p>
    </td>
  </tr>
`;

async function sendOrderConfirmationEmail(order, user) {
  try {
    console.log('[ORDER_CONFIRM] Starting to send order confirmation email...');
    console.log('[ORDER_CONFIRM] Order ID:', order?._id);
    console.log('[ORDER_CONFIRM] User email:', user?.email);
    
    // Safety checks
    if (!order || !user) {
      console.error('[ORDER_CONFIRM] Missing order or user data');
      return;
    }

    if (!user.email) {
      console.error('[ORDER_CONFIRM] User has no email address');
      return;
    }

    if (!order.items || order.items.length === 0) {
      console.error('[ORDER_CONFIRM] Order has no items');
      return;
    }

    // Base URL for images (prefer explicit IMAGE_BASE_URL, then BACKEND_URL)
    const imageBase = (process.env.IMAGE_BASE_URL || process.env.BACKEND_URL || 'http://127.0.0.1:5002').replace(/\/$/, '');

    // Build items with images and full details
    const itemsHtml = order.items.map(item => {
      const product = item.product || {};
      const rawImg = product.images && product.images.length > 0 ? product.images[0] : '';
      
      // Fix image URL construction
      let imageUrl = '';
      if (rawImg) {
        if (rawImg.startsWith('http')) {
          // Already full URL
          imageUrl = rawImg;
        } else if (rawImg.startsWith('/uploads/') || rawImg.startsWith('uploads/')) {
          // Local upload path - construct full URL
          const cleanPath = rawImg.startsWith('/') ? rawImg : `/${rawImg}`;
          imageUrl = `${imageBase}${cleanPath}`;
        } else if (rawImg.startsWith('/')) {
          // Already starts with slash
          imageUrl = `${imageBase}${rawImg}`;
        } else {
          // Relative path
          imageUrl = `${imageBase}/${rawImg}`;
        }
      }
      
      console.log('[EMAIL] Product image - Raw:', rawImg, '→ URL:', imageUrl);

      const diamond = product.diamond || {};
      const hasDiamond = !!diamond.hasDiamond || String(product.material || '').toLowerCase() === 'diamond';
      const breakdown = product.priceBreakdown || item.priceBreakdown;

      const diamondBlock = hasDiamond ? `
        <div style="margin-top:10px; padding:10px 12px; background:#FAF9F7; border:1px solid #E5E2D9; border-radius:4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <div style="font-size:11px; color:#B59A6C; font-weight:bold; margin-bottom:6px; text-transform:uppercase; letter-spacing:1px;">Diamond Specifications</div>
          <div style="font-size:13px; color:#555555; line-height:1.5;">
            ${diamond.carat ? `<span><strong>Carat:</strong> ${diamond.carat} ct</span><br/>` : ''}
            ${diamond.cut ? `<span><strong>Cut:</strong> ${diamond.cut}</span><br/>` : ''}
            ${diamond.color ? `<span><strong>Color:</strong> ${diamond.color}</span><br/>` : ''}
            ${diamond.clarity ? `<span><strong>Clarity:</strong> ${diamond.clarity}</span><br/>` : ''}
            ${breakdown && breakdown.diamondCost ? `<span><strong>Diamond Cost:</strong> ₹${Math.round(breakdown.diamondCost).toLocaleString('en-IN')}</span><br/>` : ''}
          </div>
          ${breakdown ? `<div style="margin-top:8px; font-size:12px; color:#555555; line-height:1.5;">
            ${breakdown.metalCost !== undefined ? `<div>Metal: ₹${Math.round(breakdown.metalCost).toLocaleString('en-IN')}</div>` : ''}
            ${breakdown.makingCharges !== undefined ? `<div>Making: ₹${Math.round(breakdown.makingCharges).toLocaleString('en-IN')}</div>` : ''}
            ${breakdown.gst !== undefined ? `<div>GST: ₹${Math.round(breakdown.gst).toLocaleString('en-IN')}</div>` : ''}
            ${breakdown.finalPrice !== undefined ? `<div style="font-weight:bold; color:#111111;">Total: ₹${Math.round(breakdown.finalPrice).toLocaleString('en-IN')}</div>` : ''}
          </div>` : ''}
        </div>
      ` : '';
      
      return `
        <tr style="border-bottom: 1px solid #E5E2D9;">
          <td style="padding: 20px; vertical-align: top;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="120" style="vertical-align: top;">
                  ${imageUrl ? `<img src="${imageUrl}" alt="${product.name || 'Product'}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px; border: 1px solid #E5E2D9;" />` : ''}
                </td>
                <td style="padding-left: 15px; vertical-align: top; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #111111; font-weight: bold;">${product.name || 'Product'}</h3>
                  <p style="margin: 5px 0; color: #555555; font-size: 14px;">
                    <strong>Material:</strong> ${product.material || 'N/A'}
                    ${product.material?.toLowerCase() === 'gold' && product.karat ? ` • <strong>${product.karat}K</strong>` : ''}
                  </p>
                  <p style="margin: 5px 0; color: #555555; font-size: 14px;">
                    <strong>Weight:</strong> ${product.weight ? `${product.weight}g` : 'N/A'}
                  </p>
                  ${product.description ? `<p style="margin: 5px 0; color: #555555; font-size: 13px;">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>` : ''}
                  ${diamondBlock}
                  <p style="margin: 10px 0 0 0; color: #111111; font-size: 14px;">
                    <strong>Quantity:</strong> ${item.quantity} × ₹${(item.price || 0).toLocaleString('en-IN')} = <strong>₹${((item.price || 0) * item.quantity).toLocaleString('en-IN')}</strong>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }).join('');

    // Price breakdown
    const subtotal = order.items.reduce((sum, itm) => sum + ((itm.price || 0) * (itm.quantity || 1)), 0);
    const taxAmount = (order.totalAmount || 0) - subtotal || Math.round(subtotal * 0.03);
    const totalAmount = order.totalAmount || (subtotal + taxAmount);
    const paymentMethodText = (order.paymentMethod || 'cod') === 'cod' ? 'COD' : (order.paymentMethod || 'cod') === 'upi' ? 'UPI' : 'Card';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF9F7; color: #555555;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAF9F7; padding: 20px 0;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #FFFFFF; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #111111; padding: 30px; text-align: center; border-bottom: 2px solid #B59A6C;">
                  <h1 style="margin: 0; color: #B59A6C; font-family: Georgia, serif; font-size: 24px; font-weight: normal; letter-spacing: 4px; text-transform: uppercase;">GLIMMR</h1>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding: 30px 30px 20px 30px;">
                  <h2 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C; font-weight: bold; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px;">ORDER CONFIRMED</h2>
                  <p style="margin: 0 0 15px 0; font-size: 14px; color: #111111; line-height: 1.6;">
                    Dear <strong>${user.name || 'Valued Customer'}</strong>,
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #555555; line-height: 1.6;">
                    Your order has been successfully confirmed. We are preparing your pieces with the utmost care and attention to detail.
                  </p>
                  
                  ${getProgressBarHTML('Confirmed')}
                  
                  <div style="margin-top: 20px; font-size: 14px; color: #111111;">
                    <strong>Order ID:</strong> #${order._id || 'N/A'}
                  </div>
                </td>
              </tr>

              <!-- Order Items -->
              <tr>
                <td style="padding: 0 30px 20px 30px;">
                  <h2 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C; font-weight: bold; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px;">
                    YOUR ITEMS
                  </h2>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #E5E2D9; border-radius: 4px; overflow: hidden;">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>

              <!-- Order Summary -->
              <tr>
                <td style="padding: 0 30px 20px 30px;">
                  <div style="background-color: #FAF9F7; padding: 20px; border-radius: 4px; border: 1px solid #E5E2D9;">
                    <h2 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C; font-weight: bold; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px;">ORDER SUMMARY</h2>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                      <tr>
                        <td style="font-size: 14px; color: #555555; padding: 4px 0;">Subtotal</td>
                        <td align="right" style="font-size: 14px; color: #111111; padding: 4px 0;">₹${subtotal.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #555555; padding: 4px 0;">GST (3%)</td>
                        <td align="right" style="font-size: 14px; color: #111111; padding: 4px 0;">₹${taxAmount.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td colspan="2"><div style="height: 1px; background: #E5E2D9; margin: 8px 0;"></div></td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #111111; padding: 6px 0; font-weight: bold;">Total (incl. GST)</td>
                        <td align="right" style="font-size: 18px; color: #111111; padding: 6px 0; font-weight: bold;">₹${totalAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- Shipping Address & Payment -->
              <tr>
                <td style="padding: 0 30px 20px 30px;">
                  <div style="background-color: #FAF9F7; padding: 20px; border-radius: 4px; border: 1px solid #E5E2D9;">
                    <h2 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C; font-weight: bold; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px;">DELIVERY ADDRESS</h2>
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #555555; line-height: 1.6;">
                      <strong>${order.shippingAddress?.name || user.name || ''}</strong><br/>
                      ${order.shippingAddress?.line1 || ''}<br/>
                      ${order.shippingAddress?.line2 ? `${order.shippingAddress.line2}<br/>` : ''}
                      ${order.shippingAddress?.city || ''}${order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''}${order.shippingAddress?.pincode ? ` - ${order.shippingAddress.pincode}` : ''}<br/>
                      ${order.shippingAddress?.country || ''}<br/>
                      Phone: ${(order.shippingAddress?.phone || user.phone || '').toString()}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #555555;">
                      <strong>Payment Method:</strong> ${paymentMethodText}
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Track Order Button -->
              <tr>
                <td style="padding: 10px 30px 30px 30px;" align="center">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?tab=orders" style="display: inline-block; padding: 14px 28px; background-color: #B59A6C; color: #FFFFFF; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                    TRACK YOUR ORDER
                  </a>
                </td>
              </tr>
              
              <!-- Good Wishes -->
              <tr>
                <td style="padding: 30px; border-top: 1px solid #E5E2D9; text-align: center; background-color: #FAF9F7;">
                  <p style="margin: 0 0 15px 0; font-size: 14px; color: #555555; line-height: 1.6;">
                    Each piece is crafted with dedication exclusively for you. We hope it brings elegance to your everyday.
                  </p>
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #111111; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Share Your Experience</p>
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" style="display: inline-block; margin-top: 5px; padding: 10px 20px; border: 1px solid #B59A6C; color: #B59A6C; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                    CONTINUE SHOPPING
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              ${getFooterHTML()}

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

    await sendEmail({
      to: user.email,
      subject: `Order Confirmed #${order._id} - Glimmr Jewelry`,
      html
    });
    console.log(`[NOTIFICATION] Order confirmation email sent to ${user.email}`);
  } catch (err) {
    console.error('[NOTIFICATION] Failed to send order confirmation email:', err.message);
  }
}

async function sendOrderShippedEmail(order, user) {
  try {
    const imageBase = (process.env.IMAGE_BASE_URL || process.env.BACKEND_URL || 'http://127.0.0.1:5002').replace(/\/$/, '');

    const itemsHtml = (order.items || []).map(item => {
      const product = item.product || {};
      const rawImg = product.images && product.images.length > 0 ? product.images[0] : '';
      
      let imageUrl = '';
      if (rawImg) {
        if (rawImg.startsWith('http')) {
          imageUrl = rawImg;
        } else if (rawImg.startsWith('/uploads/') || rawImg.startsWith('uploads/')) {
          const cleanPath = rawImg.startsWith('/') ? rawImg : `/${rawImg}`;
          imageUrl = `${imageBase}${cleanPath}`;
        } else if (rawImg.startsWith('/')) {
          imageUrl = `${imageBase}${rawImg}`;
        } else {
          imageUrl = `${imageBase}/${rawImg}`;
        }
      }
      
      return `
        <tr style="border-bottom: 1px solid #E5E2D9;">
          <td style="padding: 20px; vertical-align: top;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="120" style="vertical-align: top;">
                  ${imageUrl ? `<img src="${imageUrl}" alt="${product.name || 'Product'}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px; border: 1px solid #E5E2D9;" />` : ''}
                </td>
                <td style="padding-left: 15px; vertical-align: top; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #111111; font-weight: bold;">${product.name || 'Product'}</h3>
                  <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Quantity:</strong> ${item.quantity}</p>
                  <p style="margin: 5px 0; color: #111111; font-size: 14px;"><strong>Line Total:</strong> <strong>₹${(((item.price || 0) * (item.quantity || 1)) || 0).toLocaleString('en-IN')}</strong></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }).join('');

    const subtotal = (order.items || []).reduce((sum, itm) => sum + ((itm.price || 0) * (itm.quantity || 1)), 0);
    const taxAmount = (order.totalAmount || 0) - subtotal || Math.round(subtotal * 0.03);
    const totalAmount = order.totalAmount || (subtotal + taxAmount);
    const eta = order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'Coming soon';

    const trackingCard = order.trackingNumber || order.trackingUrl ? `
      <div style="background-color:#FAF9F7; border:1px solid #E5E2D9; border-radius:4px; padding:20px;">
        <h2 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C; font-weight: bold; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px;">SHIPMENT DETAILS</h2>
        ${order.courier ? `<p style="margin:4px 0; color:#555555; font-size:14px;"><strong>Courier:</strong> ${order.courier}</p>` : ''}
        ${order.trackingNumber ? `<p style="margin:4px 0; color:#555555; font-size:14px;"><strong>Tracking No:</strong> ${order.trackingNumber}</p>` : ''}
        <p style="margin:4px 0; color:#555555; font-size:14px;"><strong>Estimated Delivery:</strong> ${eta}</p>
        ${order.trackingUrl ? `<div style="margin-top:15px;"><a href="${order.trackingUrl}" style="display:inline-block; padding:10px 20px; background:#111111; color:#FFFFFF; text-decoration:none; border-radius:4px; font-weight:bold; font-size:12px; text-transform:uppercase; letter-spacing:1px;">TRACK SHIPMENT</a></div>` : ''}
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#FAF9F7; color:#555555;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAF9F7; padding:20px 0;">
          <tr><td align="center">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; background:#FFFFFF; border-radius:4px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #111111; padding: 30px; text-align: center; border-bottom: 2px solid #B59A6C;">
                  <h1 style="margin: 0; color: #B59A6C; font-family: Georgia, serif; font-size: 24px; font-weight: normal; letter-spacing: 4px; text-transform: uppercase;">GLIMMR</h1>
                </td>
              </tr>

              <tr>
                <td style="padding:30px 30px 20px 30px;">
                  <h2 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C; font-weight: bold; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px;">ORDER SHIPPED</h2>
                  <p style="margin:0 0 15px 0; font-size:14px; color:#111111; line-height:1.6;">Dear <strong>${user.name || 'Customer'}</strong>,</p>
                  <p style="margin:0; font-size:14px; color:#555555; line-height:1.6;">Your order <strong>#${order._id}</strong> has been shipped. ${order.trackingNumber ? 'You can track its journey below.' : 'Tracking details will be available shortly.'}</p>
                  
                  ${getProgressBarHTML('Shipped')}
                </td>
              </tr>

              <tr>
                <td style="padding:10px 30px;">${trackingCard}</td>
              </tr>

              <tr>
                <td style="padding:10px 30px;">
                  <h2 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C; font-weight: bold; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px;">ITEMS IN THIS SHIPMENT</h2>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FFFFFF; border:1px solid #E5E2D9; border-radius:4px; overflow:hidden;">${itemsHtml}</table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 30px 20px 30px;">
                  <div style="background:#FAF9F7; padding:20px; border-radius:4px; border:1px solid #E5E2D9;">
                    <h2 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C; font-weight: bold; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px;">ORDER SUMMARY</h2>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr><td style="font-size:14px; color:#555555; padding:4px 0;">Subtotal</td><td align="right" style="font-size:14px; color:#111111; padding:4px 0;">₹${subtotal.toLocaleString('en-IN')}</td></tr>
                      <tr><td style="font-size:14px; color:#555555; padding:4px 0;">GST (3%)</td><td align="right" style="font-size:14px; color:#111111; padding:4px 0;">₹${taxAmount.toLocaleString('en-IN')}</td></tr>
                      <tr><td colspan="2"><div style="height:1px; background:#E5E2D9; margin:8px 0;"></div></td></tr>
                      <tr><td style="font-size:14px; color:#111111; padding:6px 0; font-weight:bold;">Total (incl. GST)</td><td align="right" style="font-size:18px; color:#111111; padding:6px 0; font-weight:bold;">₹${totalAmount.toLocaleString('en-IN')}</td></tr>
                    </table>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:0 30px 20px 30px;">
                  <div style="background:#FAF9F7; padding:20px; border-radius:4px; border:1px solid #E5E2D9;">
                    <h2 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C; font-weight: bold; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px;">DELIVERY ADDRESS</h2>
                    <p style="margin:0; font-size:14px; color:#555555; line-height:1.6;">
                      <strong>${order.shippingAddress?.name || user.name || ''}</strong><br/>
                      ${order.shippingAddress?.line1 || ''}<br/>
                      ${order.shippingAddress?.line2 ? `${order.shippingAddress.line2}<br/>` : ''}
                      ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}<br/>
                      ${order.shippingAddress?.country || ''}<br/>
                      Phone: ${order.shippingAddress?.phone || user.phone || ''}
                    </p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:10px 30px 30px 30px;" align="center">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?tab=orders" style="display:inline-block; padding:14px 28px; background-color:#B59A6C; color:#FFFFFF; text-decoration:none; border-radius:4px; font-weight:bold; font-size:12px; text-transform:uppercase; letter-spacing:2px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">TRACK YOUR ORDER</a>
                </td>
              </tr>

              ${getFooterHTML()}

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `Order Shipped #${order._id} - Glimmr Jewelry`,
      html
    });
    console.log(`[NOTIFICATION] Order shipped email sent to ${user.email}`);
  } catch (err) {
    console.error('[NOTIFICATION] Failed to send order shipped email:', err.message);
  }
}

async function sendOrderDeliveredEmail(order, user) {
  try {
    const imageBase = (process.env.IMAGE_BASE_URL || process.env.BACKEND_URL || 'http://127.0.0.1:5002').replace(/\/$/, '');

    const itemsHtml = (order.items || []).map(item => {
      const product = item.product || {};
      const rawImg = product.images && product.images.length > 0 ? product.images[0] : '';
      const imageUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${imageBase}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`) : '';
      return `
        <tr style="border-bottom:1px solid #E5E2D9;">
          <td style="padding:20px; vertical-align:top;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="120" style="vertical-align: top;">
                  ${imageUrl ? `<img src="${imageUrl}" alt="${product.name || 'Product'}" style="width:100px; height:100px; object-fit:cover; border-radius:4px; border:1px solid #E5E2D9;" />` : ''}
                </td>
                <td style="padding-left:15px; vertical-align:top; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
                  <h3 style="margin:0 0 8px 0; font-size:16px; color:#111111; font-weight:bold;">${product.name || 'Product'}</h3>
                  <p style="margin:5px 0; color:#555555; font-size:14px;"><strong>Quantity:</strong> ${item.quantity}</p>
                  <p style="margin:5px 0; color:#111111; font-size:14px;"><strong>Line Total:</strong> <strong>₹${(((item.price || 0) * (item.quantity || 1)) || 0).toLocaleString('en-IN')}</strong></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }).join('');

    const subtotal = (order.items || []).reduce((sum, itm) => sum + ((itm.price || 0) * (itm.quantity || 1)), 0);
    const taxAmount = (order.totalAmount || 0) - subtotal || Math.round(subtotal * 0.03);
    const totalAmount = order.totalAmount || (subtotal + taxAmount);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#FAF9F7; color:#555555;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAF9F7; padding:20px 0;">
          <tr><td align="center">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; background:#FFFFFF; border-radius:4px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #111111; padding: 30px; text-align: center; border-bottom: 2px solid #B59A6C;">
                  <h1 style="margin: 0; color: #B59A6C; font-family: Georgia, serif; font-size: 24px; font-weight: normal; letter-spacing: 4px; text-transform: uppercase;">GLIMMR</h1>
                </td>
              </tr>

              <tr>
                <td style="padding:30px 30px 20px 30px;">
                  <h2 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C; font-weight: bold; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px;">ORDER DELIVERED</h2>
                  <p style="margin:0 0 15px 0; font-size:14px; color:#111111; line-height:1.6;">Dear <strong>${user.name || 'Customer'}</strong>,</p>
                  <p style="margin:0; font-size:14px; color:#555555; line-height:1.6;">Your order <strong>#${order._id}</strong> has been successfully delivered. We hope you adore your new jewelry.</p>
                  
                  ${getProgressBarHTML('Delivered')}
                </td>
              </tr>

              <tr>
                <td style="padding:10px 30px;">
                  <h2 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C; font-weight: bold; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px;">YOUR ITEMS</h2>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FFFFFF; border:1px solid #E5E2D9; border-radius:4px; overflow:hidden;">${itemsHtml}</table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 30px 20px 30px;">
                  <div style="background:#FAF9F7; padding:20px; border-radius:4px; border:1px solid #E5E2D9;">
                    <h2 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C; font-weight: bold; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px;">ORDER SUMMARY</h2>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr><td style="font-size:14px; color:#555555; padding:4px 0;">Subtotal</td><td align="right" style="font-size:14px; color:#111111; padding:4px 0;">₹${subtotal.toLocaleString('en-IN')}</td></tr>
                      <tr><td style="font-size:14px; color:#555555; padding:4px 0;">GST (3%)</td><td align="right" style="font-size:14px; color:#111111; padding:4px 0;">₹${taxAmount.toLocaleString('en-IN')}</td></tr>
                      <tr><td colspan="2"><div style="height:1px; background:#E5E2D9; margin:8px 0;"></div></td></tr>
                      <tr><td style="font-size:14px; color:#111111; padding:6px 0; font-weight:bold;">Total (incl. GST)</td><td align="right" style="font-size:18px; color:#111111; padding:6px 0; font-weight:bold;">₹${totalAmount.toLocaleString('en-IN')}</td></tr>
                    </table>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:10px 30px 30px 30px;" align="center">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?tab=orders" style="display:inline-block; padding:14px 28px; background-color:#B59A6C; color:#FFFFFF; text-decoration:none; border-radius:4px; font-weight:bold; font-size:12px; text-transform:uppercase; letter-spacing:2px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">VIEW ORDER</a>
                </td>
              </tr>

              ${getFooterHTML()}

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `Order Delivered #${order._id} - Glimmr Jewelry`,
      html
    });
    console.log(`[NOTIFICATION] Order delivered email sent to ${user.email}`);
  } catch (err) {
    console.error('[NOTIFICATION] Failed to send order delivered email:', err.message);
  }
}

async function sendGenericStatusUpdateEmail(order, user, status) {
  try {
    const imageBase = (process.env.IMAGE_BASE_URL || process.env.BACKEND_URL || 'http://127.0.0.1:5002').replace(/\/$/, '');

    const itemsHtml = (order.items || []).map(item => {
      const product = item.product || {};
      const rawImg = product.images && product.images.length > 0 ? product.images[0] : '';
      const imageUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${imageBase}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`) : '';
      return `
        <tr style="border-bottom: 1px solid #E5E2D9;">
          <td style="padding: 15px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="80" style="vertical-align: top;">
                  ${imageUrl ? `<img src="${imageUrl}" alt="${product.name || 'Product'}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 4px; border: 1px solid #E5E2D9;" />` : ''}
                </td>
                <td style="padding-left: 12px; vertical-align: top; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
                  <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #111111; font-weight: bold;">${product.name || 'Product'}</h4>
                  <p style="margin: 3px 0; color: #555555; font-size: 13px;">Quantity: ${item.quantity}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }).join('');

    const statusConfig = {
      pending: { title: 'ORDER PENDING', message: 'Your order is being reviewed' },
      confirmed: { title: 'ORDER CONFIRMED', message: 'Your order has been confirmed' },
      processing: { title: 'ORDER PROCESSING', message: 'We are preparing your order' },
      shipped: { title: 'ORDER SHIPPED', message: 'Your order is on its way' },
      delivered: { title: 'ORDER DELIVERED', message: 'Your order has been delivered' },
      cancelled: { title: 'ORDER CANCELLED', message: 'Your order has been cancelled' },
      returned: { title: 'ORDER RETURNED', message: 'Your order has been marked as returned' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#FAF9F7; color:#555555;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAF9F7; padding:20px 0;">
          <tr><td align="center">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; background:#FFFFFF; border-radius:4px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #111111; padding: 30px; text-align: center; border-bottom: 2px solid #B59A6C;">
                  <h1 style="margin: 0; color: #B59A6C; font-family: Georgia, serif; font-size: 24px; font-weight: normal; letter-spacing: 4px; text-transform: uppercase;">GLIMMR</h1>
                </td>
              </tr>

              <tr>
                <td style="padding:30px 30px 20px 30px;">
                  <h2 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C; font-weight: bold; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px;">${config.title}</h2>
                  <p style="margin:0 0 10px 0; font-size:14px; color:#111111;">Dear <strong>${user.name || 'Customer'}</strong>,</p>
                  <p style="margin:0; font-size:14px; color:#555555; line-height:1.6;">Your order <strong>#${order._id}</strong> status has been updated to <strong>${status}</strong>. ${config.message}.</p>
                </td>
              </tr>

              <tr>
                <td style="padding:0 30px 20px 30px;">
                  <h2 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C; font-weight: bold; border-bottom: 1px solid #E5E2D9; padding-bottom: 8px;">ORDER ITEMS</h2>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FFFFFF; border:1px solid #E5E2D9; border-radius:4px; overflow:hidden;">${itemsHtml}</table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 30px 20px 30px;">
                  <div style="background:#FAF9F7; padding:20px; border-radius:4px; border:1px solid #E5E2D9;">
                    <p style="margin:0; font-size:14px; color:#111111;"><strong>Total Amount:</strong> ₹${(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:10px 30px 30px 30px;" align="center">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?tab=orders" style="display:inline-block; padding:14px 28px; background-color:#B59A6C; color:#FFFFFF; text-decoration:none; border-radius:4px; font-weight:bold; font-size:12px; text-transform:uppercase; letter-spacing:2px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">VIEW ORDER DETAILS</a>
                </td>
              </tr>

              ${getFooterHTML()}

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `Order Update: ${config.title} - #${order._id}`,
      html
    });
    console.log(`[NOTIFICATION] Status update email (${status}) sent to ${user.email}`);
  } catch (err) {
    console.error(`[NOTIFICATION] Failed to send status update email (${status}):`, err.message);
  }
}

async function notifyOrderStatusChange(orderId, newStatus) {
  try {
    console.log('[NOTIFY_STATUS] Starting status change notification...');
    console.log('[NOTIFY_STATUS] Order ID:', orderId);
    console.log('[NOTIFY_STATUS] New status:', newStatus);
    
    const order = await Order.findById(orderId).populate('user').populate('items.product');
    
    if (!order) {
      console.error('[NOTIFY_STATUS] Order not found');
      return;
    }

    // Support guest orders by using shipping address as contact
    const user = order.user || {
      name: order.shippingAddress?.name || 'Guest Customer',
      email: order.shippingAddress?.email,
      phone: order.shippingAddress?.phone,
    };

    if (!user || !user.email) {
      console.error('[NOTIFY_STATUS] No user email available to send notification');
      return;
    }
    console.log('[NOTIFY_STATUS] User email:', user?.email);

    // Ensure legacy orders have required structures
    if (!order.notificationsSent) {
      order.notificationsSent = { confirmed: false, shipped: false, delivered: false };
    }
    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    console.log('[NOTIFY_STATUS] Notifications sent tracker:', order.notificationsSent);

    // Send email based on status
    if (newStatus === 'confirmed' && !order.notificationsSent.confirmed) {
      console.log('[NOTIFY_STATUS] Sending order confirmation email...');
      await sendOrderConfirmationEmail(order, user);
      order.notificationsSent.confirmed = true;
    } else if (newStatus === 'shipped' && !order.notificationsSent.shipped) {
      console.log('[NOTIFY_STATUS] Sending order shipped email...');
      await sendOrderShippedEmail(order, user);
      order.notificationsSent.shipped = true;
    } else if (newStatus === 'delivered' && !order.notificationsSent.delivered) {
      console.log('[NOTIFY_STATUS] Sending order delivered email...');
      await sendOrderDeliveredEmail(order, user);
      order.notificationsSent.delivered = true;
    } else {
      console.log('[NOTIFY_STATUS] Sending generic status update email...');
      // For all other statuses (pending, processing, cancelled, returned), send generic update
      await sendGenericStatusUpdateEmail(order, user, newStatus);
    }

    // Record status change
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      note: 'Status updated from admin panel'
    });

    await order.save();
    console.log(`[NOTIFICATION] Order ${orderId} status updated to ${newStatus}`);
  } catch (error) {
    console.error('[NOTIFICATION] Error notifying order status change:', error);
  }
}

module.exports = {
  notifyOrderStatusChange,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendGenericStatusUpdateEmail
};
