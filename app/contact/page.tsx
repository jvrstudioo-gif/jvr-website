"use client";

import { useMemo, useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import Footer from "../components/Footer";

type ServiceKey = "" | "Tint" | "Removal" | "Chrome" | "Vinyl";

export default function ContactPage() {
  const [service, setService] = useState<ServiceKey>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [chromeAreas, setChromeAreas] = useState({
    windowTrim: false,
    badges: false,
    grille: false,
    roofRails: false,
    fullDelete: false,
    other: false,
  });

  const [removalAreas, setRemovalAreas] = useState({
    front: false,
    rear: false,
    full: false,
    sunstrip: false,
    windshield: false,
  });

  const chromeHasOne = useMemo(
    () =>
      chromeAreas.windowTrim ||
      chromeAreas.badges ||
      chromeAreas.grille ||
      chromeAreas.roofRails ||
      chromeAreas.fullDelete ||
      chromeAreas.other,
    [chromeAreas]
  );

  const removalHasOne = useMemo(
    () =>
      removalAreas.front ||
      removalAreas.rear ||
      removalAreas.full ||
      removalAreas.sunstrip ||
      removalAreas.windshield,
    [removalAreas]
  );

  const [vinylFilesText, setVinylFilesText] = useState("No file chosen");
  function onVinylFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      setVinylFilesText("No file chosen");
      return;
    }
    const names = files.map((f) => f.name).slice(0, 3);
    setVinylFilesText(names.join(", "));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(false);

    const form = e.currentTarget;
    const fd = new FormData(form);

    if (service === "Chrome" && !chromeHasOne) {
      setError("Please select at least one Chrome Delete area.");
      return;
    }
    if (service === "Removal" && !removalHasOne) {
      setError("Please select at least one Tint Removal area.");
      return;
    }
    if (service === "Vinyl" && !fd.get("vinyl_finish")) {
      setError("Please choose a Vinyl finish type.");
      return;
    }
    if (!fd.get("deposit_ack") || !fd.get("terms_ack")) {
      setError("Please agree to the 30% deposit and Terms & Conditions.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send message.");

      setOk(true);
      form.reset();
      setService("");
      setChromeAreas({
        windowTrim: false,
        badges: false,
        grille: false,
        roofRails: false,
        fullDelete: false,
        other: false,
      });
      setRemovalAreas({
        front: false,
        rear: false,
        full: false,
        sunstrip: false,
        windshield: false,
      });
      setVinylFilesText("No file chosen");
    } catch (err: any) {
      setError(err?.message || "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <header className="mx-auto w-full max-w-5xl px-4 pt-8">
        <div className="flex items-center justify-end">
          <Link
            href="/"
            className="rounded-lg bg-[#3B5BF6] px-4 py-2 text-sm font-semibold hover:bg-purple-600 transition"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="mt-6 text-center text-3xl sm:text-4xl font-extrabold tracking-tight">
          Contact / Booking
        </h1>
        <p className="mt-3 text-center text-zinc-300">
          Fill out the form below. We’ll reach out with next steps.
        </p>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-red-300">
            {error}
          </div>
        )}
        {ok && (
          <div className="mb-6 rounded-lg border border-emerald-900 bg-emerald-950/40 px-4 py-3 text-emerald-300">
            Thanks! We will reach out in 3–5 business days.
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Name / Last name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm">Name *</label>
              <input
                name="first_name"
                required
                placeholder="Your full name"
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Last name *</label>
              <input
                name="last_name"
                required
                placeholder="Last name"
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-3"
              />
            </div>
          </div>

          {/* Email / Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm">Email *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Phone Number *</label>
              <input
                name="phone"
                required
                placeholder="Phone number"
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-3"
              />
            </div>
          </div>

          {/* Vehicle */}
          <div>
            <label className="mb-1 block text-sm">Vehicle (Year / Make / Model) *</label>
            <input
              name="vehicle"
              required
              placeholder="2011 Audi S4"
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-3"
            />
          </div>

          {/* Service */}
          <div>
            <label className="mb-1 block text-sm">Service *</label>
            <select
              name="service"
              required
              value={service}
              onChange={(e) => setService(e.target.value as ServiceKey)}
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-3"
            >
              <option value="" disabled>
                Select Service
              </option>
              <option value="Tint">Window Tint</option>
              <option value="Removal">Tint Removal</option>
              <option value="Chrome">Chrome Delete</option>
              <option value="Vinyl">Vinyl Logos &amp; Lettering</option>
            </select>
          </div>

          {/* ===== TINT ===== */}
          {service === "Tint" && (
            <fieldset className="rounded-2xl border border-zinc-800 p-4">
              <legend className="px-1 text-base sm:text-lg font-semibold text-[#3B5BF6]">
                Window Tint Details
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="mb-1 block text-sm">
                    Film Type <span className="text-zinc-400">(Geoshield)</span> *
                  </label>
                  <select
                    name="tint_type"
                    required
                    defaultValue=""
                    className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-3"
                  >
                    <option value="" disabled>
                      Select film type
                    </option>
                    <option value="Carbon C2">Carbon C2</option>
                    <option value="Ceramic Film" disabled>
                      Ceramic Film (coming soon)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm">Shade *</label>
                  <select
                    name="tint_shade"
                    required
                    defaultValue=""
                    className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-3"
                  >
                    <option value="" disabled>
                      Select shade
                    </option>
                    <option value="5%">5%</option>
                    <option value="15%">15%</option>
                    <option value="20%">20%</option>
                    <option value="35%">35%</option>
                    <option value="50%">50%</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm">Vehicle Type *</label>
                  <select
                    name="tint_vehicle_type"
                    required
                    defaultValue=""
                    className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-3"
                  >
                    <option value="" disabled>
                      Select vehicle type
                    </option>
                    <option value="Coupe">Coupe</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV / Truck">SUV / Truck</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm">Coverage</label>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-sm mt-2">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" name="coverage_front" className="h-4 w-4" /> Front windows
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" name="coverage_rear" className="h-4 w-4" /> Rear windows
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" name="coverage_full" className="h-4 w-4" /> Full vehicle
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" name="coverage_windshield_only" className="h-4 w-4" /> Windshield only
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" name="coverage_sunstrip" className="h-4 w-4" /> Windshield strip
                    </label>
                  </div>
                </div>
              </div>
            </fieldset>
          )}

          {/* ===== REMOVAL ===== */}
          {service === "Removal" && (
            <fieldset className="rounded-2xl border border-zinc-800 p-4">
              <legend className="px-1 text-base sm:text-lg font-semibold text-[#3B5BF6]">
                Tint Removal Details
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-sm">
                {[
                  ["removal_front", "front"],
                  ["removal_rear", "rear"],
                  ["removal_full", "full"],
                  ["removal_sunstrip", "sunstrip"],
                  ["removal_windshield", "windshield"],
                ].map(([name, key]) => (
                  <label key={name} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={(removalAreas as any)[key]}
                      onChange={(e) =>
                        setRemovalAreas((s) => ({ ...s, [key]: e.target.checked }))
                      }
                      name={name}
                    />
                    {String(key).charAt(0).toUpperCase() + String(key).slice(1).replace("_", " ")}
                  </label>
                ))}
              </div>

              {!removalHasOne && (
                <p className="mt-3 text-sm text-amber-300">Please select at least one area above.</p>
              )}
            </fieldset>
          )}

          {/* ===== CHROME ===== */}
          {service === "Chrome" && (
            <fieldset className="rounded-2xl border border-zinc-800 p-4">
              <legend className="px-1 text-base sm:text-lg font-semibold text-[#3B5BF6]">
                Chrome Delete Details
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-sm">
                {[
                  ["chrome_window_trim", "windowTrim", "Window trim"],
                  ["chrome_badges", "badges", "Badges"],
                  ["chrome_grille", "grille", "Grille"],
                  ["chrome_roof_rails", "roofRails", "Roof rails"],
                  ["chrome_full_delete", "fullDelete", "Full chrome delete"],
                  ["chrome_other", "other", "Other"],
                ].map(([name, key, label]) => (
                  <label key={name} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={(chromeAreas as any)[key]}
                      onChange={(e) =>
                        setChromeAreas((s) => ({ ...s, [key]: e.target.checked }))
                      }
                      name={name}
                    />
                    {label}
                  </label>
                ))}
              </div>

              {!chromeHasOne && (
                <p className="mt-3 text-sm text-amber-300">Please select at least one area above.</p>
              )}
            </fieldset>
          )}

          {/* ===== VINYL ===== */}
          {service === "Vinyl" && (
            <fieldset className="rounded-2xl border border-zinc-800 p-4">
              <legend className="px-1 text-base sm:text-lg font-semibold text-[#3B5BF6]">
                Vinyl Logos &amp; Lettering Details
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="mb-1 block text-sm">Approx. Size</label>
                  <input
                    name="vinyl_size"
                    placeholder={`e.g. "12in x 4in"`}
                    className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-3"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Color</label>
                  <input
                    name="vinyl_color"
                    placeholder={`e.g. "Blue"`}
                    className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-3"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Finish Type *</label>
                  <select
                    name="vinyl_finish"
                    required
                    defaultValue=""
                    className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-3"
                  >
                    <option value="" disabled>
                      Select finish
                    </option>
                    <option value="Gloss">Gloss</option>
                    <option value="Matte">Matte</option>
                    <option value="Satin">Satin</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm">Placement</label>
                  <input
                    name="vinyl_placement"
                    placeholder={`e.g. "Rear window top center"`}
                    className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-3"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-sm">
                  Upload image (optional) <span className="text-zinc-400">(png, svg, jpg)</span>
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <input
                    id="vinyl-photos"
                    type="file"
                    name="photos"
                    multiple
                    onChange={onVinylFileChange}
                    accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                    className="sr-only"
                  />
                  <label
                    htmlFor="vinyl-photos"
                    className="cursor-pointer inline-flex items-center justify-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700"
                  >
                    Choose Files
                  </label>
                  <span className="text-sm text-gray-300">{vinylFilesText}</span>
                </div>
              </div>
            </fieldset>
          )}

          {/* Project details */}
          <div>
            <label className="mb-1 block text-sm">Tell us more about your project</label>
            <textarea
              name="details"
              rows={5}
              placeholder="What would you like done? Any specifics we should know?"
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-3"
            />
          </div>

          {/* Referral */}
          <div>
            <label className="mb-1 block text-sm">How did you hear about us? (optional)</label>
            <select
              name="referral"
              defaultValue=""
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-3"
            >
              <option value="" disabled>
                Select one
              </option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="Google">Google</option>
              <option value="Referral">Referral</option>
            </select>
          </div>

          {/* Policy checks (with highlights) */}
          <div className="space-y-4 text-sm">
            <label className="flex items-start gap-3">
              <input type="checkbox" name="deposit_ack" required className="mt-1 h-4 w-4" />
              <span>
                I understand a{" "}
                <strong className="text-[#3B5BF6]">30% deposit</strong> is required to confirm
                booking.
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input type="checkbox" name="terms_ack" required className="mt-1 h-4 w-4" />
              <span>
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-[#3B5BF6] underline underline-offset-4"
                >
                  Terms &amp; Conditions
                </Link>
                .
              </span>
            </label>

            <p className="text-zinc-400">
              By providing your phone number and <strong>email address</strong> via the form above,
              you agree to receive messages, including appointment reminders, and consent to the
              processing of your personal data as described in our{" "}
              <Link
                href="/privacy"
                className="font-semibold text-[#3B5BF6] underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto rounded-lg bg-[#3B5BF6] px-6 py-3 font-semibold text-white transition hover:bg-purple-600 disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Request Booking"}
          </button>

          <p className="mt-8 text-center text-sm text-zinc-400 italic">
            Questions? Email{" "}
            <a href="mailto:info@jvrestylingstudio.com" className="underline">
              info@jvrestylingstudio.com
            </a>
          </p>
        </form>
      </div>

      <Footer />
    </main>
  );
}
