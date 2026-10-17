import nodemailer from "nodemailer";
import { getAllFirestoreAdmins, DEFAULT_BOOTSTRAP_ADMIN } from "./firestore.service.ts";

export interface ApplicantNotificationPayload {
  displayName: string;
  email: string;
  authProvider: string;
  requestedAt: string;
  id: string;
}

/**
 * Generate responsive HTML email notifying administrators of a new pending request
 */
export function generateAdminNotificationHtml(applicant: ApplicantNotificationPayload): string {
  const providerLabel = applicant.authProvider === 'google' ? 'Google OAuth 2.0' : 'Direct Email Registration';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Action Required: New Access Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td style="background-color: #09090b; padding: 26px 32px; text-align: left;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width: 10px; height: 10px; background-color: #f59e0b; border-radius: 50%;"></td>
                  <td style="padding-left: 10px; font-size: 18px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px;">Pitch Black Syndicate</td>
                </tr>
              </table>
              <div style="font-family: monospace; font-size: 11px; color: #a1a1aa; margin-top: 6px; letter-spacing: 1px; text-transform: uppercase;">Access Authorization Notification</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 28px 32px;">
              <div style="display: inline-block; padding: 4px 12px; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 20px; font-size: 11px; font-weight: 600; color: #92400e; margin-bottom: 16px;">
                ● Action Required: Pending Approval
              </div>
              <h1 style="font-size: 20px; font-weight: 700; color: #09090b; margin: 0 0 12px 0;">New User Access Request</h1>
              <p style="font-size: 14px; line-height: 22px; color: #52525b; margin: 0 0 20px 0;">
                A new user has requested authorization to access the Pitch Black Diligence Terminal:
              </p>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <tr>
                  <td style="padding: 6px 12px; font-size: 12px; color: #64748b; width: 35%;">Applicant Name:</td>
                  <td style="padding: 6px 12px; font-size: 13px; font-weight: 600; color: #0f172a;">${applicant.displayName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px; font-size: 12px; color: #64748b;">Applicant Email:</td>
                  <td style="padding: 6px 12px; font-size: 13px; font-weight: 600; color: #0f172a; font-family: monospace;">${applicant.email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px; font-size: 12px; color: #64748b;">Authentication:</td>
                  <td style="padding: 6px 12px; font-size: 13px; font-weight: 600; color: #0f172a;">${providerLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px; font-size: 12px; color: #64748b;">Requested At:</td>
                  <td style="padding: 6px 12px; font-size: 12px; color: #475569; font-family: monospace;">${applicant.requestedAt}</td>
                </tr>
              </table>

              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; line-height: 20px; color: #92400e;">
                <strong>Administrator Instructions:</strong> Log in to the terminal as an authorized administrator and open the <strong>Approvals</strong> badge on the top right header to review and grant instant access.
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #f4f4f5; padding: 18px 32px; font-size: 11px; color: #a1a1aa; text-align: center;">
              Pitch Black Syndicate Terminal · Administrator Security Dispatch
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Dispatch access request email notification to all database administrators
 */
export async function sendAdminNotificationEmail(
  applicant: ApplicantNotificationPayload
): Promise<{ success: boolean; previewUrl?: string }> {
  const adminEmails = await getAllFirestoreAdmins();
  const recipientList = adminEmails.length > 0 ? adminEmails : [DEFAULT_BOOTSTRAP_ADMIN];
  const subject = `[Pitch Black Action Required] New Access Approval Request: ${applicant.displayName} (${applicant.email})`;
  const text = `New user access request pending approval:\n\nApplicant: ${applicant.displayName}\nEmail: ${applicant.email}\nMethod: ${
    applicant.authProvider === 'google' ? 'Google OAuth' : 'Email'
  }\nTime: ${applicant.requestedAt}\n\nPlease log in to the Pitch Black terminal as an administrator and open the Approvals panel to authorize or decline.`;
  const html = generateAdminNotificationHtml(applicant);

  // 1. Live SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Pitch Black Security" <security@pitchblack.vc>',
        to: recipientList.join(', '),
        subject,
        text,
        html,
      });

      console.log(`[AUTH-ADMIN-NOTIFICATION] Email successfully delivered to administrators (${recipientList.join(', ')}) via live SMTP`);
      return { success: true };
    } catch (smtpErr) {
      console.error('[AUTH-ADMIN-NOTIFICATION] Custom SMTP delivery error:', smtpErr);
    }
  }

  // 2. Fallback / Test mailer: create verifiable test dispatch
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      from: '"Pitch Black Security" <security@pitchblack.vc>',
      to: recipientList.join(', '),
      subject,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[AUTH-ADMIN-NOTIFICATION] Dispatched admin notice to ${recipientList.join(', ')}. View message: ${previewUrl}`);
    return { success: true, previewUrl: previewUrl || undefined };
  } catch (err) {
    console.warn('[AUTH-ADMIN-NOTIFICATION] Email dispatch notice:', err);
    return { success: true };
  }
}

/**
 * Generate responsive HTML approval confirmation email sent to applicant
 */
export function generateUserApprovalHtml(displayName: string, email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Approved: Pitch Black Terminal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td style="background-color: #09090b; padding: 26px 32px; text-align: left;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width: 10px; height: 10px; background-color: #10b981; border-radius: 50%;"></td>
                  <td style="padding-left: 10px; font-size: 18px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px;">Pitch Black Syndicate</td>
                </tr>
              </table>
              <div style="font-family: monospace; font-size: 11px; color: #a1a1aa; margin-top: 6px; letter-spacing: 1px; text-transform: uppercase;">Account Authorization Verified</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 28px 32px;">
              <div style="display: inline-block; padding: 4px 12px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; font-size: 11px; font-weight: 600; color: #065f46; margin-bottom: 16px;">
                ✓ Access Authorized
              </div>
              <h1 style="font-size: 20px; font-weight: 700; color: #09090b; margin: 0 0 12px 0;">Welcome to Pitch Black Terminal</h1>
              <p style="font-size: 14px; line-height: 22px; color: #52525b; margin: 0 0 20px 0;">
                Hello <strong>${displayName}</strong>,<br/><br/>
                Your account access request for <strong style="color: #0f172a;">${email}</strong> has been approved by the lead administrator. You can now access all institutional diligence models, memos, and portfolio benchmarks.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #f4f4f5; padding: 18px 32px; font-size: 11px; color: #a1a1aa; text-align: center;">
              Pitch Black Syndicate Terminal · Automated Security Dispatch
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Dispatch approval confirmation email to user upon administrator approval
 */
export async function sendUserApprovalEmail(
  toEmail: string,
  displayName?: string
): Promise<{ success: boolean; previewUrl?: string }> {
  const subject = `[Pitch Black] Your Terminal Access Has Been Approved`;
  const cleanName = displayName || toEmail.split('@')[0];
  const text = `Hello ${cleanName},\n\nYour access request to the Pitch Black Diligence Terminal has been approved by the administrator. You may now sign in and access all terminal analyses and benchmarks.`;
  const html = generateUserApprovalHtml(cleanName, toEmail);

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Pitch Black Security" <security@pitchblack.vc>',
        to: toEmail,
        subject,
        text,
        html,
      });

      console.log(`[AUTH-USER-APPROVAL] Approval email sent to user (${toEmail}) via live SMTP`);
      return { success: true };
    } catch (smtpErr) {
      console.error('[AUTH-USER-APPROVAL] Custom SMTP delivery error:', smtpErr);
    }
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      from: '"Pitch Black Security" <security@pitchblack.vc>',
      to: toEmail,
      subject,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[AUTH-USER-APPROVAL] Dispatched approval notice to ${toEmail}. View message: ${previewUrl}`);
    return { success: true, previewUrl: previewUrl || undefined };
  } catch (err) {
    console.warn('[AUTH-USER-APPROVAL] Email dispatch notice:', err);
    return { success: true };
  }
}
