const nodemailer = require('nodemailer');

// Initialize Nodemailer transporter with environment variables or fallback test transport
const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const user = process.env.EMAIL_USER || '';
  const pass = process.env.EMAIL_PASS || '';

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Fallback dev transporter (logs to console)
  return {
    sendMail: async (options) => {
      console.log('--- [DEV EMAIL SERVICE] ---');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`HTML Preview:\n${options.html.substring(0, 300)}...`);
      console.log('---------------------------');
      return { messageId: `dev-mock-${Date.now()}` };
    },
  };
};

const transporter = createTransporter();
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER || 'admin@glimmrjewelry.com';

/**
 * Send automated email to Admin when a new Bespoke Ring Request is submitted
 */
const sendAdminBespokeNotification = async (order) => {
  const mailOptions = {
    from: `"Glimmr Atelier Studio" <${process.env.EMAIL_USER || 'noreply@glimmrjewelry.com'}>`,
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

          <div style="margin-bottom: 25px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #B59A6C; margin-top: 0;">💎 3D Ring Specifications</h3>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #EAEAE8;"><td style="padding: 8px 0; color: #808080;">Precious Metal</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${order.metal.name} (${order.metal.weightGrams}g)</td></tr>
              <tr style="border-bottom: 1px solid #EAEAE8;"><td style="padding: 8px 0; color: #808080;">Gemstone</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${order.gemstone.name}</td></tr>
              <tr style="border-bottom: 1px solid #EAEAE8;"><td style="padding: 8px 0; color: #808080;">Cut & Carat</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${order.cut.name} (${order.caratWeight} ct)</td></tr>
              <tr style="border-bottom: 1px solid #EAEAE8;"><td style="padding: 8px 0; color: #808080;">Art Emblem</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${order.personalization.artEmblemName || 'None'}</td></tr>
              <tr style="border-bottom: 1px solid #EAEAE8;"><td style="padding: 8px 0; color: #808080;">Laser Inscription</td><td style="padding: 8px 0; font-weight: bold; text-align: right; font-style: italic;">"${order.personalization.engravingText || 'None'}"</td></tr>
              <tr style="border-bottom: 1px solid #EAEAE8;"><td style="padding: 8px 0; color: #808080;">Ring Size</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">US ${order.personalization.ringSize}</td></tr>
            </table>
          </div>

          <div style="background-color: #222222; color: #ffffff; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B59A6C;">Estimated Valuation Total</span>
            <h2 style="font-size: 26px; margin: 5px 0 0 0; color: #B59A6C;">₹${(order.pricing.total || 0).toLocaleString('en-IN')}</h2>
          </div>

          <div style="text-align: center;">
            <p style="font-size: 13px; color: #808080;">Log in to the Glimmr Admin Portal to review, assign completion date, and contact customer.</p>
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
    from: `"Glimmr Atelier Studio" <${process.env.EMAIL_USER || 'noreply@glimmrjewelry.com'}>`,
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

          <p style="font-size: 15px; leading: 1.6; color: #444444;">
            Dear <strong>${order.customerName}</strong>,
          </p>
          <p style="font-size: 14px; leading: 1.6; color: #666666;">
            We are delighted to inform you that our master goldsmiths have reviewed and approved your custom 3D ring creation!
          </p>

          <div style="background-color: #FAF9F7; border-left: 4px solid #B59A6C; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <span style="font-size: 11px; letter-spacing: 2px; color: #B59A6C; font-weight: bold; text-transform: uppercase; block; margin-bottom: 5px;">ESTIMATED COMPLETION & DELIVERY DATE</span>
            <h2 style="font-size: 20px; color: #222222; margin: 0 0 10px 0;">${formattedDate}</h2>
            ${adminMessage ? `<p style="font-size: 13px; font-style: italic; color: #555555; margin: 0;">"${adminMessage}"</p>` : ''}
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #B59A6C; margin-top: 0;">Summary of Your Piece</h3>
            <p style="font-size: 13px; margin: 4px 0;"><strong>Metal:</strong> ${order.metal.name}</p>
            <p style="font-size: 13px; margin: 4px 0;"><strong>Gemstone:</strong> ${order.gemstone.name} (${order.caratWeight} ct ${order.cut.name})</p>
            <p style="font-size: 13px; margin: 4px 0;"><strong>Size:</strong> US ${order.personalization.ringSize}</p>
            <p style="font-size: 13px; margin: 4px 0;"><strong>Engraving:</strong> "${order.personalization.engravingText || 'None'}"</p>
          </div>

          <p style="font-size: 13px; color: #808080; text-align: center; border-top: 1px solid #EAEAE8; padding-top: 20px; margin-top: 30px;">
            Our client advisor will contact you at <strong>${order.customerPhone}</strong> to coordinate final fitting and secure delivery.
          </p>

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
  sendAdminBespokeNotification,
  sendCustomerApprovalNotification,
};
