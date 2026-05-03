import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [email, setEmail] = useState("");

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const navLinks = [
    {
      title: "Shop",
      links: [
        { label: "All Collections", href: "/shop" },
        { label: "New Arrivals", href: "/shop" },
        { label: "Bestsellers", href: "/shop" },
        { label: "Lookbook", href: "/lookbook" },
        { label: "Design Services", href: "/contact" },
      ],
    },
    {
      title: "About",
      links: [
        { label: "Our Story", href: "/about" },
        { label: "Design Process", href: "/about" },
        { label: "Journal", href: "/journal" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Customer Care",
      links: [
        { label: "Contact Us", href: "/contact" },
        { label: "Shipping & Delivery", href: "/shipping-policy" },
        { label: "Returns & Refunds", href: "/return-and-refund-policy" },
        { label: "FAQ", href: "/contact" },
        { label: "Track Your Order", href: "/account?tab=orders" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Use", href: "/terms-of-use" },
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Return & Refund Policy", href: "/return-and-refund-policy" },
        { label: "Shipping Policy", href: "/shipping-policy" },
      ],
    },
  ];

  return (
    <footer className="relative w-full min-h-screen bg-stone-900 text-white overflow-hidden font-sans flex flex-col lg:justify-between">

      {/* ─── Top Section ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-2 sm:pt-20 lg:pt-24 pb-12 sm:pb-16">

        {/* ─── Hero Row: Brand + Newsletter ─── */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-20 mb-14 sm:mb-16 lg:mb-20">

          {/* Brand */}
          <div className="max-w-md">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight leading-tight mb-4">
              Maison<br />
              <span className="text-stone-500 italic">Aroha</span>
            </h2>
            <p className="text-sm sm:text-[15px] text-stone-400 leading-relaxed">
              Curating spaces of undeniable intention. Premium interiors designed for those who live deliberately.
            </p>
          </div>

          {/* Newsletter */}
          <div className="w-full lg:w-auto lg:min-w-[380px]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 mb-4">Stay in the loop</p>
            <form className="flex gap-0" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 bg-stone-800 border border-stone-700 rounded-l-xl px-4 py-3.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-stone-500 transition-colors min-w-0"
              />
              <button
                type="submit"
                className="bg-white text-stone-900 px-5 py-3.5 rounded-r-xl font-semibold text-sm hover:bg-stone-100 transition-colors flex items-center gap-2 shrink-0"
              >
                Subscribe
                <ArrowRight size={14} />
              </button>
            </form>
            <p className="text-[11px] text-stone-600 mt-2.5">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* ─── Divider ─── */}
        <div className="h-px bg-stone-800 mb-12 sm:mb-14" />

        {/* ─── Navigation Grid ─── */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-0">

          {/* Desktop Navigation */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 flex-1">
            {navLinks.map((section, idx) => (
              <div key={idx}>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-5">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        href={link.href}
                        className="text-sm text-stone-400 hover:text-white transition-colors duration-200 inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile Navigation — Accordion */}
          <div className="md:hidden space-y-0">
            {navLinks.map((section, idx) => (
              <div key={idx} className="border-b border-stone-800 last:border-b-0">
                <button
                  onClick={() => toggleSection(idx)}
                  className="flex justify-between items-center w-full py-4 text-left"
                  aria-expanded={expandedSection === idx}
                >
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-stone-400">
                    {section.title}
                  </h4>
                  <ChevronDown
                    size={16}
                    className={`text-stone-600 transform transition-transform duration-200 ${expandedSection === idx ? "rotate-180" : ""
                      }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === idx ? "max-h-80 pb-5" : "max-h-0"
                    }`}
                >
                  <ul className="space-y-3 pl-1">
                    {section.links.map((link, i) => (
                      <li key={i}>
                        <Link
                          href={link.href}
                          className="text-sm text-stone-500 hover:text-white transition-colors duration-200 inline-block"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Info — visible on lg+ */}
          <div className="hidden lg:flex flex-col items-end shrink-0 pl-12 border-l border-stone-800 ml-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-5 self-start">
              Get in Touch
            </h4>
            <div className="space-y-4 w-full">
              <a href="mailto:hello@arohahouse.com" className="flex items-center gap-3 text-sm text-stone-400 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center group-hover:bg-stone-700 transition-colors shrink-0">
                  <Mail size={14} />
                </div>
                hello@arohahouse.com
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-3 text-sm text-stone-400 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center group-hover:bg-stone-700 transition-colors shrink-0">
                  <Phone size={14} />
                </div>
                +91 98765 43210
              </a>
              <div className="flex items-center gap-3 text-sm text-stone-400">
                <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                  <MapPin size={14} />
                </div>
                <span>Mumbai, India</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 mt-8">
              {[
                { label: "Instagram", href: "#", path: "M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.34 3.608 1.314.974.974 1.252 2.241 1.314 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.34 2.633-1.314 3.608-.974.974-2.241 1.252-3.608 1.314-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.34-3.608-1.314-.974-.974-1.252-2.241-1.314-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.34-2.633 1.314-3.608C4.521 2.573 5.788 2.295 7.154 2.233 8.42 2.175 8.8 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.77.131 4.672.417 3.678 1.41c-.994.994-1.28 2.092-1.338 3.374C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.613.058 1.282.344 2.38 1.338 3.374.994.994 2.092 1.28 3.374 1.338C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.058 2.38-.344 3.374-1.338.994-.994 1.28-2.092 1.338-3.374.059-1.281.072-1.69.072-7.613 0-5.923-.013-6.332-.072-7.613-.058-1.282-.344-2.38-1.338-3.374C19.328.417 18.23.131 16.948.072 15.668.013 15.259 0 12 0z M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-10.845a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" },
                { label: "Facebook", href: "#", path: "M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24h-1.918c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0" },
                { label: "X", href: "#", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                { label: "Pinterest", href: "#", path: "M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.993 3.995-.282 1.193.599 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.084.345-.09.375-.293 1.199-.334 1.363-.053.225-.174.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-stone-800 flex items-center justify-center hover:bg-stone-700 transition-colors group"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" className="fill-stone-500 group-hover:fill-white transition-colors">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Contact + Socials */}
        <div className="lg:hidden mt-10 pt-8 border-t border-stone-800 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="mailto:hello@arohahouse.com" className="flex items-center gap-3 text-sm text-stone-400 hover:text-white transition-colors">
              <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                <Mail size={14} />
              </div>
              hello@arohahouse.com
            </a>
            <a href="tel:+919876543210" className="flex items-center gap-3 text-sm text-stone-400 hover:text-white transition-colors">
              <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                <Phone size={14} />
              </div>
              +91 98765 43210
            </a>
          </div>
          <div className="flex gap-3">
            {[
              { label: "Instagram", href: "#", path: "M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.34 3.608 1.314.974.974 1.252 2.241 1.314 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.34 2.633-1.314 3.608-.974.974-2.241 1.252-3.608 1.314-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.34-3.608-1.314-.974-.974-1.252-2.241-1.314-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.34-2.633 1.314-3.608C4.521 2.573 5.788 2.295 7.154 2.233 8.42 2.175 8.8 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.77.131 4.672.417 3.678 1.41c-.994.994-1.28 2.092-1.338 3.374C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.613.058 1.282.344 2.38 1.338 3.374.994.994 2.092 1.28 3.374 1.338C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.058 2.38-.344 3.374-1.338.994-.994 1.28-2.092 1.338-3.374.059-1.281.072-1.69.072-7.613 0-5.923-.013-6.332-.072-7.613-.058-1.282-.344-2.38-1.338-3.374C19.328.417 18.23.131 16.948.072 15.668.013 15.259 0 12 0z M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-10.845a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" },
              { label: "Facebook", href: "#", path: "M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24h-1.918c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0" },
              { label: "X", href: "#", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
              { label: "Pinterest", href: "#", path: "M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.993 3.995-.282 1.193.599 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.084.345-.09.375-.293 1.199-.334 1.363-.053.225-.174.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" },
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center hover:bg-stone-700 transition-colors group"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" className="fill-stone-500 group-hover:fill-white transition-colors">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bottom Bar ─── */}
      <div className="relative z-10 border-t border-stone-800">
        <div
          className="footer-bottom-bar max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px) + 1.25rem)' }}
        >
          {/* Extra bottom spacer only on mobile where navbar floats at bottom */}
          <style dangerouslySetInnerHTML={{
            __html: `
            .footer-bottom-bar { border-top: 1px solid rgba(0,0,0,0.05); }
          `}} />
          <span className="text-[11px] text-stone-600 text-center sm:text-left">
            © {new Date().getFullYear()} Aroha House. All rights reserved.
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {[
              { label: "Terms", href: "/terms-of-use" },
              { label: "Privacy", href: "/privacy-policy" },
              { label: "Returns", href: "/return-and-refund-policy" },
              { label: "Shipping", href: "/shipping-policy" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[11px] text-stone-600 hover:text-stone-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Background watermark ─── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none overflow-hidden z-0">
        <span
          className="block text-[20vw] sm:text-[16vw] font-serif text-stone-800/30 leading-none whitespace-nowrap -mb-[0.15em] -ml-[0.02em]"
          style={{ letterSpacing: "-0.04em" }}
        >
          Aroha
        </span>
      </div>
    </footer>
  );
};

export default Footer;
