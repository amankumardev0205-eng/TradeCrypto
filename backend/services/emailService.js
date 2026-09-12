const firestoreService = require('./firestoreService');
const config = require('../config/env');

const EMAIL_LOGS_COLLECTION = 'email_logs';

// Attempt optional nodemailer import gracefully
let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch {
  // Nodemailer optional, fallback to simulated outbox
  nodemailer = null;
}

/**
 * Creates nodemailer transport if credentials exist in config/env
 */
const getTransporter = () => {
  if (!nodemailer) return null;

  const host = process.env.SMTP_HOST || config.smtpHost;
  const port = process.env.SMTP_PORT || config.smtpPort;
  const user = process.env.SMTP_USER || config.smtpUser;
  const pass = process.env.SMTP_PASS || config.smtpPass;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: Number(port) === 465,
      auth: { user, pass },
    });
  }
  return null;
};

/**
 * Render standard NexusTrade HTML Email Wrapper
 */
const renderEmailWrapper = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; }
    .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
    .content { padding: 32px 24px; color: #cbd5e1; font-size: 15px; line-height: 1.6; }
    .content h2 { color: #f8fafc; margin-top: 0; font-size: 20px; }
    .code-box { background-color: #0f172a; border: 1px dashed #3b82f6; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #60a5fa; text-align: center; padding: 16px; margin: 24px 0; }
    .badge-approved { display: inline-block; background-color: #059669; color: #ffffff; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 14px; }
    .badge-rejected { display: inline-block; background-color: #dc2626; color: #ffffff; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 14px; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #0f172a; border-radius: 8px; overflow: hidden; }
    .details-table td { padding: 12px 16px; border-bottom: 1px solid #1e293b; color: #e2e8f0; }
    .details-table td.label { color: #94a3b8; font-weight: 500; width: 40%; }
    .footer { background-color: #0f172a; padding: 16px 24px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #1e293b; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>NexusTrade</h1>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} NexusTrade Exchange. All rights reserved.</p>
      <p>This is an automated operational notification. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

const emailService = {
  /**
   * Generic non-blocking email dispatch handler
   */
  sendEmail: async ({ to, subject, html, text, type = 'GENERAL', metadata = {} }) => {
    if (!to) {
      console.warn('[emailService] Dispatch skipped: Recipient email is missing');
      return { success: false, reason: 'Recipient email missing' };
    }

    const timestamp = new Date().toISOString();
    const fromAddress = process.env.SMTP_FROM || config.smtpFrom || 'noreply@nexustrade.io';

    const logEntry = {
      to,
      from: fromAddress,
      subject,
      type,
      status: 'pending',
      metadata,
      sentAt: timestamp,
    };

    try {
      const transporter = getTransporter();

      if (transporter) {
        await transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          text: text || subject,
          html,
        });
        logEntry.status = 'sent';
        logEntry.mode = 'SMTP';
      } else {
        // Simulated mode
        console.log(`\n================ EMAIL SIMULATED OUTBOX ================`);
        console.log(`TO: ${to}`);
        console.log(`TYPE: ${type}`);
        console.log(`SUBJECT: ${subject}`);
        console.log(`DATE: ${timestamp}`);
        console.log(`--------------------------------------------------------`);
        console.log(text || '[HTML Email Output Logged]');
        console.log(`========================================================\n`);

        logEntry.status = 'simulated';
        logEntry.mode = 'SIMULATION';
      }

      await firestoreService.create(EMAIL_LOGS_COLLECTION, logEntry).catch((e) => {
        console.error('[emailService] Failed to record email audit log:', e.message);
      });

      return { success: true, mode: logEntry.mode, status: logEntry.status };
    } catch (error) {
      console.error('[emailService] Error sending email:', error.message);
      logEntry.status = 'failed';
      logEntry.error = error.message;

      await firestoreService.create(EMAIL_LOGS_COLLECTION, logEntry).catch(() => {});
      return { success: false, error: error.message };
    }
  },

  /**
   * Send User Email Verification Code
   */
  sendVerificationEmail: async ({ to, code, name }) => {
    const greeting = name ? `Hello ${name},` : 'Hello Trader,';
    const subject = `${code} is your NexusTrade verification code`;

    const html = renderEmailWrapper(
      'Verify Your Email Address',
      `
      <h2>Verify Your Email</h2>
      <p>${greeting}</p>
      <p>Thank you for signing up for NexusTrade. Please use the verification code below to confirm your email address:</p>
      <div class="code-box">${code}</div>
      <p>This code will expire in <strong>15 minutes</strong> for security reasons. If you did not create a NexusTrade account, you can safely ignore this message.</p>
      `
    );

    const text = `${greeting}\n\nYour NexusTrade email verification code is: ${code}\n\nThis code expires in 15 minutes.`;

    return await emailService.sendEmail({
      to,
      subject,
      html,
      text,
      type: 'VERIFICATION',
      metadata: { code },
    });
  },

  /**
   * Send Password Reset Link / Code
   */
  sendPasswordResetEmail: async ({ to, resetToken, name }) => {
    const greeting = name ? `Hello ${name},` : 'Hello Trader,';
    const subject = 'NexusTrade Password Reset Request';
    const resetUrl = `${config.clientUrl || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const html = renderEmailWrapper(
      'Password Reset Request',
      `
      <h2>Password Reset Request</h2>
      <p>${greeting}</p>
      <p>We received a request to reset your NexusTrade account password. Click the button below to set a new password:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </p>
      <p>Alternatively, you can copy and paste the reset token into the password reset page:</p>
      <div class="code-box" style="font-size: 16px; letter-spacing: 2px; word-break: break-all;">${resetToken}</div>
      <p>This link is valid for <strong>1 hour</strong>. If you did not request a password reset, please secure your account immediately.</p>
      `
    );

    const text = `${greeting}\n\nReset your NexusTrade password by using token: ${resetToken}\nOr visit: ${resetUrl}`;

    return await emailService.sendEmail({
      to,
      subject,
      html,
      text,
      type: 'PASSWORD_RESET',
      metadata: { resetToken },
    });
  },

  /**
   * Send Password Change Alert
   */
  sendPasswordChangeAlertEmail: async ({ to, name, ip, timestamp }) => {
    const greeting = name ? `Hello ${name},` : 'Hello Trader,';
    const subject = 'Security Alert: Password Updated';
    const timeFormatted = timestamp ? new Date(timestamp).toUTCString() : new Date().toUTCString();

    const html = renderEmailWrapper(
      'Password Update Security Alert',
      `
      <h2>Security Alert: Password Changed</h2>
      <p>${greeting}</p>
      <p>Your NexusTrade password was changed successfully.</p>
      <table class="details-table">
        <tr>
          <td class="label">Date & Time</td>
          <td>${timeFormatted}</td>
        </tr>
        <tr>
          <td class="label">IP Address</td>
          <td>${ip || 'Unknown'}</td>
        </tr>
      </table>
      <p>All existing active sessions have been logged out as a security measure. If you performed this change, no further action is required.</p>
      <p style="color: #f87171;"><strong>If you did NOT authorize this change, please contact support and reset your password immediately.</strong></p>
      `
    );

    const text = `${greeting}\n\nYour NexusTrade password was updated on ${timeFormatted} from IP: ${ip || 'Unknown'}.\nIf you did not initiate this change, contact support immediately.`;

    return await emailService.sendEmail({
      to,
      subject,
      html,
      text,
      type: 'SECURITY_ALERT',
      metadata: { ip, timestamp },
    });
  },

  /**
   * Send KYC Approval/Rejection Notification Email
   */
  sendKycStatusEmail: async ({ to, status, name, reason }) => {
    const greeting = name ? `Hello ${name},` : 'Hello Trader,';
    const isApproved = String(status).toUpperCase() === 'APPROVED';
    const subject = `NexusTrade KYC Verification ${isApproved ? 'Approved' : 'Action Required'}`;

    const statusBadge = isApproved
      ? '<span class="badge-approved">APPROVED</span>'
      : '<span class="badge-rejected">REJECTED</span>';

    const mainText = isApproved
      ? '<p>Congratulations! Your Identity Verification (KYC) submission has been reviewed and <strong>APPROVED</strong>. You now have full access to high-volume trading, deposits, and withdrawal capabilities.</p>'
      : `<p>Your Identity Verification (KYC) submission was reviewed and <strong>REJECTED</strong>.</p>
         <div style="background-color: #1e1b4b; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
           <strong style="color: #f87171;">Reason for Rejection:</strong>
           <p style="margin: 8px 0 0 0; color: #e0e7ff;">${reason || 'Document unreadable or verification requirements not met.'}</p>
         </div>
         <p>Please log in to your account and re-submit your identity documents following the guidelines.</p>`;

    const html = renderEmailWrapper(
      `KYC Status: ${status}`,
      `
      <h2>KYC Verification Status</h2>
      <p>${greeting}</p>
      <p>Status: ${statusBadge}</p>
      ${mainText}
      `
    );

    const text = `${greeting}\n\nYour KYC Status is: ${status}.\n${isApproved ? 'Your account is fully verified.' : 'Reason: ' + (reason || 'Requirements not met.')}`;

    return await emailService.sendEmail({
      to,
      subject,
      html,
      text,
      type: 'KYC_STATUS',
      metadata: { status, reason },
    });
  },

  /**
   * Send Transaction Receipt (Trade / Deposit / Withdrawal)
   */
  sendTransactionReceiptEmail: async ({ to, type, amount, asset, price, txId, timestamp, recipientAddress }) => {
    const subject = `Transaction Confirmation: ${type} ${amount} ${asset}`;
    const formattedTime = timestamp ? new Date(timestamp).toUTCString() : new Date().toUTCString();

    const html = renderEmailWrapper(
      `Transaction Confirmation - ${type}`,
      `
      <h2>Transaction Receipt</h2>
      <p>Your transaction has been executed successfully. Details are below:</p>
      <table class="details-table">
        <tr>
          <td class="label">Transaction Type</td>
          <td><strong>${type}</strong></td>
        </tr>
        <tr>
          <td class="label">Amount</td>
          <td>${amount} ${asset}</td>
        </tr>
        ${price ? `<tr><td class="label">Price per Unit</td><td>$${Number(price).toLocaleString()} USD</td></tr>` : ''}
        ${recipientAddress ? `<tr><td class="label">Destination Address</td><td><code style="color: #60a5fa;">${recipientAddress}</code></td></tr>` : ''}
        <tr>
          <td class="label">Transaction ID</td>
          <td><code style="color: #94a3b8;">${txId || 'N/A'}</code></td>
        </tr>
        <tr>
          <td class="label">Timestamp</td>
          <td>${formattedTime}</td>
        </tr>
        <tr>
          <td class="label">Status</td>
          <td><span class="badge-approved">COMPLETED</span></td>
        </tr>
      </table>
      <p>Thank you for trading on NexusTrade.</p>
      `
    );

    const text = `Transaction Confirmation: ${type}\nAmount: ${amount} ${asset}\nTXID: ${txId}\nStatus: COMPLETED`;

    return await emailService.sendEmail({
      to,
      subject,
      html,
      text,
      type: 'TRANSACTION_RECEIPT',
      metadata: { txId, transactionType: type, amount, asset },
    });
  },
};

module.exports = emailService;
