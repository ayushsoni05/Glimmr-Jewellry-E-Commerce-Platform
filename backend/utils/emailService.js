const nodemailer = require('nodemailer');

// Initialize Nodemailer transporter with environment variables (Brevo / SMTP / Gmail / fallback)
const createTransporter = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp-relay.brevo.com';
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL || process.env.EMAIL_USER || '';
  const pass = process.env.SMTP_PASS || process.env.SMTP_APP_PASSWORD || process.env.EMAIL_PASS || '';

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 15000,
    });
  }

  // Fallback dev transporter (logs to console)
  return {
    sendMail: async (options) => {
      console.log('--- [DEV EMAIL SERVICE] ---');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`HTML Preview:\n${options.html ? options.html.substring(0, 300) : options.text}...`);
      console.log('---------------------------');
      return { messageId: `dev-mock-${Date.now()}` };
    },
  };
};

const transporter = createTransporter();
const SENDER_EMAIL = process.env.BREVO_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || 'glimmr05@gmail.com';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || SENDER_EMAIL || 'admin@glimmrjewelry.com';

/**
 * Generic sendEmail wrapper
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: options.from || `"Glimmr Fine Jewellery" <${SENDER_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };
  return await transporter.sendMail(mailOptions);
};

/**
 * Send an ultra-luxurious, jewelry-themed HTML E-Gift Card email to recipient
 */
