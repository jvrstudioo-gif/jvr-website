// app/api/contact/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";

export const runtime = "nodejs";

/** Create a nodemailer transporter from env */
function transporter() {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = port === 465; // true for 465, false for 587/2525
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/** Allowed upload types */
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
]);

function isAllowedFile(f: File) {
  if (ALLOWED_MIME.has(f.type)) return true;
  const n = f.name.toLowerCase();
  return n.endsWith(".png") || n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".svg");
}

async function fileToAttachment(file: File): Promise<Attachment> {
  const buf = Buffer.from(await file.arrayBuffer());
  return { filename: file.name, content: buf };
}

/** Normalize service labels from the form into a single keyword */
function normalizeService(raw: string): "Tint" | "Removal" | "Chrome" | "Vinyl" | "Unknown" {
  const s = (raw || "").toLowerCase();
  if (s.includes("tint removal") || s === "removal") return "Removal";
  if (s.includes("window tint") || s === "tint") return "Tint";
  if (s.includes("chrome")) return "Chrome";
  if (s.includes("vinyl")) return "Vinyl";
  return "Unknown";
}

/** HTML helpers (dark theme + brand) */
const brandBlue = "#3B5BF6";

/* UPDATED: forces dark in mobile clients and changes top heading to bold uppercase */
const wrap = (content: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <style>
    :root { color-scheme: dark light; supported-color-schemes: dark light; }
    /* Help clients that respect prefers-color-scheme */
    @media (prefers-color-scheme: dark) {
      body, .bg-body { background:#0B0B0B !important; color:#EAEAEA !important; }
      .card { background:#0E0E0E !important; border-color:#1F2937 !important; }
      .muted { color:#9CA3AF !important; }
      a { color:#9DB2FF !important; }
    }
  </style>
</head>
<body class="bg-body" style="margin:0;background:#0B0B0B;color:#EAEAEA;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#0B0B0B" style="background:#0B0B0B;">
    <tr>
      <td align="center" style="padding:32px;">
        <table role="presentation" width="720" border="0" cellspacing="0" cellpadding="0" style="width:100%;max-width:720px;background:#0B0B0B;">
          <tr>
            <td align="center" style="padding-bottom:18px;">
              <div style="font-weight:800;font-size:24px;letter-spacing:1.6px;text-transform:uppercase;color:${brandBlue};">
                JVR STUDIO
              </div>
            </td>
          </tr>
          <tr>
            <td>
              ${content}
              <div class="muted" style="margin-top:32px;font-size:12px;color:#9CA3AF;text-align:right;">
                Sent from the JVR Studio contact page.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/* block/row unchanged */
const block = (title: string, bodyHtml: string) => `
  <div style="border:1px solid #1F2937;border-radius:12px;padding:16px 18px;margin:18px 0;background:#0E0E0E;">
    <div style="color:${brandBlue};font-weight:700;margin-bottom:8px;">${title}</div>
    ${bodyHtml}
  </div>
`;

const row = (label: string, value: string) => `
  <div style="margin:6px 0;">
    <span style="color:#9CA3AF">${label}:</span>
    <span style="color:#E5E7EB"> ${value || "—"}</span>
  </div>
`;

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    // Base fields (accept both snake_case and camelCase your UI might send)
    const firstName = String(form.get("first_name") || form.get("firstName") || form.get("name") || "").trim();
    const lastName  = String(form.get("last_name")  || form.get("lastName")  || "").trim();
    const email     = String(form.get("email")      || "").trim();
    const phone     = String(form.get("phone")      || "").trim();
    const vehicle   = String(form.get("vehicle")    || "").trim();
    const rawService= String(form.get("service")    || "").trim();
    const service   = normalizeService(rawService);

    const details   = String(form.get("details") || "");      // optional
    const referral  = String(form.get("referral") || "");     // optional

    const depositAck = form.get("deposit_ack") ? "Yes" : "No";
    const termsAck   = form.get("terms_ack") ? "Yes" : "No";

    // --- Basic Required Checks (details are optional by your request) ---
    if (!firstName || !lastName || !email || !phone || !vehicle || service === "Unknown") {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    // Must acknowledge deposit and terms
    if (depositAck !== "Yes" || termsAck !== "Yes") {
      return NextResponse.json({ error: "Please accept the 30% deposit and Terms/Privacy." }, { status: 400 });
    }

    // --- Service-specific fields (conditionally required) ---
    const tint = {
      type: String(form.get("tint_type") || ""),
      shade: String(form.get("tint_shade") || ""),
      vehicleType: String(form.get("tint_vehicle_type") || ""),
      coverage: [
        form.get("coverage_front") ? "Front windows" : "",
        form.get("coverage_rear") ? "Rear windows" : "",
        form.get("coverage_full") ? "Full vehicle" : "",
        form.get("coverage_windshield_only") ? "Windshield only" : "",
        form.get("coverage_sunstrip") ? "Windshield strip" : "",
      ].filter(Boolean).join(", "),
    };

    const removal = {
      areas: [
        form.get("removal_front") ? "Front" : "",
        form.get("removal_rear") ? "Rear" : "",
        form.get("removal_full") ? "Full vehicle" : "",
        form.get("removal_sunstrip") ? "Sun strip" : "",
        form.get("removal_windshield") ? "Windshield" : "",
      ].filter(Boolean).join(", "),
    };

    const chrome = {
      areas: [
        form.get("chrome_window_trim") ? "Window trim" : "",
        form.get("chrome_badges") ? "Badges" : "",
        form.get("chrome_grille") ? "Grille" : "",
        form.get("chrome_roof_rails") ? "Roof rails" : "",
        // accept both names for "full chrome delete"
        form.get("chrome_full_delete") || form.get("chrome_full") ? "Full chrome delete" : "",
        form.get("chrome_other") ? "Other" : "",
      ].filter(Boolean).join(", "),
    };

    const vinyl = {
      size: String(form.get("vinyl_size") || ""),
      color: String(form.get("vinyl_color") || ""),
      finish: String(form.get("vinyl_finish") || ""),
      placement: String(form.get("vinyl_placement") || ""),
    };

    // Conditional validation (only for the chosen service)
    if (service === "Removal" && !removal.areas) {
      return NextResponse.json({ error: "Select at least one removal area." }, { status: 400 });
    }
    if (service === "Chrome" && !chrome.areas) {
      return NextResponse.json({ error: "Select at least one chrome area." }, { status: 400 });
    }
    // (Tint and Vinyl: front-end handles stricter requirements.)

    // --- Photos (optional, up to 3) ---
    const rawPhotos = form.getAll("photos").filter((f) => f instanceof File) as File[];
    const allowedPhotos = rawPhotos.filter(isAllowedFile).slice(0, 3);
    const uploadedAttachments = allowedPhotos.length
      ? await Promise.all(allowedPhotos.map(fileToAttachment))
      : [];

    // -------------------- Build HTML / TEXT --------------------
    const subject = `JVR Studio: New ${service} request from ${firstName} ${lastName}`;

    // Small header at the top with emoji (kept as you had it)
    const topHeader = `
      <h1 style="margin:0 0 12px 0; font-size:24px; font-weight:800; color:#EAEAEA;">
        New Contact / Booking Request <span>🎉</span>
      </h1>
    `;

    const tintHtml = service === "Tint" ? block("Window Tint (Geoshield)", [
      row("Film Type", tint.type || "—"),
      row("Shade", tint.shade || "—"),
      row("Vehicle Type", tint.vehicleType || "—"),
      row("Coverage", tint.coverage || "—"),
    ].join("")) : "";

    const removalHtml = service === "Removal" ? block("Tint Removal", [
      row("Areas", removal.areas || "—"),
    ].join("")) : "";

    const chromeHtml = service === "Chrome" ? block("Chrome Deletes", [
      row("Areas", chrome.areas || "—"),
    ].join("")) : "";

    const vinylHtml = service === "Vinyl" ? block("Vinyl Logos & Lettering", [
      row("Approx. Size", vinyl.size || "—"),
      row("Color", vinyl.color || "—"),
      row("Finish", vinyl.finish || "—"),
      row("Placement", vinyl.placement || "—"),
    ].join("")) : "";

    const safeNotes = (details || "—").replace(/</g, "&lt;").replace(/>/g, "&gt;");

   const html = wrap(`
  ${topHeader}

  ${block("Customer", [
    row("Name", (firstName + " " + lastName).trim()),
    row("Email", email),
    row("Phone", phone),
  ].join(""))}

  ${block("Vehicle", [ row("Year / Make / Model", vehicle) ].join(""))}

  ${block("Service", [ row("Selected", rawService || service) ].join(""))}

  ${tintHtml}${removalHtml}${chromeHtml}${vinylHtml}

  ${block(
    "Project Notes",
    '<div style="white-space:pre-wrap;color:#E5E7EB">' + safeNotes + "</div>"
  )}

  ${block("Other", [
    row("How did you hear about us", referral || "—"),
    row("30% Deposit Acknowledged", depositAck),
    row("Agreed to Terms/Privacy", termsAck),
  ].join(""))}
`);


    const text = `
JVR Studio - New Contact / Booking

Customer
- Name: ${firstName} ${lastName}
- Email: ${email}
- Phone: ${phone}

Vehicle
- ${vehicle}

Service
- ${rawService || service}

${service === "Tint" ? `Window Tint (Geoshield)
- Film Type: ${tint.type || "—"}
- Shade: ${tint.shade || "—"}
- Vehicle Type: ${tint.vehicleType || "—"}
- Coverage: ${tint.coverage || "—"}
` : ""}${service === "Removal" ? `Tint Removal
- Areas: ${removal.areas || "—"}
` : ""}${service === "Chrome" ? `Chrome Deletes
- Areas: ${chrome.areas || "—"}
` : ""}${service === "Vinyl" ? `Vinyl Logos & Lettering
- Approx. Size: ${vinyl.size || "—"}
- Color: ${vinyl.color || "—"}
- Finish: ${vinyl.finish || "—"}
- Placement: ${vinyl.placement || "—"}
` : ""}

Project Notes
${details || "—"}

Other
- Heard about us: ${referral || "—"}
- 30% Deposit Ack: ${depositAck}
- Agreed to Terms/Privacy: ${termsAck}
`.trim();

    const attachments = uploadedAttachments.length ? uploadedAttachments : undefined;

    const mailer = transporter();
    await mailer.sendMail({
      from: process.env.FROM_EMAIL || `JVR Studio <${process.env.SMTP_USER}>`,
      to: "jvrstudioo@gmail.com",
      replyTo: email,
      subject,
      html,
      text,
      attachments,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
