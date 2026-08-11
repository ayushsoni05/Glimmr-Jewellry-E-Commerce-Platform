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
      connectionTimeout: 20000,
      socketTimeout: 30000,
    });
  }

  console.warn('SMTP credentials not configured. Falling back to console email logger. Configure SMTP_* env vars for production.');
  return nodemailer.createTransport({ jsonTransport: true });
}

const mailTransport = createMailTransport();

// Helper function to send email: try SMTP, fallback to Brevo API
async function sendEmail({ to, subject, html }) {
  const fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@glimmr.com';
  const fromName = 'Glimmr';

  console.log('[ORDER_EMAIL] Attempting to send...');
  console.log('[ORDER_EMAIL] To:', to);
  console.log('[ORDER_EMAIL] From:', fromEmail);
  console.log('[ORDER_EMAIL] Subject:', subject);

  // Try SMTP first if configured
  try {
    const result = await mailTransport.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
    });
    console.log('[ORDER_EMAIL] ✅ Sent via SMTP successfully:', result?.messageId || 'success');
    return result;
  } catch (smtpError) {
    console.warn('[ORDER_EMAIL] SMTP failed, attempting Brevo API:', smtpError.message);
  }

  // Fallback to Brevo API if available
  if (!process.env.BREVO_API_KEY) {
    throw new Error('Brevo API key not configured');
  }

  try {
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
        timeout: 20000,
      }
    );
    console.log('[ORDER_EMAIL] ✅ Sent via Brevo API successfully!', response.data?.messageId || response.data);
    return response.data;
  } catch (apiError) {
    console.error('[ORDER_EMAIL] ❌ Brevo API failed:', apiError.response?.data || apiError.message);
    throw apiError;
  }
}

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
        <div style="margin-top:10px; padding:10px 12px; background:#fff8eb; border:1px solid #f3d9a4; border-radius:8px;">
          <div style="font-size:13px; color:#8b5a00; font-weight:700; margin-bottom:6px;">Diamond Details</div>
          <div style="font-size:13px; color:#5a4630; line-height:1.5;">
            ${diamond.carat ? `<span><strong>Carat:</strong> ${diamond.carat} ct</span><br/>` : ''}
            ${diamond.cut ? `<span><strong>Cut:</strong> ${diamond.cut}</span><br/>` : ''}
            ${diamond.color ? `<span><strong>Color:</strong> ${diamond.color}</span><br/>` : ''}
            ${diamond.clarity ? `<span><strong>Clarity:</strong> ${diamond.clarity}</span><br/>` : ''}
            ${breakdown && breakdown.diamondCost ? `<span><strong>Diamond Cost:</strong> ₹${Math.round(breakdown.diamondCost).toLocaleString('en-IN')}</span><br/>` : ''}
          </div>
          ${breakdown ? `<div style="margin-top:8px; font-size:12px; color:#5a4630; line-height:1.5;">
            ${breakdown.metalCost !== undefined ? `<div>Metal: ₹${Math.round(breakdown.metalCost).toLocaleString('en-IN')}</div>` : ''}
            ${breakdown.makingCharges !== undefined ? `<div>Making: ₹${Math.round(breakdown.makingCharges).toLocaleString('en-IN')}</div>` : ''}
            ${breakdown.gst !== undefined ? `<div>GST: ₹${Math.round(breakdown.gst).toLocaleString('en-IN')}</div>` : ''}
            ${breakdown.finalPrice !== undefined ? `<div style="font-weight:700; color:#8b5a00;">Total: ₹${Math.round(breakdown.finalPrice).toLocaleString('en-IN')}</div>` : ''}
          </div>` : ''}
        </div>
      ` : '';
      
      return `
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 20px; vertical-align: top;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="120" style="vertical-align: top;">
                  ${imageUrl ? `<img src="${imageUrl}" alt="${product.name || 'Product'}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 12px; border: 2px solid #f4f1ea;" />` : ''}
                </td>
                <td style="padding-left: 15px; vertical-align: top;">
                  <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #2c2c2c; font-weight: 600;">${product.name || 'Product'}</h3>
                  <p style="margin: 5px 0; color: #666; font-size: 14px;">
                    <strong>Material:</strong> ${product.material || 'N/A'}
                    ${product.material?.toLowerCase() === 'gold' && product.karat ? ` • <strong>${product.karat}K</strong>` : ''}
                  </p>
                  <p style="margin: 5px 0; color: #666; font-size: 14px;">
                    <strong>Weight:</strong> ${product.weight ? `${product.weight}g` : 'N/A'}
                  </p>
                  ${product.description ? `<p style="margin: 5px 0; color: #888; font-size: 13px;">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>` : ''}
                  ${diamondBlock}
                  <p style="margin: 10px 0 0 0; color: #2c2c2c; font-size: 14px;">
                    <strong>Quantity:</strong> ${item.quantity} × ₹${(item.price || 0).toLocaleString('en-IN')} = <span style="color: #b8860b; font-weight: 600;">₹${((item.price || 0) * item.quantity).toLocaleString('en-IN')}</span>
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

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f4;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9f7f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              
              <!-- Header with Gold Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #d4af37 0%, #f4e5c3 50%, #d4af37 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #2c2c2c; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">✨ Order Confirmed!</h1>
                  <p style="margin: 10px 0 0 0; color: #3d3d3d; font-size: 16px; font-weight: 500;">Thank you for your precious order</p>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding: 30px 30px 20px 30px;">
                  <p style="margin: 0; font-size: 18px; color: #2c2c2c; line-height: 1.6;">
                    Dear <strong>${user.name || 'Valued Customer'}</strong>,
                  </p>
                  <p style="margin: 15px 0 0 0; font-size: 15px; color: #555; line-height: 1.7;">
                    Your order has been successfully confirmed! We're thrilled to craft this beautiful jewelry for you. Your elegance is our inspiration. ✨
                  </p>
                </td>
              </tr>

              <!-- Order ID Box -->
              <tr>
                <td style="padding: 0 30px 20px 30px;">
                  <div style="background: linear-gradient(135deg, #fff8dc 0%, #faf0e6 100%); border-left: 4px solid #d4af37; padding: 15px 20px; border-radius: 8px;">
                    <p style="margin: 0; font-size: 14px; color: #666;">Order ID</p>
                    <p style="margin: 5px 0 0 0; font-size: 18px; color: #2c2c2c; font-weight: 700; font-family: monospace;">#${order._id || 'N/A'}</p>
                  </div>
                </td>
              </tr>

              <!-- Order Items -->
              <tr>
                <td style="padding: 0 30px 20px 30px;">
                  <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #2c2c2c; font-weight: 600; border-bottom: 2px solid #f0ead6; padding-bottom: 10px;">
                    💎 Your Precious Items
                  </h2>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fefefe; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden;">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>

              <!-- Order Summary (with GST) -->
              <tr>
                <td style="padding: 0 30px 20px 30px;">
                  <div style="background-color: #fafafa; padding: 16px; border-radius: 12px; border: 1px solid #e8e8e8;">
                    <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #2c2c2c; font-weight: 600;">🧾 Order Summary</h3>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size: 14px; color: #555; padding: 4px 0;">Subtotal</td>
                        <td align="right" style="font-size: 14px; color: #2c2c2c; padding: 4px 0; font-weight: 600;">₹${subtotal.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #555; padding: 4px 0;">GST (3%)</td>
                        <td align="right" style="font-size: 14px; color: #2c2c2c; padding: 4px 0; font-weight: 600;">₹${taxAmount.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td colspan="2"><div style="height: 1px; background: #eee; margin: 8px 0;"></div></td>
                      </tr>
                      <tr>
                        <td style="font-size: 15px; color: #2c2c2c; padding: 6px 0; font-weight: 700;">Total (incl. GST)</td>
                        <td align="right" style="font-size: 18px; color: #b8860b; padding: 6px 0; font-weight: 700;">₹${totalAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- Shipping Address -->
              <tr>
                <td style="padding: 0 30px 20px 30px;">
                  <div style="background-color: #fafafa; padding: 20px; border-radius: 12px; border: 1px solid #e8e8e8;">
                    <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #2c2c2c; font-weight: 600;">📍 Shipping Address</h3>
                    <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.6;">
                      <strong>${order.shippingAddress?.name || user.name || ''}</strong><br/>
                      ${order.shippingAddress?.line1 || ''}<br/>
                      ${order.shippingAddress?.line2 ? `${order.shippingAddress.line2}<br/>` : ''}
                      ${order.shippingAddress?.city || ''}${order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''}${order.shippingAddress?.pincode ? ` - ${order.shippingAddress.pincode}` : ''}<br/>
                      ${order.shippingAddress?.country || ''}<br/>
                      📞 ${(order.shippingAddress?.phone || user.phone || '').toString()}
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Total Amount -->
              <tr>
                <td style="padding: 0 30px 20px 30px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%); padding: 20px; border-radius: 12px;">
                    <tr>
                      <td>
                        <p style="margin: 0; font-size: 14px; color: #d4af37; font-weight: 600;">TOTAL AMOUNT</p>
                      </td>
                      <td align="right">
                        <p style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700;">₹${(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Payment Method -->
              <tr>
                <td style="padding: 0 30px 20px 30px;">
                  <p style="margin: 0; font-size: 14px; color: #666;">
                    <strong>Payment Method:</strong> ${(order.paymentMethod || 'cod') === 'cod' ? '💵 Cash on Delivery' : (order.paymentMethod || 'cod') === 'upi' ? '📱 UPI Payment' : '💳 Card Payment'}
                  </p>
                </td>
              </tr>

              <!-- Track Order Button -->
              <tr>
                <td style="padding: 0 30px 30px 30px;" align="center">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?tab=orders" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #d4af37 0%, #c5a033 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);">
                    📦 Track Your Order
                  </a>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding: 0 30px;">
                  <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, #d4af37 50%, transparent 100%);"></div>
                </td>
              </tr>

              <!-- Good Wishes -->
              <tr>
                <td style="padding: 30px; background: linear-gradient(135deg, #fefefe 0%, #f9f7f4 100%); text-align: center;">
                  <p style="margin: 0; font-size: 18px; color: #2c2c2c; font-weight: 600; line-height: 1.6;">
                    ✨ May this jewelry bring you joy and elegance! ✨
                  </p>
                  <p style="margin: 15px 0; font-size: 14px; color: #666; line-height: 1.7;">
                    Each piece is crafted with love and care, exclusively for you.<br/>
                    We hope it adds sparkle to your precious moments.
                  </p>
                  <div style="margin-top: 25px; padding-top: 25px; border-top: 1px solid #e8e8e8;">
                    <p style="margin: 0 0 10px 0; font-size: 16px; color: #2c2c2c; font-weight: 600;">💖 Loved your purchase?</p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" style="display: inline-block; margin-top: 10px; padding: 12px 32px; background-color: #2c2c2c; color: #d4af37; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                      🛍️ Shop Again
                    </a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 25px 30px; background-color: #2c2c2c; text-align: center;">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #d4af37; font-weight: 600;">Glimmr - Where Elegance Meets Tradition</p>
                  <p style="margin: 0; font-size: 12px; color: #999; line-height: 1.6;">
                    Need help? Contact us at <a href="mailto:${process.env.SMTP_USER || 'support@glimmr.com'}" style="color: #d4af37; text-decoration: none;">${process.env.SMTP_USER || 'support@glimmr.com'}</a><br/>
                    <span style="color: #666;">This is an automated email. Please do not reply to this message.</span>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

    await sendEmail({
      to: user.email,
      subject: `✨ Order Confirmed #${order._id} - Thank You for Choosing Glimmr!`,
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
      
      // Fix image URL construction
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
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 20px; vertical-align: top;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="120" style="vertical-align: top;">
                  ${imageUrl ? `<img src="${imageUrl}" alt="${product.name || 'Product'}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 12px; border: 2px solid #f4f1ea;" />` : ''}
                </td>
                <td style="padding-left: 15px; vertical-align: top;">
                  <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #2c2c2c; font-weight: 600;">${product.name || 'Product'}</h3>
                  <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Quantity:</strong> ${item.quantity}</p>
                  <p style="margin: 5px 0; color: #2c2c2c; font-size: 14px;"><strong>Line Total:</strong> <span style="color: #b8860b; font-weight: 600;">₹${(((item.price || 0) * (item.quantity || 1)) || 0).toLocaleString('en-IN')}</span></p>
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

    const progress = `
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 10px 0 0 0;">
        <tr>
          <td align="center" style="font-size:12px;color:#999;">Confirmed</td>
          <td align="center" style="font-size:12px;color:#999;">Processing</td>
          <td align="center" style="font-size:12px;color:#2c2c2c;font-weight:700;">Shipped</td>
          <td align="center" style="font-size:12px;color:#bbb;">Delivered</td>
        </tr>
        <tr>
          <td colspan="4" style="padding-top:8px;">
            <div style="height:8px; background: linear-gradient(90deg, #d4af37 0%, #d4af37 66%, #e5e5e5 66%, #e5e5e5 100%); border-radius: 999px;"></div>
          </td>
        </tr>
      </table>
    `;

    const trackingCard = order.trackingNumber || order.trackingUrl ? `
      <div style="background-color:#fafafa; border:1px solid #eee; border-radius:12px; padding:16px;">
        <h3 style="margin:0 0 8px 0; font-size:16px; color:#2c2c2c; font-weight:600;">📦 Shipment Details</h3>
        ${order.courier ? `<p style=\"margin:4px 0; color:#555; font-size:14px;\"><strong>Courier:</strong> ${order.courier}</p>` : ''}
        ${order.trackingNumber ? `<p style=\"margin:4px 0; color:#555; font-size:14px;\"><strong>Tracking No:</strong> ${order.trackingNumber}</p>` : ''}
        <p style="margin:4px 0; color:#555; font-size:14px;"><strong>Estimated Delivery:</strong> ${eta}</p>
        ${order.trackingUrl ? `<div style=\"margin-top:8px;\"><a href=\"${order.trackingUrl}\" style=\"display:inline-block; padding:10px 16px; background:#2c2c2c; color:#d4af37; text-decoration:none; border-radius:8px; font-weight:600;\">Track Shipment</a></div>` : ''}
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f9f7f4;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f9f7f4; padding:20px 0;">
          <tr><td align="center">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #1c2541 0%, #2c2c2c 60%, #d4af37 100%); padding:40px 30px; text-align:center;">
                  <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:800; letter-spacing:0.5px;">🚚 Order Shipped</h1>
                  <p style="margin:10px 0 0 0; color:#f3eacb; font-size:16px;">Your jewelry is on its way</p>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 30px 10px 30px;">
                  <p style="margin:0; font-size:16px; color:#2c2c2c;">Dear <strong>${user.name || 'Customer'}</strong>,</p>
                  <p style="margin:12px 0 0 0; font-size:14px; color:#555;">We’ve shipped your order <strong>#${order._id}</strong>. ${order.trackingNumber ? 'Use the details below to follow its journey.' : 'We’ll share tracking details soon.'}</p>
                  ${progress}
                </td>
              </tr>

              <tr>
                <td style="padding:10px 30px;">${trackingCard}</td>
              </tr>

              <tr>
                <td style="padding:10px 30px;">
                  <h2 style="margin:0 0 12px 0; font-size:18px; color:#2c2c2c; font-weight:700;">Items in this Shipment</h2>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fefefe; border:1px solid #f0f0f0; border-radius:12px; overflow:hidden;">${itemsHtml}</table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 30px 20px 30px;">
                  <div style="background:#fafafa; padding:16px; border-radius:12px; border:1px solid #e8e8e8;">
                    <h3 style="margin:0 0 8px 0; font-size:16px; color:#2c2c2c; font-weight:700;">Order Summary</h3>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr><td style="font-size:14px; color:#555; padding:4px 0;">Subtotal</td><td align="right" style="font-size:14px; color:#2c2c2c; padding:4px 0; font-weight:600;">₹${subtotal.toLocaleString('en-IN')}</td></tr>
                      <tr><td style="font-size:14px; color:#555; padding:4px 0;">GST (3%)</td><td align="right" style="font-size:14px; color:#2c2c2c; padding:4px 0; font-weight:600;">₹${taxAmount.toLocaleString('en-IN')}</td></tr>
                      <tr><td colspan="2"><div style="height:1px; background:#eee; margin:8px 0;"></div></td></tr>
                      <tr><td style="font-size:15px; color:#2c2c2c; padding:6px 0; font-weight:700;">Total (incl. GST)</td><td align="right" style="font-size:18px; color:#b8860b; padding:6px 0; font-weight:800;">₹${totalAmount.toLocaleString('en-IN')}</td></tr>
                    </table>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:0 30px 20px 30px;">
                  <div style="background:#fafafa; padding:16px; border-radius:12px; border:1px solid #e8e8e8;">
                    <h3 style="margin:0 0 8px 0; font-size:16px; color:#2c2c2c; font-weight:700;">Shipping Address</h3>
                    <p style="margin:0; font-size:14px; color:#555; line-height:1.6;">
                      <strong>${order.shippingAddress?.name || user.name || ''}</strong><br/>
                      ${order.shippingAddress?.line1 || ''}<br/>
                      ${order.shippingAddress?.line2 ? `${order.shippingAddress.line2}<br/>` : ''}
                      ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}<br/>
                      ${order.shippingAddress?.country || ''}<br/>
                      📞 ${order.shippingAddress?.phone || user.phone || ''}
                    </p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:0 30px 30px 30px;" align="center">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?tab=orders" style="display:inline-block; padding:14px 40px; background: linear-gradient(135deg, #d4af37 0%, #c5a033 100%); color:#ffffff; text-decoration:none; border-radius:8px; font-weight:700; font-size:16px; box-shadow:0 4px 12px rgba(212,175,55,0.3);">Track Your Order</a>
                </td>
              </tr>

              <tr>
                <td style="padding:20px 30px; background:#2c2c2c; text-align:center;">
                  <p style="margin:0 0 10px 0; font-size:14px; color:#d4af37; font-weight:700;">Glimmr — Crafted with Care</p>
                  <p style="margin:0; font-size:12px; color:#999;">Need help? <a href="mailto:${process.env.SMTP_USER || 'support@glimmr.com'}" style="color:#d4af37; text-decoration:none;">${process.env.SMTP_USER || 'support@glimmr.com'}</a></p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `🚚 Order Shipped #${order._id}`,
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
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:20px; vertical-align:top;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="120" style="vertical-align: top;">
                  ${imageUrl ? `<img src="${imageUrl}" alt="${product.name || 'Product'}" style="width:100px; height:100px; object-fit:cover; border-radius:12px; border:2px solid #f4f1ea;" />` : ''}
                </td>
                <td style="padding-left:15px; vertical-align:top;">
                  <h3 style="margin:0 0 8px 0; font-size:18px; color:#2c2c2c; font-weight:700;">${product.name || 'Product'}</h3>
                  <p style="margin:5px 0; color:#666; font-size:14px;"><strong>Quantity:</strong> ${item.quantity}</p>
                  <p style="margin:5px 0; color:#2c2c2c; font-size:14px;"><strong>Line Total:</strong> <span style="color:#b8860b; font-weight:700;">₹${(((item.price || 0) * (item.quantity || 1)) || 0).toLocaleString('en-IN')}</span></p>
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

    const progress = `
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 10px 0 0 0;">
        <tr>
          <td align="center" style="font-size:12px;color:#999;">Confirmed</td>
          <td align="center" style="font-size:12px;color:#999;">Processing</td>
          <td align="center" style="font-size:12px;color:#999;">Shipped</td>
          <td align="center" style="font-size:12px;color:#2c2c2c;font-weight:700;">Delivered</td>
        </tr>
        <tr>
          <td colspan="4" style="padding-top:8px;">
            <div style="height:8px; background: linear-gradient(90deg, #d4af37 0%, #d4af37 100%); border-radius:999px;"></div>
          </td>
        </tr>
      </table>
    `;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f9f7f4;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f9f7f4; padding:20px 0;">
          <tr><td align="center">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #d4af37 0%, #f4e5c3 50%, #d4af37 100%); padding:40px 30px; text-align:center;">
                  <h1 style="margin:0; color:#2c2c2c; font-size:28px; font-weight:800;">🎉 Delivered with Love</h1>
                  <p style="margin:10px 0 0 0; color:#3d3d3d; font-size:16px;">We hope you adore your new jewelry</p>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 30px 10px 30px;">
                  <p style="margin:0; font-size:16px; color:#2c2c2c;">Dear <strong>${user.name || 'Customer'}</strong>,</p>
                  <p style="margin:12px 0 0 0; font-size:14px; color:#555;">Your order <strong>#${order._id}</strong> has been delivered. Thank you for choosing Glimmr. ✨</p>
                  ${progress}
                </td>
              </tr>

              <tr>
                <td style="padding:10px 30px;">
                  <h2 style="margin:0 0 12px 0; font-size:18px; color:#2c2c2c; font-weight:700;">Your Items</h2>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fefefe; border:1px solid #f0f0f0; border-radius:12px; overflow:hidden;">${itemsHtml}</table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 30px 20px 30px;">
                  <div style="background:#fafafa; padding:16px; border-radius:12px; border:1px solid #e8e8e8;">
                    <h3 style="margin:0 0 8px 0; font-size:16px; color:#2c2c2c; font-weight:700;">Order Summary</h3>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr><td style="font-size:14px; color:#555; padding:4px 0;">Subtotal</td><td align="right" style="font-size:14px; color:#2c2c2c; padding:4px 0; font-weight:600;">₹${subtotal.toLocaleString('en-IN')}</td></tr>
                      <tr><td style="font-size:14px; color:#555; padding:4px 0;">GST (3%)</td><td align="right" style="font-size:14px; color:#2c2c2c; padding:4px 0; font-weight:600;">₹${taxAmount.toLocaleString('en-IN')}</td></tr>
                      <tr><td colspan="2"><div style="height:1px; background:#eee; margin:8px 0;"></div></td></tr>
                      <tr><td style="font-size:15px; color:#2c2c2c; padding:6px 0; font-weight:700;">Total (incl. GST)</td><td align="right" style="font-size:18px; color:#b8860b; padding:6px 0; font-weight:800;">₹${totalAmount.toLocaleString('en-IN')}</td></tr>
                    </table>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:0 30px 20px 30px;">
                  <div style="background:#fafafa; padding:16px; border-radius:12px; border:1px solid #e8e8e8;">
                    <h3 style="margin:0 0 8px 0; font-size:16px; color:#2c2c2c; font-weight:700;">Care & Support</h3>
                    <p style="margin:0; font-size:14px; color:#555; line-height:1.6;">If anything isn’t perfect, reply to this email or reach us at <a href="mailto:${process.env.SMTP_USER || 'support@glimmr.com'}" style="color:#b8860b; text-decoration:none;">${process.env.SMTP_USER || 'support@glimmr.com'}</a>. We’re here to help.</p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:0 30px 30px 30px;" align="center">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?tab=orders" style="display:inline-block; padding:14px 40px; background: #2c2c2c; color:#d4af37; text-decoration:none; border-radius:8px; font-weight:700; font-size:16px;">View Order</a>
                </td>
              </tr>

              <tr>
                <td style="padding:20px 30px; background:#2c2c2c; text-align:center;">
                  <p style="margin:0 0 10px 0; font-size:14px; color:#d4af37; font-weight:700;">Glimmr — Thank you for trusting us</p>
                  <p style="margin:0; font-size:12px; color:#999;">This is an automated email. Please do not reply.</p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `🎉 Order Delivered #${order._id}`,
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
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 15px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="80" style="vertical-align: top;">
                  ${imageUrl ? `<img src="${imageUrl}" alt="${product.name || 'Product'}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;" />` : ''}
                </td>
                <td style="padding-left: 12px; vertical-align: top;">
                  <h4 style="margin: 0 0 5px 0; font-size: 15px; color: #2c2c2c; font-weight: 600;">${product.name || 'Product'}</h4>
                  <p style="margin: 3px 0; color: #666; font-size: 13px;">Quantity: ${item.quantity}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }).join('');

    const statusConfig = {
      pending: { emoji: '⏳', title: 'Order Pending', message: 'Your order is being reviewed', color: '#f59e0b' },
      confirmed: { emoji: '✅', title: 'Order Confirmed', message: 'Your order has been confirmed', color: '#10b981' },
      processing: { emoji: '⚙️', title: 'Order Processing', message: 'We are preparing your order', color: '#8b5cf6' },
      shipped: { emoji: '🚚', title: 'Order Shipped', message: 'Your order is on its way', color: '#3b82f6' },
      delivered: { emoji: '🎉', title: 'Order Delivered', message: 'Your order has been delivered', color: '#059669' },
      cancelled: { emoji: '❌', title: 'Order Cancelled', message: 'Your order has been cancelled', color: '#ef4444' },
      returned: { emoji: '↩️', title: 'Order Returned', message: 'Your order has been marked as returned', color: '#f97316' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f9f7f4;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f9f7f4; padding:20px 0;">
          <tr><td align="center">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); padding:30px; text-align:center;">
                  <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:700;">${config.emoji} ${config.title}</h1>
                  <p style="margin:10px 0 0 0; color:#ffffffdd; font-size:14px;">${config.message}</p>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 30px;">
                  <p style="margin:0; font-size:16px; color:#2c2c2c;">Dear <strong>${user.name || 'Customer'}</strong>,</p>
                  <p style="margin:12px 0 0 0; font-size:14px; color:#555;">Your order <strong>#${order._id}</strong> status has been updated to <strong>${status}</strong>.</p>
                </td>
              </tr>

              <tr>
                <td style="padding:0 30px 20px 30px;">
                  <h3 style="margin:0 0 12px 0; font-size:16px; color:#2c2c2c; font-weight:700;">Order Items</h3>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fefefe; border:1px solid #f0f0f0; border-radius:8px; overflow:hidden;">${itemsHtml}</table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 30px 20px 30px;">
                  <div style="background:#fafafa; padding:16px; border-radius:8px;">
                    <p style="margin:0; font-size:14px; color:#2c2c2c;"><strong>Total Amount:</strong> ₹${(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:0 30px 30px 30px;" align="center">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?tab=orders" style="display:inline-block; padding:12px 32px; background: #2c2c2c; color:#d4af37; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px;">View Order Details</a>
                </td>
              </tr>

              <tr>
                <td style="padding:20px 30px; background:#2c2c2c; text-align:center;">
                  <p style="margin:0 0 8px 0; font-size:14px; color:#d4af37; font-weight:600;">Glimmr</p>
                  <p style="margin:0; font-size:12px; color:#999;">Questions? Contact us at ${process.env.SMTP_USER || 'support@glimmr.com'}</p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `${config.emoji} Order Update: ${config.title} - #${order._id}`,
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
