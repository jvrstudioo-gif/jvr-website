export const metadata = {
  title: "Terms & Conditions | JVR Studio",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 py-10 sm:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center">Terms &amp; Conditions</h1>
        <p className="text-center text-gray-400 text-sm">Last Updated: [September 27, 2025]</p>

        {/* Customer-Friendly Summary */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-semibold">Customer-Friendly Summary</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-200 leading-relaxed">
            <li>We’ll install what you request, but you are responsible for knowing Colorado tint laws.</li>
            <li>Removing old tint may damage defroster lines — we disclose this risk, but we are not responsible if it happens.</li>
            <li>
              <strong>Installation:</strong> If glass is cracked, chipped, or aged, tint may not cure properly. Layered tint voids warranty.
              After installation, do not roll windows down for 3–5 days or warranty is void.
            </li>
            <li>
              <strong>Vinyl/Wraps:</strong> If paint isn’t in good condition (sun-damaged, scratched, chipped), vinyl may not stick and
              warranty is void. Imperfections will still show through.
            </li>
            <li>
              <strong>Deposits:</strong> A <span className="text-white font-semibold">30% deposit</span> is required to confirm booking.
          
            </li>
            <li>We are not responsible for tickets, accidents, or damage caused by misuse or legal violations.</li>
            <li>We may post pictures of your vehicle unless you request otherwise in writing.</li>
            <li>Your info is only used for quotes and communication — never sold or shared.</li>
            <li>Don’t copy or misuse our content, logo, or brand.</li>
            <li>All disputes are handled in Colorado and resolved through arbitration.</li>
            <li>
              <strong>Payments:</strong> We accept <span className="text-white font-semibold">Zelle, cash, and credit cards via Square</span>.
            </li>
          </ul>
        </section>

        {/* Full Legal Terms */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold">Full Terms &amp; Conditions</h2>

          <div className="space-y-6 text-gray-200 leading-relaxed">
            <div>
              <h3 className="text-lg sm:text-xl font-bold">1. Agreement to Terms</h3>
              <p>
                By accessing this website or using the services of JVR Studio LLC (“Company,” “we,” “our”), you agree to these Terms &amp; Conditions.
                If you do not agree, you may not use our services or website. Customers must accept these terms before requesting a quote.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold">2. Services Provided</h3>
              <p>
                We currently provide: Window Tinting (Carbon and Ceramic), Vinyl Lettering, Logos, and Decals, and Vinyl Wraps (partial and full).
                All services are provided “as-is” with limited liability as described in Section 9.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold">3. Customer Responsibility (Tint Laws)</h3>
              <p>
                Customers are fully responsible for ensuring their chosen tint complies with Colorado state law and any applicable local regulations.
                JVR Studio LLC is not liable for citations, accidents, insurance issues, or other consequences resulting from non-compliant tint.
                If a customer requests illegal tint (including windshield tint), we will perform the service at the customer’s risk.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold">4. Tint Removal Disclaimer</h3>
              <p>
                Removing old tint carries an inherent risk that defroster lines may peel, fail, or become non-functional.
                These risks are disclosed before removal, and by proceeding, the customer accepts full responsibility.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold">5. Tint Installation Disclaimer</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  If glass has rock chips, cracks, or is weakened from age, JVR Studio LLC is not responsible if tint fails to adhere properly or later peels
                  due to the condition of the glass.
                </li>
                <li>
                  If the customer requests <strong>layered tint</strong> (new tint over old tint), the <strong>warranty is void</strong> because tint does not bond to tint as it bonds to glass, and curing may be affected.
                </li>
                <li>
                  After installation, <strong>windows must remain rolled up for 3–5 days</strong> to allow proper curing. Failure to follow this aftercare may cause peeling and <strong>voids the warranty</strong>.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold">6. Vinyl &amp; Wrap Disclaimer</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>We are not responsible for pre-existing paint defects, scratches, rust, or damage that may affect vinyl adhesion.</li>
                <li>
                  If the paint is not in perfect condition (e.g., sun damage, oxidation, scratches, or chips), the vinyl may not adhere properly and <strong>warranty is void</strong>.
                </li>
                <li>Existing scratches, chips, and paint imperfections will remain visible through the vinyl.</li>
                <li>JVR Studio LLC is not liable for damage to paint during installation or removal of vinyl/wraps.</li>
                <li>Customers assume all risks related to vinyl customization and its long-term effects.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold">7. Quality &amp; Warranty</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>If installation quality is poor due to our error (including bubbles, creases, or contamination), we will re-do it at no additional cost.</li>
                <li>No warranty for damage due to normal wear, misuse, improper care, failure to follow aftercare, paint defects, or third-party interference.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold">8. Payments &amp; Refunds</h3>
              <p>
                <strong>Accepted payments:</strong> We accept <span className="text-white font-semibold">Zelle, cash, and credit cards via Square</span>.
                Refunds are only granted if installation quality is poor due to our error. Refunds are not issued for change of mind,
                dissatisfaction with color, or customer misuse. For materials not stocked (special orders), a{" "}
                <span className="text-white font-semibold">30% non-refundable deposit</span> is required; if canceled, the deposit is not refunded.
                A <span className="text-white font-semibold">30% deposit is required to confirm booking</span>.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold">9. Liability Limitations</h3>
              <p>
                JVR Studio LLC is not responsible for legal violations (illegal tint or modifications); tickets, accidents, or damages resulting from customer choices;
                malfunctions of vehicle electronics, sensors, or features affected by tint, wraps, or vinyl; or damage resulting from misuse, neglect, or improper cleaning.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold">10. Website Use</h3>
              <p>
                All content, logos, and images on this site are property of JVR Studio LLC. Unauthorized use, reproduction, or distribution is prohibited.
                We are not responsible for errors, omissions, or inaccuracies in online quotes or website content.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold">11. Privacy &amp; Data</h3>
              <p>
                We collect personal information (name, contact info, vehicle details) for quotes and communication only. We do not sell, rent, or share your data.
                By using our forms, you consent to our data practices.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold">12. Photo Release</h3>
              <p>
                By receiving services, you grant JVR Studio LLC the right to photograph and use images of your vehicle for marketing (website, social media, advertising).
                If you do not want your vehicle photographed, notify us in writing before service begins.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold">13. Refusal of Service</h3>
              <p>We reserve the right to refuse service to anyone for any reason, including unsafe conditions or disrespectful behavior.</p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold">14. Dispute Resolution</h3>
              <p>
                All disputes are governed by the laws of the State of Colorado and resolved by binding arbitration in Colorado. Customers waive the right to class actions.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold">15. Modifications to Terms</h3>
              <p>
                We may update these Terms &amp; Conditions at any time without prior notice. Continued use of our website or services constitutes acceptance of updates.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
