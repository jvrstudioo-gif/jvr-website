// app/page.tsx
"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import AuthButtons from "./components/AuthButtons";
import Link from "next/link";

// ...
<Link
  href="/quote"
  className="rounded-md px-3 py-2 hover:opacity-80"
>
  Request A Quote
</Link>

export default function Page() {
  const { data: session } = useSession();

return (
    <main className="bg-black text-white min-h-screen flex flex-col items-center">
      {/* Logo */}
      <div className="mt-8 relative right-13 -top-12 sm:right-13 sm:-top-6">
        <Image
          src="/jvrs.svg"
          alt="JVR Studio"
          width={350}
          height={350}
          className="object-contain"
          priority
        />
      </div>

 {/* Sign-in button */}
  <div className="mt-6">
    <AuthButtons />

  </div> 

{/* Admin link — only shows for you */}
{session?.user?.email === "jvrstudioo@gmail.com" && (
  <div className="absolute top-4 right-4">
    <a
      href="/admin"
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
    >
      Admin
    </a>
  </div>
)}


      {/* Headline */}
      <h1 className="text-center font-extrabold mt-6 leading-tight">
        <span className="block text-4xl md:text-6xl">CUSTOM STYLE</span>
        <span className="block text-4xl md:text-6xl text-[#3b5bf6]">
          PROFESSIONAL RESULTS
        </span>
      </h1>

      {/* Navigation */}
   <nav className="flex space-x-6 mt-6 text-lg">
  <Link href="/quote" className="hover:text-[#3b5bf6]">
    Request A Quote
  </Link>
  <a
    href="https://instagram.com/jvrstudioo"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-[#3b5bf6]"
  >
    <FaInstagram size={22} />
  </a>
  <a
    href="https://tiktok.com/@jvrstudioo"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-[#3b5bf6]"
  >
    <FaTiktok size={22} />
  </a>
</nav>



      {/* Hero Supra Image */}
      <div className="w-full max-w-6xl px-4 mt-10">
        <Image
          src="/hero-supra.png"
          alt="Toyota Supra Hero"
          width={1600}
          height={900}
          className="w-full h-auto rounded-2xl shadow-2xl"
          priority
        />
      </div>

      {/* Tagline */}
      <p className="text-center italic text-lg mt-8">Your Car, Your Style</p>

      {/* Tint Chart Image */}
      <div className="flex justify-center mt-8 mb-14 w-full px-4">
        <Image
          src="/tint_chart_lamborghini.png"
          alt="Window Tint Comparison Chart"
          width={1400}
          height={800}
          className="w-full max-w-5xl h-auto rounded-xl shadow-xl"
        />
      </div>
{/* Staggered Promo Gallery Between Contact & Tint Chart */}
<section id="promo-gallery" className="my-16 md:my-24">
  <div className="max-w-6xl mx-auto px-4 flex flex-col gap-8">

    {/* Gallery Title */}
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-500 to-blue-500 bg-clip-text text-transparent">
      Gallery
    </h2>

    {/* Image 1 - Left */}
    <div className="flex justify-start">
      <Image
        src="/images/gfco1.jpg"
        alt="Golden Finish & Co. truck wrap - left"
        width={600}
        height={400}
        className="rounded-2xl shadow-lg object-cover"
        sizes="(min-width: 1024px) 600px, 90vw"
        priority
      />
    </div>

    {/* Image 2 - Right */}
    <div className="flex justify-end">
      <Image
        src="/images/gfco2.jpg"
        alt="Golden Finish & Co. truck wrap - right"
        width={600}
        height={400}
        className="rounded-2xl shadow-lg object-cover"
        sizes="(min-width: 1024px) 600px, 90vw"
      />
    </div>

  </div>
</section>


      {/* Contact Section */}
      <section className="w-full bg-black pb-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-2">Contact</h2>
          <p className="mb-8 text-gray-300">Aurora, CO • By appointment only</p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:jvrstudioo@gmail.com"
              className="bg-white text-black px-6 py-3 rounded-lg font-semibold"
            >
              Email: info@jvrestylingstudio.com
            </a>
            <a
              href="tel:7204000218"
              className="border border-white px-6 py-3 rounded-lg font-semibold"
            >
              Call/Text: (720) 400-0218
            </a>
          </div>
        </div>
           </section>
    </main>
  );
}

