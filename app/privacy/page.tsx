// app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-3xl mx-auto px-4 py-14">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Effective Date: <span className="italic">[09-27-2025]</span>
        </p>

        <div className="mt-8 space-y-6 text-zinc-200 leading-relaxed">
          <p>
            At <strong>JVR Studio LLC</strong> (“JVR Studio,” “we,” “us,” or “our”), your privacy is important to us.
            This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you
            interact with our website, request a quote, or use our services.
          </p>

          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal &amp; Contact Information:</strong> Name, email address, phone number.</li>
            <li><strong>Vehicle Information:</strong> Year, make, model, and optional VIN.</li>
            <li><strong>Service Details:</strong> Service type (window tint, tint removal, chrome delete, vinyl decal, vinyl wrap) and project notes.</li>
            <li><strong>Communications:</strong> Messages sent through forms, email, or SMS, and your consent preferences.</li>
            <li><strong>Technical Information:</strong> IP address, browser, and device data used for security and basic analytics.</li>
          </ul>

          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and manage quotes, bookings, and services.</li>
            <li>Communicate about appointments, updates, and project details.</li>
            <li>Send confirmations, reminders, and important notices.</li>
            <li>Process payments/invoices via trusted providers (e.g., Square).</li>
            <li>Improve our website, services, and customer experience.</li>
            <li>Comply with applicable laws and regulations.</li>
          </ul>

          <h2 className="text-xl font-semibold">3. Communication Consent</h2>
          <p>
            By submitting your phone number and/or email address via our forms, you consent to receive communications,
            including appointment reminders, service updates, confirmations, and (if applicable) promotional offers.
            You may opt out of promotional messages at any time by replying <strong>STOP</strong> to texts or using the
            unsubscribe link in emails. You may still receive important service-related communications.
          </p>

          <h2 className="text-xl font-semibold">4. Sharing of Information</h2>
          <p>We do not sell your personal information. We may share information only when:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Service Providers:</strong> With trusted vendors that support operations (hosting, scheduling, emailing, payments).</li>
            <li><strong>Legal Requirements:</strong> To comply with laws, court orders, or government requests.</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, sale, or transfer of company assets.</li>
          </ul>

          <h2 className="text-xl font-semibold">5. Data Security</h2>
          <p>
            We use reasonable safeguards to protect personal information. However, no method of transmission or storage
            is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-xl font-semibold">6. Data Retention</h2>
          <p>
            We retain information only as long as necessary to provide services, fulfill purposes described here, comply
            with legal obligations, and resolve disputes.
          </p>

          <h2 className="text-xl font-semibold">7. Your Rights</h2>
          <p>You may have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access and obtain a copy of your information.</li>
            <li>Request corrections or updates.</li>
            <li>Request deletion, subject to legal requirements.</li>
            <li>Opt out of promotional communications.</li>
          </ul>
          <p>
            To exercise rights, contact us at <strong>[Insert Business Email]</strong>.
          </p>

          <h2 className="text-xl font-semibold">8. Third-Party Links</h2>
          <p>
            Our site may link to third-party sites (e.g., Instagram, TikTok, Square). Their privacy practices are governed
            by their own policies.
          </p>

          <h2 className="text-xl font-semibold">9. Children’s Privacy</h2>
          <p>
            Our services are not directed to individuals under 18, and we do not knowingly collect personal information
            from children. If you believe a child has provided data, please contact us to request deletion.
          </p>

          <h2 className="text-xl font-semibold">10. Changes to this Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Updates will be posted here with a revised effective date.
          </p>

          <h2 className="text-xl font-semibold">11. Contact Us</h2>
          <p>
            <strong>JVR Studio LLC</strong><br />
            Email: <strong>[jvrstudioo@gmail.com]</strong><br />
            Phone: <strong>[720-400-0218]</strong>
          </p>

          <p className="pt-4">
            For terms governing your use of our services, see{" "}
            <a
              href="/terms"
              className="underline decoration-purple-500 underline-offset-4 hover:opacity-80"
            >
              Terms &amp; Conditions
            </a>.
          </p>
        </div>
      </section>
    </main>
  );
}
