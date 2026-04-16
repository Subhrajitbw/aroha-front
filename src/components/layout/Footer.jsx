import React, { useState } from "react";
import { Link } from "react-router-dom";

const socialIcons = [
  {
    href: "#",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path
          d="M22.54 6.42a8.94 8.94 0 0 1-2.6.71A4.52 4.52 0 0 0 21.9 4.6a9.03 9.03 0 0 1-2.86 1.09A4.48 4.48 0 0 0 12 8.09c0 .35.04.7.11 1.03A12.74 12.74 0 0 1 3.1 5.13a4.48 4.48 0 0 0 1.39 5.98 4.47 4.47 0 0 1-2.03-.56v.06a4.48 4.48 0 0 0 3.6 4.39 4.5 4.5 0 0 1-2.02.08 4.48 4.48 0 0 0 4.18 3.11A9 9 0 0 1 2 19.54a12.72 12.72 0 0 0 6.88 2.02c8.26 0 12.78-6.84 12.78-12.77 0-.19 0-.38-.01-.57A9.18 9.18 0 0 0 24 4.59a8.93 8.93 0 0 1-2.54.7z"
          fill="#333"
        />
      </svg>
    ),
    label: "X",
  },
  {
    href: "#",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path
          d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24h-1.918c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"
          fill="#333"
        />
      </svg>
    ),
    label: "Facebook",
  },
  {
    href: "#",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.34 3.608 1.314.974.974 1.252 2.241 1.314 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.34 2.633-1.314 3.608-.974.974-2.241 1.252-3.608 1.314-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.34-3.608-1.314-.974-.974-1.252-2.241-1.314-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.34-2.633 1.314-3.608C4.521 2.573 5.788 2.295 7.154 2.233 8.42 2.175 8.8 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.77.131 4.672.417 3.678 1.41c-.994.994-1.28 2.092-1.338 3.374C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.613.058 1.282.344 2.38 1.338 3.374.994.994 2.092 1.28 3.374 1.338C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.058 2.38-.344 3.374-1.338.994-.994 1.28-2.092 1.338-3.374.059-1.281.072-1.69.072-7.613 0-5.923-.013-6.332-.072-7.613-.058-1.282-.344-2.38-1.338-3.374C19.328.417 18.23.131 16.948.072 15.668.013 15.259 0 12 0z"
          fill="#333"
        />
        <circle cx="12" cy="12" r="3.5" fill="#333" />
      </svg>
    ),
    label: "Instagram",
  },
  {
    href: "#",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path
          d="M21.35 11.1c0-5.05-4.1-9.15-9.15-9.15S3.05 6.05 3.05 11.1c0 4.55 3.3 8.3 7.65 9.05v-6.4h-2.3v-2.65h2.3V9.6c0-2.3 1.37-3.55 3.45-3.55.99 0 2.03.18 2.03.18v2.23h-1.14c-1.12 0-1.47.7-1.47 1.42v1.7h2.5l-.4 2.65h-2.1v6.4c4.35-.75 7.65-4.5 7.65-9.05z"
          fill="#333"
        />
      </svg>
    ),
    label: "Pinterest",
  },
];

const navLinks = [
  {
    title: "Shop Auda",
    links: [
      "Bestsellers",
      "New",
      "Art Mode",
      "Request A Catalog",
      "Digital Catalog",
      "Affirm Financing",
      "Design Services",
    ],
  },
  {
    title: "About",
    links: [
      "About Us",
      "Design Process",
      "Stores",
      "Open Studio",
    ],
  },
  {
    title: "Trade + Contract",
    links: [
      "Request Account",
      "Trade Resources",
      "Bulk Orders",
      "Contract Newsletter Sign Up",
    ],
  },
  {
    title: "Customer Service",
    links: [
      "Contact Us",
      "Shipping + Delivery",
      "Returns",
      "FAQ",
      "Catalog Preferences",
    ],
  },
];