const sendLuxuryGiftCardEmail = async ({ recipientName, recipientEmail, senderName, amount, redeemCode, giftNote, deliveryDate }) => {
  const formattedAmount = `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  const storeUrl = process.env.FRONTEND_URL || 'https://glimmr-jewellry-e-commerce-platform.vercel.app';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You Have Received a Glimmr Luxury E-Gift Card</title>
</head>
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121212; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table width="100%" max-width="620" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(181, 154, 108, 0.35); box-shadow: 0 25px 60px rgba(0,0,0,0.6);">
          
          <!-- Top Header Strip -->
          <tr>
            <td align="center" style="background-color: #141414; padding: 30px 20px 20px; border-bottom: 1px solid rgba(181, 154, 108, 0.2);">
              <span style="font-size: 10px; letter-spacing: 4px; color: #B59A6C; font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 8px;">GLM ATELIER · SPECIAL GIFT PRESENTATION</span>
              <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 28px; color: #FFFFFF; letter-spacing: 3px; font-weight: normal;">GLIMMR</h1>
              <span style="font-size: 9px; letter-spacing: 3px; color: #888888; text-transform: uppercase;">FINE JEWELLERY</span>
            </td>
          </tr>

          <!-- Main Greeting -->
          <tr>
            <td style="padding: 35px 35px 20px; text-align: center;">
              <p style="font-size: 11px; letter-spacing: 2px; color: #B59A6C; text-transform: uppercase; margin: 0 0 10px 0; font-weight: bold;">AN EXQUISITE GIFT FOR YOU</p>
              <h2 style="font-family: 'Georgia', serif; font-size: 22px; color: #FFFFFF; margin: 0 0 12px 0; font-weight: normal;">
                Dear ${recipientName},
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #A0A0A0; margin: 0 auto; max-width: 480px;">
                <strong style="color: #FFFFFF;">${senderName}</strong> has presented you with an exclusive luxury fine jewelry gift voucher from Glimmr.
              </p>
            </td>
          </tr>

          <!-- Rendered 3D Luxury E-Gift Card Component -->
          <tr>
            <td align="center" style="padding: 10px 30px 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background: linear-gradient(135deg, #252525 0%, #151515 50%, #222222 100%); border-radius: 12px; border: 1px solid rgba(181, 154, 108, 0.4); box-shadow: 0 15px 35px rgba(0,0,0,0.5); overflow: hidden;">
                <tr>
                  <td style="padding: 25px 25px 20px;">
                    <!-- Card Top Row -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="font-family: 'Georgia', serif; font-size: 18px; color: #B59A6C; letter-spacing: 3px; font-weight: bold; display: block;">GLIMMR</span>
                          <span style="font-size: 8px; letter-spacing: 2px; color: #777777; text-transform: uppercase;">ATELIER GIFT CARD</span>
                        </td>
                        <td align="right">
                          <!-- Gold Metallic Chip Graphic -->
                          <div style="width: 36px; height: 26px; background: linear-gradient(135deg, #B59A6C, #E6D2B5, #997D56); border-radius: 4px; border: 1px solid rgba(255,255,255,0.4); display: inline-block;"></div>
                        </td>
                      </tr>
                    </table>

                    <!-- Card Center Value -->
                    <div style="margin: 25px 0 20px;">
                      <span style="font-size: 9px; letter-spacing: 2px; color: #777777; text-transform: uppercase; display: block; margin-bottom: 4px;">GIFT VOUCHER VALUE</span>
                      <span style="font-family: 'Georgia', serif; font-size: 34px; color: #FFFFFF; font-weight: bold; letter-spacing: 1px;">
                        ${formattedAmount}
                      </span>
                    </div>

                    <!-- Card Bottom Details -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid rgba(181, 154, 108, 0.2); padding-top: 15px;">
                      <tr>
                        <td>
                          <span style="font-size: 8px; letter-spacing: 1px; color: #777777; text-transform: uppercase; display: block;">PRESENTED TO</span>
                          <span style="font-size: 12px; color: #B59A6C; font-weight: bold; text-transform: uppercase;">${recipientName}</span>
                        </td>
                        <td align="right">
                          <span style="font-size: 8px; letter-spacing: 1px; color: #777777; text-transform: uppercase; display: block;">WITH LOVE FROM</span>
                          <span style="font-size: 12px; color: #CCCCCC; font-weight: bold;">${senderName}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Redeem Code Box -->
          <tr>
            <td align="center" style="padding: 0 35px 25px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #242424; border-radius: 8px; border: 1px dashed rgba(181, 154, 108, 0.5); padding: 15px;">
                <tr>
                  <td align="center">
                    <span style="font-size: 10px; letter-spacing: 2px; color: #888888; text-transform: uppercase; display: block; margin-bottom: 6px;">YOUR UNIQUE REDEMPTION VOUCHER CODE</span>
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 22px; letter-spacing: 4px; color: #E8D5B7; font-weight: bold; background-color: #151515; padding: 6px 18px; border-radius: 4px; display: inline-block; border: 1px solid rgba(181,154,108,0.3);">
                      ${redeemCode}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${giftNote ? `
          <!-- Handwritten Message Note Card -->
          <tr>
            <td style="padding: 0 35px 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FDFBF7; border-radius: 8px; border: 1px solid #E8DCC4; box-shadow: inset 0 0 20px rgba(181,154,108,0.08);">
                <tr>
                  <td style="padding: 20px 25px; text-align: center;">
                    <span style="font-size: 9px; letter-spacing: 3px; color: #B59A6C; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 8px;">PERSONAL MESSAGE</span>
                    <p style="font-family: 'Georgia', serif; font-style: italic; font-size: 15px; line-height: 1.7; color: #3A3226; margin: 0;">
                      "${giftNote}"
                    </p>
                    <span style="font-size: 11px; color: #887B68; display: block; margin-top: 10px;">— ${senderName}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Redeem Button CTA -->
          <tr>
            <td align="center" style="padding: 10px 35px 35px;">
              <a href="${storeUrl}/collections" target="_blank" style="background: linear-gradient(135deg, #B59A6C 0%, #9E8357 100%); color: #FFFFFF; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; padding: 16px 36px; border-radius: 4px; display: inline-block; box-shadow: 0 6px 20px rgba(181,154,108,0.35);">
                REDEEM YOUR GIFT AT GLIMMR
              </a>
              <p style="font-size: 12px; color: #777777; margin: 15px 0 0 0;">
                Simply enter your code <strong>${redeemCode}</strong> at checkout or present it at our Atelier Studio.
              </p>
            </td>
          </tr>

          <!-- Footer Trust Badges & Guarantee -->
          <tr>
            <td style="background-color: #141414; padding: 25px 30px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="font-size: 11px; color: #666666; line-height: 1.6;">
                    <span style="color: #B59A6C;">✓ 100% Certified Hallmarked</span> &nbsp;•&nbsp; 
                    <span style="color: #B59A6C;">✓ Never Expires</span> &nbsp;•&nbsp; 
                    <span style="color: #B59A6C;">✓ Insured Pan-India Delivery</span>
                    <br><br>
                    © ${new Date().getFullYear()} Glimmr Fine Jewellery Atelier. All rights reserved.
                    <br>
                    Need assistance? Contact our concierge at <a href="mailto:glimmr05@gmail.com" style="color: #B59A6C; text-decoration: none;">glimmr05@gmail.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const mailOptions = {
    from: `"Glimmr Fine Jewellery" <${SENDER_EMAIL}>`,
    to: recipientEmail,
    subject: `✨ You've Received a ${formattedAmount} Glimmr Luxury E-Gift Card from ${senderName}`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Luxury Gift Card sent to ${recipientEmail} (Code: ${redeemCode})`);
    return info;
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send gift card to ${recipientEmail}:`, err);
    throw err;
  }
};

