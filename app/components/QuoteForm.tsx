"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Service =
  | "Window Tint"
  | "Tint Removal"
  | "Chrome Delete"
  | "Vinyl Decal"
  | "Vinyl Wrap (coming soon)";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ymm: string; // Year / Make / Model
  vin?: string;
  service: Service | "";
  details: string;
  agree: boolean;

  // Conditional (Window Tint)
  tintType?: "Carbon" | "Ceramic (coming soon)";
  tintShade?: "5%" | "15%" | "20%" | "30%" | "50%";
  vehicleType?: "Coupe" | "Sedan" | "SUV" | "Truck";
  coverage?: string[]; // ["Front windows","Rear windows","Full vehicle","Windshield strip"]

  // Conditional (Tint Removal)
  removalAreas?: string[]; // ["Front","Rear","Full vehicle","Sun strip"]

  // Conditional (Chrome Delete)
  chromeAreas?: string[]; // ["Window trim","Badges","Grille","Roof rails","Other"]

  // Conditional (Vinyl Decal)
  decalSize?: string;    // e.g. "12in x 4in"
  decalColor?: string;   // e.g. "White, matte"
  decalPlacement?: string; // e.g. "Rear window top center"
};

const inputClass =
  "w-full rounded-md bg-zinc-900 text-white placeholder-zinc-400 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent px-4 py-3";
const labelClass = "block text-sm font-medium mb-1";
const checkClass =
  "h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-purple-500 focus:ring-purple-500";