const Footer = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <footer className="relative min-h-screen w-full bg-gradient-to-tr from-[#dad0c7] to-[#f0eceb] flex flex-col overflow-hidden">
      {/* Background Text */}
      <div className="absolute -left-2 sm:-left-5 -bottom-[0.75rem] sm:-bottom-[8vh] pointer-events-none select-none z-0 flex items-end justify-center">
        <span
          className="text-[25vw] sm:text-[18vw] md:text-[36vw] font-gradmond text-[#f0ebe7] opacity-70 leading-none whitespace-nowrap"
          style={{
            letterSpacing: "-0.05em",
            mixBlendMode: "color-burn",
          }}
        >
          Aroha
        </span>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col px-4 sm:px-6 md:px-16 py-8 sm:py-12 md:py-16 lg:py-32">
        <div className="flex flex-col lg:flex-row w-full h-full gap-8 lg:gap-0">
          
          {/* Newsletter & Social Section */}
          <div className="flex flex-col w-full lg:w-1/4 lg:pr-8 mb-8 lg:mb-0 justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2 leading-relaxed">
                Stay up to date on all the latest
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                Auda news and updates.
              </h3>
              <form className="flex flex-col gap-3 mt-4 sm:mt-6">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-800 text-sm sm:text-base"
                />
                <button
                  type="submit"
                  className="bg-white border border-gray-400 text-gray-900 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  Subscribe <span className="ml-1">→</span>
                </button>
              </form>
            </div>

            {/* Social Icons */}
            <div className="mt-8 lg:mt-12">
              <span className="text-xs font-semibold text-gray-700 mb-3 block tracking-wide">
                SOCIAL
              </span>
              <div className="flex gap-4 mt-2">
                {socialIcons.map((icon, idx) => (
                  <a
                    key={idx}
                    href={icon.href}
                    aria-label={icon.label}
                    className="hover:scale-110 transition-transform duration-150 p-1"
                  >
                    {icon.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Links Section */}
          <div className="flex-1">
            {/* Desktop Navigation - Grid Layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
              {navLinks.map((section, idx) => (
                <div key={idx} className="min-w-0">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-4">
                    {section.title}
                  </h4>
                  <ul className="space-y-2">
                    {section.links.map((link, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-700 hover:text-black cursor-pointer transition-colors"
                      >
                        {link}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Mobile Navigation - Accordion Style */}
            <div className="md:hidden">
              {navLinks.map((section, idx) => (
                <div key={idx} className="border-b border-gray-300/50 last:border-b-0">
                  <button
                    onClick={() => toggleSection(idx)}
                    className="flex justify-between items-center w-full py-4 text-left"
                    aria-expanded={expandedSection === idx}
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      {section.title}
                    </h4>
                    <svg
                      className={`w-4 h-4 transform transition-transform duration-200 ${
                        expandedSection === idx ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedSection === idx ? 'max-h-96 pb-4' : 'max-h-0'
                    }`}
                  >
                    <ul className="space-y-3 pl-2">
                      {section.links.map((link, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-700 hover:text-black cursor-pointer transition-colors"
                        >
                          {link}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Section */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between w-full px-4 sm:px-6 md:px-16 py-6 text-xs text-gray-500 gap-4 border-t border-gray-300/50">
        
        <span className="text-center sm:text-left order-2 sm:order-1">
          Copyright © 2010–2024, Aroha, Inc. All Rights Reserved.
        </span>

        {/* Legal Links */}
        <div className="flex flex-wrap gap-3 sm:gap-4 items-center justify-center order-1 sm:order-2">
          <Link to="/terms-of-use" className="hover:underline whitespace-nowrap">
            Terms of Use
          </Link>
          <Link to="/privacy-policy" className="hover:underline whitespace-nowrap">
            Privacy Policy
          </Link>
          <Link to="/return-and-refund-policy" className="hover:underline whitespace-nowrap">
            Return & Refund Policy
          </Link>
          <Link to="/shipping-policy" className="hover:underline whitespace-nowrap">
            Shipping Policy
          </Link>
          <a href="#" className="hover:underline">
            Accessibility
          </a>
          <a href="#" className="hover:underline">
            Press
          </a>
        </div>

        {/* Designer Credit - Hidden on mobile and small tablets */}
        <span className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 text-xs tracking-widest text-gray-400 rotate-90 origin-bottom-right order-3">
          DESIGNED BY AROHA
        </span>
      </div>
    </footer>
  );
};

export default Footer;