/**
 * Send automated email to Admin when a new Bespoke Ring Request is submitted
 */
const sendAdminBespokeNotification = async (order) => {
  const mailOptions = {
    from: `"Glimmr Atelier Studio" <${SENDER_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `💍 NEW BESPOKE RING REQUEST: ${order.customOrderId} from ${order.customerName}`,
    html: `
      <div style="font-family: 'Georgia', serif; background-color: #FAF9F7; padding: 30px; color: #222222;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <div style="text-align: center; border-bottom: 2px solid #B59A6C; padding-bottom: 20px; margin-bottom: 25px;">
            <span style="font-size: 11px; letter-spacing: 3px; color: #B59A6C; font-weight: bold; text-transform: uppercase;">GLIMMR LUXURY ATELIER</span>
            <h1 style="font-size: 24px; color: #222222; margin: 10px 0 5px 0;">New Bespoke Ring Request</h1>
            <p style="font-size: 13px; color: #808080; margin: 0;">Order ID: <strong>${order.customOrderId}</strong></p>
          </div>
          <div style="margin-bottom: 25px; background-color: #FAF9F7; padding: 15px; border-radius: 8px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #B59A6C; margin-top: 0;">👤 Customer Details</h3>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Name:</strong> ${order.customerName}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${order.customerEmail}">${order.customerEmail}</a></p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${order.customerPhone}">${order.customerPhone}</a></p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Preferred Contact:</strong> ${order.preferredContactMethod ? order.preferredContactMethod.toUpperCase() : 'PHONE'}</p>
            ${order.notes ? `<p style="margin: 5px 0; font-size: 14px;"><strong>Customer Notes:</strong> "${order.notes}"</p>` : ''}
          </div>
          <div style="background-color: #222222; color: #ffffff; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C;">Estimated Valuation Total</span>
            <h2 style="font-size: 26px; margin: 5px 0 0 0; color: #B59A6C;">₹${(order.pricing?.total || 0).toLocaleString('en-IN')}</h2>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Admin Bespoke Notification sent for order ${order.customOrderId}`);
    return info;
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed sending admin notification:`, err);
  }
};

/**
 * Send automated approval & estimated completion email to Customer
 */
const sendCustomerApprovalNotification = async (order, estimatedCompletionDate, adminMessage) => {
  const formattedDate = new Date(estimatedCompletionDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const mailOptions = {
    from: `"Glimmr Atelier Studio" <${SENDER_EMAIL}>`,
    to: order.customerEmail,
    subject: `✨ YOUR BESPOKE RING HAS BEEN APPROVED! Order ${order.customOrderId}`,
    html: `
      <div style="font-family: 'Georgia', serif; background-color: #FAF9F7; padding: 30px; color: #222222;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <div style="text-align: center; border-bottom: 2px solid #B59A6C; padding-bottom: 20px; margin-bottom: 25px;">
            <span style="font-size: 11px; letter-spacing: 3px; color: #B59A6C; font-weight: bold; text-transform: uppercase;">GLIMMR LUXURY ATELIER</span>
            <h1 style="font-size: 24px; color: #222222; margin: 10px 0 5px 0;">Bespoke Creation Approved</h1>
            <p style="font-size: 13px; color: #808080; margin: 0;">Order Reference: <strong>${order.customOrderId}</strong></p>
          </div>
          <p style="font-size: 15px; color: #444444;">Dear <strong>${order.customerName}</strong>,</p>
          <div style="background-color: #FAF9F7; border-left: 4px solid #B59A6C; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <span style="font-size: 11px; letter-spacing: 2px; color: #B59A6C; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 5px;">ESTIMATED COMPLETION & DELIVERY DATE</span>
            <h2 style="font-size: 20px; color: #222222; margin: 0 0 10px 0;">${formattedDate}</h2>
            ${adminMessage ? `<p style="font-size: 13px; font-style: italic; color: #555555; margin: 0;">"${adminMessage}"</p>` : ''}
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Customer Approval Notification sent to ${order.customerEmail}`);
    return info;
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed sending customer notification:`, err);
  }
};

module.exports = {
  sendEmail,
  sendLuxuryGiftCardEmail,
  sendAdminBespokeNotification,
  sendCustomerApprovalNotification,
};