export default function QuoteForm() {
  const [data, setData] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ymm: "",
    vin: "",
    service: "",
    details: "",
    agree: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const isTint = data.service === "Window Tint";
  const isRemoval = data.service === "Tint Removal";
  const isChrome = data.service === "Chrome Delete";
  const isDecal = data.service === "Vinyl Decal";

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function toggleList(key: keyof FormState, value: string) {
    setData((d) => {
      const current = (d[key] as string[]) || [];
      const exists = current.includes(value);
      return { ...d, [key]: exists ? current.filter((v) => v !== value) : [...current, value] };
    });
  }

  const serviceOptions: { value: Service; disabled?: boolean }[] = [
    { value: "Window Tint" },
    { value: "Tint Removal" },
    { value: "Chrome Delete" },
    { value: "Vinyl Decal" },
    { value: "Vinyl Wrap (coming soon)", disabled: true },
  ];

  const coverageOptions = ["Front windows", "Rear windows", "Full vehicle", "Windshield strip"];
  const removalOptions = ["Front", "Rear", "Full vehicle", "Sun strip"];
  const chromeOptions = ["Window trim", "Badges", "Grille", "Roof rails", "Other"];

  // Basic validators
  const emailOk = useMemo(() => /^\S+@\S+\.\S+$/.test(data.email.trim()), [data.email]);
  const phoneOk = useMemo(
    () => /^[\d\s()+-]{7,}$/.test(data.phone.trim()),
    [data.phone]
  );
  const vinOk = useMemo(() => !data.vin || data.vin.trim().length <= 17, [data.vin]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!data.firstName.trim()) e.firstName = "Required";
    if (!data.lastName.trim()) e.lastName = "Required";
    if (!data.email.trim()) e.email = "Required";
    else if (!emailOk) e.email = "Invalid email";
    if (!data.phone.trim()) e.phone = "Required";
    else if (!phoneOk) e.phone = "Invalid phone";
    if (!data.ymm.trim()) e.ymm = "Required";
    if (!vinOk) e.vin = "VIN must be 17 characters or fewer";
    if (!data.service) e.service = "Select a service";
    if (!data.details.trim()) e.details = "Please add a brief description";
    if (!data.agree) e.agree = "You must agree to the Terms & Conditions";

    // Optional: enforce at least one sub-choice for certain services
    if (isTint) {
      if (!data.tintType) e.tintType = "Choose tint type";
      if (!data.tintShade) e.tintShade = "Choose shade";
      if (!data.vehicleType) e.vehicleType = "Choose vehicle type";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function scrollToFirstError() {
    const firstKey = Object.keys(errors)[0];
    if (!firstKey) return;
    const el = formRef.current?.querySelector(`[data-field="${firstKey}"]`);
    if (el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
  }

  useEffect(() => {
    if (Object.keys(errors).length) scrollToFirstError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      // Reset and show success
      setData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        ymm: "",
        vin: "",
        service: "",
        details: "",
        agree: false,
      });
      setErrors({});
      alert("Thanks! Your request was sent. We’ll reach out within 3-5 business days.");
    } catch (err) {
      console.error(err);
      alert("Couldn’t send right now—please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
      {/* Row 1: Name / Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div data-field="firstName">
          <label className={labelClass}>Name</label>
          <input
            className={inputClass}
            placeholder="Name"
            value={data.firstName}
            onChange={(e) => set("firstName", e.target.value)}
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>}
        </div>
        <div data-field="lastName">
          <label className={labelClass}>Last Name</label>
          <input
            className={inputClass}
            placeholder="Last Name"
            value={data.lastName}
            onChange={(e) => set("lastName", e.target.value)}
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>}
        </div>
      </div>

      {/* Row 2: Email / Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div data-field="email">
          <label className={labelClass}>Email</label>
          <input
            type="email"
            className={inputClass}
            placeholder="Email"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
          />
          {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
        </div>
        <div data-field="phone">
          <label className={labelClass}>Phone Number</label>
          <input
            className={inputClass}
            placeholder="Phone Number"
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
        </div>
      </div>

      {/* Row 3: YMM / VIN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div data-field="ymm">
          <label className={labelClass}>Year, Make, and Model</label>
          <input
            className={inputClass}
            placeholder="2011 Audi S4"
            value={data.ymm}
            onChange={(e) => set("ymm", e.target.value)}
          />
          {errors.ymm && <p className="mt-1 text-sm text-red-400">{errors.ymm}</p>}
        </div>
        <div data-field="vin">
          <label className={labelClass}>VIN <span className="text-zinc-400">(optional)</span></label>
          <input
            className={inputClass}
            placeholder="Optional – 17 characters"
            value={data.vin || ""}
            onChange={(e) => set("vin", e.target.value)}
          />
          {errors.vin && <p className="mt-1 text-sm text-red-400">{errors.vin}</p>}
        </div>
      </div>

      {/* Service */}
      <div data-field="service">
        <label className={labelClass}>Service</label>
        <select
          className={inputClass}
          value={data.service}
          onChange={(e) => set("service", e.target.value as Service)}
        >
          <option value="">Select a service</option>
          {serviceOptions.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.value}
            </option>
          ))}
        </select>
        {errors.service && <p className="mt-1 text-sm text-red-400">{errors.service}</p>}
      </div>

      {/* Conditional: Window Tint */}
      {isTint && (
        <div className="rounded-lg border border-zinc-800 p-4 space-y-4">
          <p className="font-semibold">Window Tint Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div data-field="tintType">
              <label className={labelClass}>Tint Type</label>
              <select
                className={inputClass}
                value={data.tintType || ""}
                onChange={(e) => set("tintType", e.target.value as any)}
              >
                <option value="">Select tint type</option>
                <option value="Carbon">Carbon</option>
                <option value="Ceramic (coming soon)" disabled>
                  Ceramic (coming soon)
                </option>
              </select>
              {errors.tintType && <p className="mt-1 text-sm text-red-400">{errors.tintType}</p>}
            </div>
            <div data-field="tintShade">
              <label className={labelClass}>Shade</label>
              <select
                className={inputClass}
                value={data.tintShade || ""}
                onChange={(e) => set("tintShade", e.target.value as any)}
              >
                <option value="">Select shade</option>
                <option value="5%">5%</option>
                <option value="15%">15%</option>
                <option value="20%">20%</option>
                <option value="30%">30%</option>
                <option value="50%">50%</option>
              </select>
              {errors.tintShade && <p className="mt-1 text-sm text-red-400">{errors.tintShade}</p>}
            </div>

            <div data-field="vehicleType">
              <label className={labelClass}>Vehicle Type</label>
              <select
                className={inputClass}
                value={data.vehicleType || ""}
                onChange={(e) => set("vehicleType", e.target.value as any)}
              >
                <option value="">Select vehicle type</option>
                <option value="Coupe">Coupe</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
              </select>
              {errors.vehicleType && (
                <p className="mt-1 text-sm text-red-400">{errors.vehicleType}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Coverage</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {coverageOptions.map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className={checkClass}
                      checked={!!data.coverage?.includes(opt)}
                      onChange={() => toggleList("coverage", opt)}
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conditional: Tint Removal */}
      {isRemoval && (
        <div className="rounded-lg border border-zinc-800 p-4 space-y-4">
          <p className="font-semibold">Tint Removal Details</p>
          <div>
            <label className={labelClass}>Areas</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {removalOptions.map((opt) => (
                <label key={opt} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className={checkClass}
                    checked={!!data.removalAreas?.includes(opt)}
                    onChange={() => toggleList("removalAreas", opt)}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conditional: Chrome Delete */}
      {isChrome && (
        <div className="rounded-lg border border-zinc-800 p-4 space-y-4">
          <p className="font-semibold">Chrome Delete Details</p>
          <div>
            <label className={labelClass}>Areas</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {chromeOptions.map((opt) => (
                <label key={opt} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className={checkClass}
                    checked={!!data.chromeAreas?.includes(opt)}
                    onChange={() => toggleList("chromeAreas", opt)}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conditional: Vinyl Decal */}
      {isDecal && (
        <div className="rounded-lg border border-zinc-800 p-4 space-y-4">
          <p className="font-semibold">Vinyl Decal Details</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Approx. Size</label>
              <input
                className={inputClass}
                placeholder='e.g. "12in x 4in"'
                value={data.decalSize || ""}
                onChange={(e) => set("decalSize", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Color</label>
              <input
                className={inputClass}
                placeholder='e.g. "White (matte)"'
                value={data.decalColor || ""}
                onChange={(e) => set("decalColor", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Placement</label>
              <input
                className={inputClass}
                placeholder='e.g. "Rear window top center"'
                value={data.decalPlacement || ""}
                onChange={(e) => set("decalPlacement", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Details */}
      <div data-field="details">
        <label className={labelClass}>Tell us about your project</label>
        <textarea
          className={`${inputClass} min-h-[140px]`}
          placeholder="Tell us about your project"
          value={data.details}
          onChange={(e) => set("details", e.target.value)}
          maxLength={2000}
        />
        {errors.details && <p className="mt-1 text-sm text-red-400">{errors.details}</p>}
      </div>

      {/* Terms & Consent */}
      <div className="space-y-3" data-field="agree">
        <label className="inline-flex items-center gap-3">
          <input
            type="checkbox"
            className={checkClass}
            checked={data.agree}
            onChange={(e) => set("agree", e.target.checked)}
          />
          <span className="text-sm">
            I agree to the{" "}
            <a href="/terms" className="underline decoration-purple-500 underline-offset-4 hover:opacity-80">
              Terms &amp; Conditions
            </a>
          </span>
        </label>
        {errors.agree && <p className="text-sm text-red-400">{errors.agree}</p>}

        <p className="text-xs text-zinc-400 leading-relaxed">
          By providing your phone number and/or email address via the form above, you agree to receive messages,
          including appointment reminders, at the phone number provided and you confirm that you agree to the
          processing of your personal data as described in our{" "}
          <a href="/privacy" className="underline decoration-purple-500 underline-offset-4 hover:opacity-80">
            Privacy&nbsp;Policy
          </a>.
        </p>
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full md:w-auto inline-flex items-center justify-center rounded-md bg-purple-600 hover:bg-purple-500 disabled:opacity-60 px-6 py-3 font-semibold"
        >
          {submitting ? "Submitting..." : "Submit Quote"}
        </button>
      </div>
    </form>
  );
}
