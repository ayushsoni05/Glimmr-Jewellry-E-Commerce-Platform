const nodemailer = require('nodemailer');
const { Resend } = require('resend');

let mailTransport = null;

function createMailTransport() {
  console.log('[MAIL] Initializing mail transport...');
  console.log('[MAIL] SMTP_HOST:', process.env.SMTP_HOST);
  console.log('[MAIL] SMTP_PORT:', process.env.SMTP_PORT);
  console.log('[MAIL] SMTP_USER:', process.env.SMTP_USER);
  console.log('[MAIL] ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
  
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    console.log('[MAIL] Using SMTP configuration');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  console.warn('[MAIL] No SMTP credentials configured. Using JSON transport (testing mode)');
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

// Initialize mail transport
mailTransport = createMailTransport();

// Initialize Resend client if configured
const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM || 'Glimmr <onboarding@resend.dev>';

console.log('[MAIL] Resend client initialized:', !!resendClient);
console.log('[MAIL] FROM_EMAIL configured:', FROM_EMAIL);

async function sendEmail({ to, subject, html, text }) {
  console.log('[EMAIL] Attempting to send email...');
  console.log('[EMAIL] To:', to);
  console.log('[EMAIL] From:', FROM_EMAIL);
  console.log('[EMAIL] Subject:', subject);
  console.log('[EMAIL] Using Resend:', !!resendClient);
  
  if (resendClient) {
    try {
      const result = await resendClient.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
      console.log('[EMAIL] Sent via Resend successfully!');
      console.log('[EMAIL] Resend ID:', result?.id);
      return result;
    } catch (error) {
      console.error('[EMAIL] Resend failed:', error.message);
      console.error('[EMAIL] Full error:', JSON.stringify(error, null, 2));
      throw error;
    }
  } else {
    try {
      const result = await mailTransport.sendMail({
        from: `Glimmr <${FROM_EMAIL}>`,
        to,
        subject,
        html,
        text,
      });
      console.log('[EMAIL] Sent via SMTP:', result?.messageId || 'success');
      return result;
    } catch (error) {
      console.error('[EMAIL] SMTP failed:', error.message);
      throw error;
    }
  }
}

 

/**
 * Send admin notification email when a new user signs up
 */
async function sendSignupNotificationToAdmin(user, signupDetails = {}) {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    
    if (!ADMIN_EMAIL) {
      console.warn('ADMIN_EMAIL not configured. Skipping signup notification.');
      return false;
    }

    const signupTime = new Date(user.createdAt).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: white; padding: 20px; border-radius: 0 0 8px 8px; }
            .detail-row { display: flex; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 12px; }
            .detail-label { font-weight: bold; min-width: 140px; color: #667eea; }
            .detail-value { flex: 1; }
            .badge { display: inline-block; padding: 4px 12px; background: #28a745; color: white; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .footer { text-align: center; padding: 15px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New User Registration</h2>
            </div>
            <div class="content">
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${user.name || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${user.email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${user.phone || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Signup Time:</span>
                <span class="detail-value">${signupTime}</span>
              </div>
              ${signupDetails.ip ? `
              <div class="detail-row">
                <span class="detail-label">IP Address:</span>
                <span class="detail-value"><code>${signupDetails.ip}</code></span>
              </div>
              ` : ''}
              ${signupDetails.userAgent ? `
              <div class="detail-row">
                <span class="detail-label">Device:</span>
                <span class="detail-value">${signupDetails.userAgent.substring(0, 100)}...</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Email Verified:</span>
                <span class="detail-value">${user.emailVerified ? '<span class="badge">Yes</span>' : 'Pending'}</span>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated notification from Glimmr Admin Panel.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
New User Registration
=====================

Name: ${user.name || 'N/A'}
Email: ${user.email}
Phone: ${user.phone || 'N/A'}
Signup Time: ${signupTime}
${signupDetails.ip ? `IP Address: ${signupDetails.ip}` : ''}
${signupDetails.userAgent ? `Device: ${signupDetails.userAgent.substring(0, 100)}...` : ''}
Email Verified: ${user.emailVerified ? 'Yes' : 'Pending'}

This is an automated notification from Glimmr Admin Panel.
    `;

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `New User Registration: ${user.name || user.email}`,
      html: htmlContent
    });

    console.log(`Admin notification sent for user: ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending admin notification:', error.message || error);
    return false;
  }
}

/**
 * Send admin alert for suspicious activity
 */
async function sendSuspiciousActivityAlert(alertDetails) {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    
    if (!ADMIN_EMAIL) {
      console.warn('ADMIN_EMAIL not configured. Skipping alert.');
      return false;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
            .header { background: #dc3545; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: white; padding: 20px; border-radius: 0 0 8px 8px; }
            .detail-row { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Suspicious Activity Alert</h2>
            </div>
            <div class="content">
              <div class="detail-row">
                <span class="detail-label">Alert Type:</span>
                <span>${alertDetails.type || 'Unknown'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Details:</span>
                <span>${alertDetails.message || 'No details provided'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Timestamp:</span>
                <span>${new Date().toISOString()}</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Suspicious Activity: ${alertDetails.type || 'Alert'}`,
      html: htmlContent
    });

    console.log('Suspicious activity alert sent to admin');
    return true;
  } catch (error) {
    console.error('Error sending suspicious activity alert:', error.message || error);
    return false;
  }
}



/**
 * Send admin notification email when a user logs in
 */
async function sendLoginNotificationToAdmin(user, loginDetails = {}) {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    
    if (!ADMIN_EMAIL) {
      console.warn('ADMIN_EMAIL not configured. Skipping login notification.');
      return false;
    }

    const loginTime = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: white; padding: 20px; border-radius: 0 0 8px 8px; }
            .detail-row { display: flex; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 12px; }
            .detail-label { font-weight: bold; min-width: 140px; color: #28a745; }
            .detail-value { flex: 1; }
            .footer { text-align: center; padding: 15px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>User Login Activity</h2>
            </div>
            <div class="content">
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${user.name || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${user.email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Login Time:</span>
                <span class="detail-value">${loginTime}</span>
              </div>
              ${loginDetails.ip ? `
              <div class="detail-row">
                <span class="detail-label">IP Address:</span>
                <span class="detail-value"><code>${loginDetails.ip}</code></span>
              </div>
              ` : ''}
              ${loginDetails.userAgent ? `
              <div class="detail-row">
                <span class="detail-label">Device:</span>
                <span class="detail-value">${loginDetails.userAgent.substring(0, 100)}...</span>
              </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>This is an automated notification from Glimmr Admin Panel.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `User Login: ${user.name || user.email}`,
      html: htmlContent
    });

    console.log(`Admin login notification sent for user: ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending admin login notification:', error.message || error);
    return false;
  }
}

/**
 * Send admin notification email when a new order is placed
 */
async function sendOrderNotificationToAdmin(order, user) {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    
    console.log('[ADMIN_NOTIF] ====== ADMIN EMAIL DEBUG ======');
    console.log('[ADMIN_NOTIF] ADMIN_EMAIL env var:', process.env.ADMIN_EMAIL);
    console.log('[ADMIN_NOTIF] SMTP_USER env var:', process.env.SMTP_USER);
    console.log('[ADMIN_NOTIF] Final ADMIN_EMAIL value:', ADMIN_EMAIL);
    console.log('[ADMIN_NOTIF] ================================');
    
    if (!ADMIN_EMAIL) {
      console.warn('[ADMIN_NOTIF] ADMIN_EMAIL not configured. Skipping order notification.');
      return false;
    }

    console.log('[ADMIN_NOTIF] Sending order notification to:', ADMIN_EMAIL);
    console.log('[ADMIN_NOTIF] Order ID:', order._id);
    console.log('[ADMIN_NOTIF] Customer:', user?.email);

    const orderTime = new Date(order.createdAt).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    // Image base URL (force https to avoid mixed-content blocking in emails)
    const imageBase = (process.env.IMAGE_BASE_URL || process.env.BACKEND_URL || 'https://glimmr-jewellry-e-commerce-platform-5.onrender.com').replace(/\/$/, '');

    // Build item rows with images and line totals
    const itemsList = order.items.map(item => {
      const product = item.product || {};
      const rawImg = product.images && product.images.length ? product.images[0] : '';
      
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
      
      console.log('[ADMIN EMAIL] Product image - Raw:', rawImg, '→ URL:', imageUrl);
      
      const lineTotal = (item.price || 0) * (item.quantity || 1);
      const diamond = product.diamond || {};
      const hasDiamond = !!diamond.hasDiamond || String(product.material || '').toLowerCase() === 'diamond';
      const breakdown = product.priceBreakdown || item.priceBreakdown;

      const diamondBlock = hasDiamond ? `
        <div style="margin-top:6px; padding:8px; background:#0f172a; border:1px solid #1e293b; border-radius:8px; color:#e2e8f0;">
          <div style="font-size:12px; font-weight:700; color:#fbbf24;">Diamond</div>
          <div style="font-size:12px; line-height:1.4;">
            ${diamond.carat ? `<div>Carat: ${diamond.carat} ct</div>` : ''}
            ${diamond.cut ? `<div>Cut: ${diamond.cut}</div>` : ''}
            ${diamond.color ? `<div>Color: ${diamond.color}</div>` : ''}
            ${diamond.clarity ? `<div>Clarity: ${diamond.clarity}</div>` : ''}
            ${breakdown && breakdown.diamondCost ? `<div>Diamond Cost: ₹${Math.round(breakdown.diamondCost).toLocaleString('en-IN')}</div>` : ''}
            ${breakdown ? `<div style="margin-top:4px; color:#cbd5e1;">
              ${breakdown.metalCost !== undefined ? `Metal: ₹${Math.round(breakdown.metalCost).toLocaleString('en-IN')}<br/>` : ''}
              ${breakdown.makingCharges !== undefined ? `Making: ₹${Math.round(breakdown.makingCharges).toLocaleString('en-IN')}<br/>` : ''}
              ${breakdown.gst !== undefined ? `GST: ₹${Math.round(breakdown.gst).toLocaleString('en-IN')}<br/>` : ''}
              ${breakdown.finalPrice !== undefined ? `<strong>Total: ₹${Math.round(breakdown.finalPrice).toLocaleString('en-IN')}</strong>` : ''}
            </div>` : ''}
          </div>
        </div>
      ` : '';

      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #1f2937; display: flex; align-items: center; gap: 10px;">
            ${imageUrl ? `<img src="${imageUrl}" alt="${product.name || 'Product'}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 8px; border: 1px solid #334155;" />` : ''}
            <div>
              <div style="font-weight: 600; color: #e2e8f0;">${product.name || 'Product'}</div>
              <div style="font-size: 12px; color: #94a3b8;">${product.material || ''} ${product.karat ? `• ${product.karat}K` : ''}</div>
              ${diamondBlock}
            </div>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #1f2937; text-align: center; color: #e2e8f0;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #1f2937; text-align: right; color: #e2e8f0;">₹${(item.price || 0).toLocaleString('en-IN')}</td>
          <td style="padding: 10px; border-bottom: 1px solid #1f2937; text-align: right; color: #f59e0b; font-weight: 700;">₹${lineTotal.toLocaleString('en-IN')}</td>
        </tr>`;
    }).join('');

    // Price breakdown (subtotal, GST, total)
    const subtotal = order.items.reduce((sum, itm) => sum + ((itm.price || 0) * (itm.quantity || 1)), 0);
    const taxAmount = (order.totalAmount || 0) - subtotal || Math.round(subtotal * 0.03);
    const totalAmount = order.totalAmount || (subtotal + taxAmount);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #e2e8f0; background: #0b1220; }
            .container { max-width: 720px; margin: 0 auto; padding: 0; background: #111827; border-radius: 16px; overflow: hidden; border: 1px solid #1f2937; box-shadow: 0 10px 40px rgba(0,0,0,0.35); }
            .header { background: radial-gradient(circle at 20% 20%, #1f2937, #0b1220 60%), linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #f8fafc; padding: 26px 30px; text-align: center; border-bottom: 1px solid #1f2937; }
            .accent { color: #fbbf24; }
            .content { padding: 24px 28px 30px; }
            .detail-row { display: flex; margin-bottom: 12px; border-bottom: 1px dashed #1f2937; padding-bottom: 10px; }
            .detail-label { font-weight: 600; min-width: 150px; color: #fbbf24; }
            .detail-value { flex: 1; color: #e2e8f0; }
            .order-table { width: 100%; border-collapse: collapse; margin: 18px 0; background: #0f172a; border: 1px solid #1f2937; }
            .order-table th { background: #111827; padding: 12px 10px; text-align: left; border-bottom: 1px solid #1f2937; color: #cbd5e1; font-weight: 600; }
            .summary-box { background: #0f172a; border: 1px solid #1f2937; border-radius: 12px; padding: 14px 16px; margin-top: 14px; }
            .summary-row { display: flex; justify-content: space-between; padding: 6px 0; color: #cbd5e1; }
            .summary-divider { height: 1px; background: #1f2937; margin: 8px 0; }
            .summary-total { color: #fbbf24; font-weight: 800; font-size: 18px; }
            .footer { text-align: center; padding: 18px; color: #94a3b8; font-size: 12px; border-top: 1px solid #1f2937; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.3px;">New Order Placed</h2>
              <p style="margin: 8px 0 0; color: #cbd5e1;">Fresh order alert from Glimmr storefront</p>
            </div>
            <div class="content">
              <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value"><strong>${order._id}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer Name:</span>
                <span class="detail-value">${user?.name || 'Guest'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer Email:</span>
                <span class="detail-value">${user?.email || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer Phone:</span>
                <span class="detail-value">${user?.phone || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Order Time:</span>
                <span class="detail-value">${orderTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Shipping Address:</span>
                <span class="detail-value">
                  ${order.shippingAddress?.name || 'N/A'}<br/>
                  ${order.shippingAddress?.line1 || ''}${order.shippingAddress?.line2 ? `<br/>${order.shippingAddress.line2}` : ''}<br/>
                  ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.pincode || ''}<br/>
                  ${order.shippingAddress?.country || ''} • Phone: ${order.shippingAddress?.phone || user?.phone || 'N/A'}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${(order.paymentMethod || 'cod') === 'cod' ? 'Cash on Delivery' : (order.paymentMethod || '').toUpperCase()}</span>
              </div>
              
              <h3 style="margin-top: 22px; color: #fbbf24;">Order Items</h3>
              <table class="order-table">
                <thead>
                  <tr>
                    <th style="width: 55%;">Product</th>
                    <th style="text-align: center; width: 10%;">Qty</th>
                    <th style="text-align: right; width: 15%;">Price</th>
                    <th style="text-align: right; width: 20%;">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>

              <div class="summary-box">
                <div class="summary-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
                <div class="summary-row"><span>GST (3%)</span><span>₹${taxAmount.toLocaleString('en-IN')}</span></div>
                <div class="summary-divider"></div>
                <div class="summary-row summary-total"><span>Total (incl. GST)</span><span>₹${totalAmount.toLocaleString('en-IN')}</span></div>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Payment Status:</span>
                <span class="detail-value">${order.status}</span>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated notification from Glimmr Admin Panel.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log('[ADMIN_NOTIF] Attempting to send email...');
    console.log('[ADMIN_NOTIF] To:', ADMIN_EMAIL);
    
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Order #${order._id.toString().slice(-6)} - ₹${order.totalAmount.toLocaleString('en-IN')}`,
      html: htmlContent
    });

    console.log('[ADMIN_NOTIF] Email sent successfully');
    return true;
  } catch (error) {
    console.error('[ADMIN_NOTIF] Error sending admin order notification:', error.message || error);
    console.error('[ADMIN_NOTIF] Full error:', error);
    return false;
  }
}

module.exports = {
  sendSignupNotificationToAdmin,
  sendLoginNotificationToAdmin,
  sendSuspiciousActivityAlert,
  sendOrderNotificationToAdmin,
};
