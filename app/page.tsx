// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaTiktok } from "react-icons/fa";

export default function Page() {
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

      {/* Headline */}
      <h1 className="text-center font-extrabold mt-6 leading-tight">
        <span className="block text-4xl md:text-6xl">CUSTOM STYLE</span>
        <span className="block text-4xl md:text-6xl text-[#3b5bf6]">
          PROFESSIONAL RESULTS
        </span>
      </h1>

      {/* Navigation */}
      <nav className="flex space-x-6 mt-6 text-lg">
        <Link href="/tint-quote" className="hover:text-[#3b5bf6]">
          Tint Quote
        </Link>
        <Link href="/vinyl-quote" className="hover:text-[#3b5bf6]">
          Vinyl Quote
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
          <p className="mb-8 text-gray-300">Aurora • By appointment only</p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:jvrstudioo@gmail.com"
              className="bg-white text-black px-6 py-3 rounded-lg font-semibold"
            >
              Email: jvrstudioo@gmail.com
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

      {/* Footer */}
      <footer className="w-full border-t border-gray-800 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          {/* Social icons */}
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a
              href="https://instagram.com/jvrstudioo"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://tiktok.com/@jvrstudioo"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              <FaTiktok size={20} />
            </a>
          </div>

          {/* Terms & Conditions */}
          <Link href="/terms" className="hover:text-white">
            Terms & Conditions
          </Link>
        </div>
      </footer>
    </main>
  );
}
