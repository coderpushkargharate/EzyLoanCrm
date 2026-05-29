import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendLeadNotification(lead: {
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
}) {
  const notifyEmail = process.env.LEAD_NOTIFY_EMAIL || 'dibyanshassociates@gmail.com';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0ea5e9, #14b8a6); padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">New Lead Received!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">A new lead has been added to your CRM</p>
      </div>
      <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; width: 120px;">Name</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${lead.name}</td>
          </tr>
          ${lead.email ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Email</td><td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${lead.email}</td></tr>` : ''}
          ${lead.phone ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Phone</td><td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${lead.phone}</td></tr>` : ''}
          ${lead.message ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Message</td><td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${lead.message}</td></tr>` : ''}
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Source</td>
            <td style="padding: 10px 0; color: #1e293b;">${lead.source || 'Website Form'}</td>
          </tr>
        </table>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/clients"
             style="background: linear-gradient(135deg, #0ea5e9, #14b8a6); color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
            View in CRM
          </a>
        </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Dibyansh Associates CRM" <${process.env.SMTP_USER}>`,
      to: notifyEmail,
      subject: `New Lead: ${lead.name} - Dibyansh Associates CRM`,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
}
