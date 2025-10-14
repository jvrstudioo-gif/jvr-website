import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

function transporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",          // some browsers use this
  "image/svg+xml",
]);

function isAllowedFile(f: File) {
  if (ALLOWED_MIME.has(f.type)) return true;
  // fallback by extension if type is blank
  const name = f.name.toLowerCase();
  return name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".svg");
}

async function fileToAttachment(file: File) {
  const buf = Buffer.from(await file.arrayBuffer());
  return { filename: file.name, content: buf };
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const phone = String(form.get("phone") || "");
    const vehicle = String(form.get("vehicle") || "");
    const service = String(form.get("service") || "");
    const details = String(form.get("details") || "");
    const referral = String(form.get("referral") || "");

    const depositAck = form.get("deposit_ack") ? "Yes" : "No";
    const termsAck = form.get("terms_ack") ? "Yes" : "No";

    if (!name || !email || !phone || !vehicle || !service || !details) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Optional service-specific fields
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
      ].filter(Boolean).join(", "),
    };

    const chrome = {
      areas: [
        form.get("chrome_window_trim") ? "Window trim" : "",
        form.get("chrome_badges") ? "Badges" : "",
        form.get("chrome_grille") ? "Grille" : "",
        form.get("chrome_roof_rails") ? "Roof rails" : "",
        form.get("chrome_other") ? "Other" : "",
      ].filter(Boolean).join(", "),
    };

    const vinyl = {
      size: String(form.get("vinyl_size") || ""),
      color: String(form.get("vinyl_color") || ""),
      placement: String(form.get("vinyl_placement") || ""),
    };

    // Attachments: only allowed types, max 3
    const rawPhotos = form.getAll("photos").filter((f) => f instanceof File) as File[];
    const allowedPhotos = rawPhotos.filter(isAllowedFile).slice(0, 3);
    const attachments = allowedPhotos.length
      ? await Promise.all(allowedPhotos.map(fileToAttachment))
      : undefined;

    const subject = `JVR Studio: New ${service} request from ${name}`;

    const html = `
      <h2>New Contact / Booking Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Vehicle:</strong> ${vehicle}</p>
      <p><strong>Service:</strong> ${service}</p>

      ${service === "Tint"
        ? `<h3>Window Tint Details</h3>
           <p><strong>Tint Type:</strong> ${tint.type || "—"}</p>
           <p><strong>Shade:</strong> ${tint.shade || "—"}</p>
           <p><strong>Vehicle Type:</strong> ${tint.vehicleType || "—"}</p>
           <p><strong>Coverage:</strong> ${tint.coverage || "—"}</p>`
        : ""}

      ${service === "Removal"
        ? `<h3>Tint Removal Details</h3>
           <p><strong>Areas:</strong> ${removal.areas || "—"}</p>`
        : ""}

      ${service === "Chrome"
        ? `<h3>Chrome Delete Details</h3>
           <p><strong>Areas:</strong> ${chrome.areas || "—"}</p>`
        : ""}

      ${service === "Vinyl"
        ? `<h3>Vinyl Logos & Lettering Details</h3>
           <p><strong>Approx. Size:</strong> ${vinyl.size || "—"}</p>
           <p><strong>Color:</strong> ${vinyl.color || "—"}</p>
           <p><strong>Placement:</strong> ${vinyl.placement || "—"}</p>`
        : ""}

      <h3>Project Notes</h3>
      <p>${details.replace(/\n/g, "<br/>")}</p>

      <p><strong>How did you hear about us:</strong> ${referral || "—"}</p>
      <p><strong>30% Deposit Ack:</strong> ${depositAck}</p>
      <p><strong>Agreed to Terms/Privacy:</strong> ${termsAck}</p>
      <hr/>
      <p>Sent from the JVR Studio contact page.</p>
    `;

    const text = `
New Contact / Booking Request

Name: ${name}
Email: ${email}
Phone: ${phone}
Vehicle: ${vehicle}
Service: ${service}

${service === "Tint" ? `Tint Type: ${tint.type || "—"}
Shade: ${tint.shade || "—"}
Vehicle Type: ${tint.vehicleType || "—"}
Coverage: ${tint.coverage || "—"}

` : ""}${service === "Removal" ? `Removal Areas: ${removal.areas || "—"}

` : ""}${service === "Chrome" ? `Chrome Areas: ${chrome.areas || "—"}

` : ""}${service === "Vinyl" ? `Vinyl Size: ${vinyl.size || "—"}
Vinyl Color: ${vinyl.color || "—"}
Vinyl Placement: ${vinyl.placement || "—"}

` : ""}Project Notes:
${details}

How did you hear about us: ${referral || "—"}
30% Deposit Ack: ${depositAck}
Agreed to Terms/Privacy: ${termsAck}
`;

    const mailer = transporter();
    await mailer.sendMail({
      from: process.env.FROM_EMAIL || `JVR Studio <${process.env.SMTP_USER}>`,
      to: "jvrstudioo@gmail.com",
      replyTo: email,
      subject,
      text,
      html,
      attachments,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
