import Link from "next/link";
import Footer from "../components/Footer";

export default function PricingPage() {
  const tintRows = [
    ["Coupe", "$120", "$160", "$250", "$330", "$100", "+$80"],
    ["Sedan", "$140", "$180", "$280", "$360", "$120", "+$100"],
    ["SUV / Truck", "$160", "$200", "$320", "$400", "$140", "+$120"],
  ];
  const tintLabels = [
    "Vehicle Type",
    "Front Windows",
    "Rear Windows",
    "Full Vehicle",
    "Full + Windshield",
    "Windshield Only",
    "Add-On: Tint Removal",
  ];

  const chromeRows = [
    ["Coupe", "Starting at $150", "Starting at $300", "+$60–$100"],
    ["Sedan", "Starting at $180", "Starting at $350", "+$80–$120"],
    ["SUV / Truck", "Starting at $220", "Starting at $450", "+$100–$150"],
  ];
  const chromeLabels = [
    "Vehicle Type",
    "Partial (Trim / Emblems)",
    "Full Chrome Delete",
    "Add-On: Premium Film",
  ];

  const vinylRows = [
    ["Coupe", "Starting at $120", "Starting at $200", "+$50", "+$30–$60"],
    ["Sedan", "Starting at $140", "Starting at $240", "+$60", "+$40–$70"],
    ["SUV / Truck", "Starting at $160", "Starting at $280", "+$70", "+$50–$80"],
  ];
  const vinylLabels = [
    "Vehicle Type",
    "Single Side",
    "Both Sides",
    "Rear Window Add-On",
    "Premium Film Add-On",
  ];

  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 py-14 sm:py-12 flex flex-col justify-between relative">
      {/* Back to Home Button (Top Right Corner) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <Link
          href="/"
          className="bg-[#3B5BF6] hover:bg-purple-600 text-white font-semibold px-4 sm:px-5 py-2 rounded-lg transition-all"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="max-w-5xl mx-auto w-full mt-6 sm:mt-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-10">
          Service Pricing
        </h1>

        <p className="text-center text-gray-400 mb-10 sm:mb-16 px-2">
          All pricing varies by vehicle size, material, and complexity.
        </p>

        {/* --- Window Tint Section --- */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#3B5BF6] mb-3 sm:mb-4">
            Window Tint (Carbon Film)
          </h2>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border border-gray-700 text-sm">
              <thead className="bg-gray-800 text-[#3B5BF6]">
                <tr>
                  {tintLabels.map((h) => (
                    <th key={h} className="p-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tintRows.map((row) => (
                  <tr key={row[0]} className="border-t border-gray-700 text-center">
                    {row.map((cell, i) => (
                      <td key={i} className="p-3">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {tintRows.map((row) => (
              <div
                key={row[0]}
                className="rounded-xl border border-gray-800 bg-zinc-950/60 p-4"
              >
                {row.map((cell, i) => (
                  <div key={i} className="flex justify-between py-1.5 text-sm">
                    <span className="text-gray-400">{tintLabels[i]}</span>
                    <span className="font-medium text-white ml-3">{cell}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <p className="text-gray-400 mt-4 text-sm">
            Tint removal pricing varies by condition. Old or baked tint may require additional labor.
          </p>
        </section>

        {/* --- Chrome Deletes Section --- */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#3B5BF6] mb-3 sm:mb-4">
            Chrome Deletes
          </h2>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border border-gray-700 text-sm">
              <thead className="bg-gray-800 text-[#3B5BF6]">
                <tr>
                  {chromeLabels.map((h) => (
                    <th key={h} className="p-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chromeRows.map((row) => (
                  <tr key={row[0]} className="border-t border-gray-700 text-center">
                    {row.map((cell, i) => (
                      <td key={i} className="p-3">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {chromeRows.map((row) => (
              <div
                key={row[0]}
                className="rounded-xl border border-gray-800 bg-zinc-950/60 p-4"
              >
                {row.map((cell, i) => (
                  <div key={i} className="flex justify-between py-1.5 text-sm">
                    <span className="text-gray-400">{chromeLabels[i]}</span>
                    <span className="font-medium text-white ml-3">{cell}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <p className="text-gray-400 mt-4 text-sm">
            Pricing depends on surface complexity and film type. Premium finishes increase total cost.
          </p>
        </section>

        {/* --- Vinyl Logos & Lettering Section --- */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#3B5BF6] mb-3 sm:mb-4">
            Vinyl Logos &amp; Lettering
          </h2>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border border-gray-700 text-sm">
              <thead className="bg-gray-800 text-[#3B5BF6]">
                <tr>
                  {vinylLabels.map((h) => (
                    <th key={h} className="p-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vinylRows.map((row) => (
                  <tr key={row[0]} className="border-t border-gray-700 text-center">
                    {row.map((cell, i) => (
                      <td key={i} className="p-3">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {vinylRows.map((row) => (
              <div
                key={row[0]}
                className="rounded-xl border border-gray-800 bg-zinc-950/60 p-4"
              >
                {row.map((cell, i) => (
                  <div key={i} className="flex justify-between py-1.5 text-sm">
                    <span className="text-gray-400">{vinylLabels[i]}</span>
                    <span className="font-medium text-white ml-3">{cell}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <p className="text-gray-400 mt-4 text-sm">
            Pricing includes installation. Final cost depends on material, design complexity, and surface area.
          </p>
        </section>

        {/* --- Payment & Policy Section --- */}
        <section className="mt-14 sm:mt-20 mb-16 sm:mb-20 border-t border-gray-700 pt-8 sm:pt-10 text-gray-300 text-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-[#3B5BF6] mb-3 sm:mb-4">
            Payment &amp; Policy
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              A <span className="font-semibold text-white">30% deposit</span> is required to confirm all bookings.
            </li>
            <li>
              Accepted payments: <span className="text-white font-semibold">Cash, Zelle, or Card via Square</span>.
            </li>
            <li>Card transactions may include a 3% processing fee.</li>
            <li>Prices may vary depending on vehicle condition, material type, and design complexity.</li>
            <li>
              All deposits are <span className="font-semibold text-white">non-refundable</span> once materials are ordered or scheduling is confirmed.
            </li>
          </ul>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
