"use client";
import Image from "next/image";

type HeroProps = {
  headline?: string;
  subheading?: string;
};

export default function Hero({
  headline = "CUSTOM STYLE",
  subheading = "PROFESSIONAL RESULTS",
}: HeroProps) {
  return (
    <section className="bg-black text-white">
      {/* Centered logo (you can tweak these offsets later) */}
      <div className="relative right-13 -top-12 sm:right-13 sm:-top-6 flex justify-center w-full">
        <Image
          src="/jvrs.svg"
          alt="JVR Studio"
          width={350}
          height={350}
          priority
          className="object-contain"
        />
      </div>

      {/* Headline */}
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
          {headline} <span className="text-indigo-500">{subheading}</span>
        </h1>
      </div>

      {/* Optional nav (uncomment when needed) */}
      {/* 
      <div className="mt-6 flex items-center justify-center gap-10 text-base md:text-xl">
        <a className="hover:text-[#1d4ed8]" href="#tint-quote">Tint Quote</a>
        <a className="hover:text-[#1d4ed8]" href="#vinyl-quote">Vinyl Quote</a>
      </div>
      */}
    </section>
  );
}
