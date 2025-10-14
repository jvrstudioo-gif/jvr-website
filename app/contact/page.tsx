"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "../components/Footer";

type ServiceKey = "" | "Tint" | "Removal" | "Chrome" | "Vinyl";

export default function ContactPage() {
  const [service, setService] = useState<ServiceKey>("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // For custom file input display
  const [filesLabel, setFilesLabel] = useState<string>("No file selected");

  const showTint = service === "Tint";
  const showRemoval = service === "Removal";
  const showChrome = service === "Chrome";
  const showVinyl = service === "Vinyl";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrMsg(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    // limit photos (vinyl) to 3
    const photos = (fd.getAll("photos") as File[]).filter(Boolean);
    if (photos.length > 3) {
      setStatus("err");
      setErrMsg("Please upload up to 3 photos.");
      return;
    }

    try {
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to send. Please try again.");
      }
      form.reset();
      setService("");
      setFilesLabel("No file selected");
      setStatus("ok");
    } catch (err: any) {
      setStatus("err");
      setErrMsg(err?.message || "Something went wrong.");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Top Right Back Button */}
        <div className="flex justify-end mb-6">
          <Link
            href="/"
            className="bg-[#3B5BF6] hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">Contact / Booking</h1>
        <p className="text-center text-gray-400 mb-8">
          Fill out the form below. We’ll reach out with next steps.
        </p>

        {/* Status messages */}
        {status === "ok" && (
          <div className="mb-6 rounded-lg border border-green-700 bg-green-900/20 p-4 text-green-200">
            Thanks! We will reach out in 3–5 business days.
          </div>
        )}
        {status === "err" && (
          <div className="mb-6 rounded-lg border border-red-700 bg-red-900/20 p-4 text-red-200">
            {errMsg || "There was an issue sending your request."}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm text-gray-300">Name *</label>
              <input
                name="name"
                type="text"
                required
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B5BF6]"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-300">Phone Number *</label>
              <input
                name="phone"
                type="tel"
                required
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B5BF6]"
                placeholder="Phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm text-gray-300">Email *</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B5BF6]"
                placeholder="Email"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-300">Vehicle (Year / Make / Model) *</label>
              <input
                name="vehicle"
                type="text"
                required
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B5BF6]"
                placeholder="2011 Audi S4"
              />
            </div>
          </div>

          {/* Service selector with placeholder */}
          <div>
            <label className="block mb-2 text-sm text-gray-300">Service *</label>
            <select
              name="service"
              required
              value={service}
              onChange={(e) => setService(e.target.value as ServiceKey)}
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B5BF6]"
            >
              <option value="" disabled>
                Select Service
              </option>
              <option value="Tint">Window Tint (Carbon)</option>
              <option value="Removal">Tint Removal</option>
              <option value="Chrome">Chrome Delete</option>
              <option value="Vinyl">Vinyl Logos &amp; Lettering</option>
            </select>
          </div>

          {/* Service-specific sections */}
          {service === "Tint" && (
            <fieldset className="border border-zinc-800 rounded-xl p-4 sm:p-6">
              <legend className="px-2 text-lg font-semibold text-[#3B5BF6]">Window Tint Details</legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block mb-2 text-sm text-gray-300">Tint Type *</label>
                  <select
                    name="tint_type"
                    required
                    className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B5BF6]"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select tint type
                    </option>
                    <option value="Carbon">Carbon</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-300">Shade *</label>
                  <select
                    name="tint_shade"
                    required
                    className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B5BF6]"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select shade
                    </option>
                    <option value="5%">5%</option>
                    <option value="15%">15%</option>
                    <option value="20%">20%</option>
                    <option value="30%">30%</option>
                    <option value="50%">50%</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-300">Vehicle Type *</label>
                  <select
                    name="tint_vehicle_type"
                    required
                    className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B5BF6]"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select vehicle type
                    </option>
                    <option>Coupe</option>
                    <option>Sedan</option>
                    <option>SUV / Truck</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-300">Coverage *</label>
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="coverage_front" /> Front windows
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="coverage_rear" /> Rear windows
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="coverage_full" /> Full vehicle
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="coverage_windshield_only" /> Windshield only
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="coverage_sunstrip" /> Windshield strip
                    </label>
                  </div>
                </div>
              </div>
            </fieldset>
          )}

          {service === "Removal" && (
            <fieldset className="border border-zinc-800 rounded-xl p-4 sm:p-6">
              <legend className="px-2 text-lg font-semibold text-[#3B5BF6]">Tint Removal Details</legend>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-300 mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="removal_front" /> Front
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="removal_rear" /> Rear
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="removal_full" /> Full vehicle
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="removal_sunstrip" /> Sun strip
                </label>
              </div>
            </fieldset>
          )}

          {service === "Chrome" && (
            <fieldset className="border border-zinc-800 rounded-xl p-4 sm:p-6">
              <legend className="px-2 text-lg font-semibold text-[#3B5BF6]">Chrome Delete Details</legend>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-gray-300 mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="chrome_window_trim" /> Window trim
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="chrome_badges" /> Badges
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="chrome_grille" /> Grille
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="chrome_roof_rails" /> Roof rails
                </label>
                <label className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <input type="checkbox" name="chrome_other" /> Other
                </label>
              </div>
            </fieldset>
          )}

          {service === "Vinyl" && (
            <fieldset className="border border-zinc-800 rounded-xl p-4 sm:p-6">
              <legend className="px-2 text-lg font-semibold text-[#3B5BF6]">
                Vinyl Logos &amp; Lettering Details
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div>
                  <label className="block mb-2 text-sm text-gray-300">Approx. Size *</label>
                  <input
                    name="vinyl_size"
                    required
                    placeholder={`e.g. "12in x 4in"`}
                    className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B5BF6]"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-300">Color *</label>
                  <input
                    name="vinyl_color"
                    required
                    placeholder={`e.g. "White (matte)"`}
                    className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B5BF6]"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-300">Placement *</label>
                  <input
                    name="vinyl_placement"
                    required
                    placeholder={`e.g. "Rear window top center"`}
                    className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B5BF6]"
                  />
                </div>
              </div>

              {/* Optional photos — custom "Choose File" control */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm text-gray-300">
                    Upload image here <span className="text-gray-500">(PNG, SVG, or JPG files)</span>
                  </label>
                  <span className="text-xs text-gray-500">Optional (up to 3)</span>
                </div>

                {/* Hidden native input */}
                <input
                  id="photos-input"
                  name="photos"
                  type="file"
                  accept="image/png,image/svg+xml,image/jpeg"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    const f = Array.from(e.target.files || []);
                    setFilesLabel(f.length ? f.map((x) => x.name).slice(0, 3).join(", ") : "No file selected");
                  }}
                />

                {/* Custom trigger + filename display */}
                <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <label
                    htmlFor="photos-input"
                    className="cursor-pointer inline-flex items-center justify-center rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 px-4 py-2 text-sm"
                  >
                    Choose File
                  </label>
                  <span className="text-xs text-gray-400">{filesLabel}</span>
                </div>
              </div>
            </fieldset>
          )}

          {/* Project details */}
          <div>
            <label className="block mb-2 text-sm text-gray-300">Tell us more about your project *</label>
            <textarea
              name="details"
              required
              rows={5}
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B5BF6]"
              placeholder="What would you like done? Any specifics we should know?"
            />
          </div>

          {/* How did you hear about us? (optional) */}
          <div>
            <label className="block mb-2 text-sm text-gray-300">
              How did you hear about us? (optional)
            </label>
            <select
              name="referral"
              defaultValue=""
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B5BF6]"
            >
              <option value="">Select one</option>
              <option>Instagram</option>
              <option>TikTok</option>
              <option>Google</option>
              <option>Referral</option>
              <option>Other</option>
            </select>
          </div>

          {/* Terms block */}
          <div className="space-y-2">
            <label className="flex items-start gap-3 text-sm text-gray-200">
              <input type="checkbox" name="deposit_ack" required className="mt-1" />
              <span>
                I understand a <span className="font-semibold text-white">30% deposit</span> is required to confirm booking.
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm text-gray-200">
              <input type="checkbox" name="terms_ack" required className="mt-1" />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="underline decoration-[#3B5BF6] underline-offset-4 hover:text-[#3B5BF6]">
                  Terms &amp; Conditions
                </Link>
                .
              </span>
            </label>

            <p className="text-sm text-gray-400">
              By providing your phone number and/or email address via the form above, you agree to
              receive messages, including appointment reminders, at the contact details provided and
              confirm you agree to the processing of your personal data as described in our{" "}
              <Link href="/privacy" className="underline decoration-[#3B5BF6] underline-offset-4 hover:text-[#3B5BF6]">
                Privacy Policy
              </Link>.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={status === "sending"}
              className="inline-flex items-center justify-center rounded-lg bg-[#3B5BF6] hover:bg-purple-600 px-6 py-3 font-semibold text-white transition disabled:opacity-60"
            >
              {status === "sending" ? "Sending..." : "Request Booking"}
            </button>
          </div>
        </form>

        {/* Questions line */}
        <p className="mt-12 mb-10 text-center italic text-gray-300">
          Questions? Email{" "}
          <a href="mailto:info@jvrestylingstudio.com" className="underline">info@jvrestylingstudio.com</a>
        </p>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
