// lib/mailer.ts
import nodemailer from "nodemailer";
import type { QuoteRecord } from "@/lib/quotes";

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT || 465);
const secure = port === 465;

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.FROM_EMAIL;

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: user && pass ? { user, pass } : undefined,
  pool: true,
  maxConnections: 2,
  maxMessages: 50,
  connectionTimeout: 20_000,
  greetingTimeout: 10_000,
  socketTimeout: 30_000,
  tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
});

export async function sendMail(opts: { to: string; subject: string; html: string }) {
  if (!from) throw new Error("FROM_EMAIL not configured");
  const info = await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  return info.messageId;
}

export async function sendQuoteNotification(to: string, q: QuoteRecord) {
  const subject = `New Quote Request #${q.id} — ${q.service ?? "Service"}`;
  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif">
      <h2>New Quote Request</h2>
      <p><strong>Received:</strong> ${q.receivedAt}</p>
      <p><strong>Service:</strong> ${q.service ?? "-"}</p>
      <p><strong>Name:</strong> ${[q.firstName, q.lastName].filter(Boolean).join(" ") || "-"}</p>
      <p><strong>Email:</strong> ${q.email ?? "-"}</p>
      <p><strong>Phone:</strong> ${q.phone ?? "-"}</p>
      <p><strong>Vehicle:</strong> ${q.ymm ?? "-"}</p>

      ${q.service === "Window Tint" ? `
        <p><strong>Tint Type:</strong> ${q.tintType ?? "-"}</p>
        <p><strong>Shade:</strong> ${q.tintShade ?? "-"}</p>
        <p><strong>Vehicle Type:</strong> ${q.vehicleType ?? "-"}</p>
        <p><strong>Coverage:</strong> ${(q.coverage ?? []).join(", ") || "-"}</p>
      ` : ""}

      ${q.details ? `<p><strong>Details:</strong><br>${String(q.details).replace(/\n/g,"<br>")}</p>` : ""}

      <hr>
      <p style="color:#555">Quote ID: ${q.id}</p>
    </div>
  `;

  return sendMail({ to, subject, html });
}
