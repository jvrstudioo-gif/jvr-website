// lib/mailer.ts
import nodemailer from "nodemailer";
import type { QuoteRecord } from "@/lib/quotes";

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT || 587);
const secure = port === 465;

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.FROM_EMAIL;

if (!user || !pass) {
  // Fail fast at boot if SMTP auth isn’t configured
  console.warn("[mailer] Missing SMTP_USER / SMTP_PASS");
}

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
});

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!from) throw new Error("FROM_EMAIL not configured");
  const info = await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text ?? opts.html.replace(/<[^>]+>/g, " "), // fallback plain text
  });
  return info.messageId;
}

/** Nicely formatted notification for a new quote */
export async function sendQuoteNotification(to: string, q: QuoteRecord) {
  const subject = `New Quote – ${q.service ?? "Service"} (${q.id})`;

  const textLines = [
    `Received: ${q.receivedAt}`,
    `Service:  ${q.service ?? "-"}`,
    `Name:     ${(q.firstName ?? "-") + " " + (q.lastName ?? "")}`.trim(),
    `Email:    ${q.email ?? "-"}`,
    `Phone:    ${q.phone ?? "-"}`,
    `Vehicle:  ${q.ymm ?? "-"}`,
    `Tint:     ${q.tintType ?? "-"} ${q.tintShade ? `(${q.tintShade})` : ""}`,
    `Coverage: ${q.coverage?.join(", ") ?? "-"}`,
    "",
    "Details:",
    q.details ?? "-",
    "",
    `Quote ID: ${q.id}`,
  ];
  const text = textLines.join("\n");

  // basic HTML version
  const esc = (s: string) =>
    s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));

  const html = `
  <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
    <h2 style="margin:0 0 8px">New Quote</h2>
    <p><b>Received:</b> ${q.receivedAt}</p>
    <p><b>Service:</b> ${q.service ?? "-"}</p>
    <p><b>Name:</b> ${(q.firstName ?? "-") + " " + (q.lastName ?? "")}</p>
    <p><b>Email:</b> ${q.email ?? "-"}</p>
    <p><b>Phone:</b> ${q.phone ?? "-"}</p>
    <p><b>Vehicle:</b> ${q.ymm ?? "-"}</p>
    <p><b>Tint:</b> ${q.tintType ?? "-"} ${q.tintShade ? `(${q.tintShade})` : ""}</p>
    <p><b>Coverage:</b> ${q.coverage?.join(", ") ?? "-"}</p>
    <p><b>Details</b></p>
    <pre style="white-space:pre-wrap;margin:0;background:#0b0b0b;padding:10px;border-radius:8px;color:#eee">
${esc(q.details ?? "-")}
    </pre>
    <p style="margin-top:12px;color:#888">Quote ID: ${q.id}</p>
  </div>`.trim();

  await sendMail({ to, subject, html, text });
}
