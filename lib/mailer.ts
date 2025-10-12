import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT || 465);
const secure = port === 465;

const user = process.env.SMTP_USER;       // jvrstudioo@gmail.com
const pass = process.env.SMTP_PASS;       // Gmail App Password (16 chars, no spaces)
const from = process.env.FROM_EMAIL;      // e.g. 'JVR Studio <jvrstudioo@gmail.com>'

export const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

export async function sendQuoteNotification(to: string, q: { id: string; service?: string|null; firstName?: string|null; lastName?: string|null; details?: string|null; }) {
  if (!from) throw new Error("FROM_EMAIL not configured");

  const subject = `New quote request #${q.id}${q.service ? ` – ${q.service}` : ""}`;
  const html = `
    <h2>New Quote Request</h2>
    <p><b>ID:</b> ${q.id}</p>
    <p><b>Name:</b> ${q.firstName ?? ""} ${q.lastName ?? ""}</p>
    <p><b>Service:</b> ${q.service ?? "-"}</p>
    <p><b>Details:</b> ${q.details ?? "-"}</p>
  `;

  await transporter.sendMail({ from, to, subject, html });
}
