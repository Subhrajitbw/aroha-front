// src/components/FloatingEnquiry.jsx
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Phone, Mail, X } from "lucide-react";
import { gsap } from "gsap";

const FloatingEnquiry = () => {
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef(null);
  const mainButtonRef = useRef(null);
  const mainButtonIconRef = useRef(null);
  const optionsRef = useRef([]);
  const backdropRef = useRef(null);

  // Your contact details
  const contactDetails = {
    whatsapp: "+919830483628", // Replace with your WhatsApp number
    phone: "+919830483628",     // Replace with your phone number
    email: "contact.arohahouse@gmail.com",   // Replace with your email
  };

  const options = [
    {
      id: "whatsapp",
      icon: MessageCircle,
      label: "WhatsApp",
      color: "from-emerald-500 to-emerald-600",
      action: () => {
        window.open(
          `https://wa.me/${contactDetails.whatsapp.replace(/[^0-9]/g, "")}?text=Hi, I'd like to enquire about your products`,
          "_blank"
        );
      },
    },
    {
      id: "phone",
      icon: Phone,
      label: "Call Us",
      color: "from-blue-500 to-blue-600",
      action: () => {
        window.location.href = `tel:${contactDetails.phone}`;
      },
    },
    {
      id: "email",
      icon: Mail,
      label: "Email Us",
      color: "from-purple-500 to-purple-600",
      action: () => {
        window.location.href = `mailto:${contactDetails.email}?subject=Product Enquiry`;
      },
    },
  ];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Animate options when opening/closing
  useEffect(() => {
    const validOptions = optionsRef.current.filter(Boolean);

    if (isOpen) {
      // Show backdrop on mobile
      if (backdropRef.current) {
        gsap.to(backdropRef.current, {
          autoAlpha: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      // Animate options in
      gsap.fromTo(
        validOptions,
        {
          scale: 0,
          y: 20,
          opacity: 0,
        },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "back.out(1.7)",
        }
      );

      // Rotate main button icon
      gsap.to(mainButtonIconRef.current, {
        rotation: 45,
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      // Hide backdrop
      if (backdropRef.current) {
        gsap.to(backdropRef.current, {
          autoAlpha: 0,
          duration: 0.2,
          ease: "power2.in",
        });
      }

      // Animate options out
      gsap.to(validOptions, {
        scale: 0,
        y: 20,
        opacity: 0,
        duration: 0.2,
        stagger: 0.03,
        ease: "power2.in",
      });

      // Reset main button icon rotation
      gsap.to(mainButtonIconRef.current, {
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isOpen]);

  const handleOptionClick = (action) => {
    action();
    setTimeout(() => setIsOpen(false), 100);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99] sm:hidden"
        style={{ visibility: "hidden", opacity: 0 }}
        onClick={() => setIsOpen(false)}
      />

      {/* Main Container */}
      <div
        ref={containerRef}
        className="fixed bottom-16 right-4 xs:bottom-5 xs:right-5 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end gap-2 xs:gap-2.5 sm:gap-3"
        style={{
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {/* Options */}
        <div className="flex flex-col items-end gap-2 xs:gap-2.5 sm:gap-3">
          {options.map((option, index) => (
            <button
              key={option.id}
              ref={(el) => (optionsRef.current[index] = el)}
              onClick={() => handleOptionClick(option.action)}
              className="group flex items-center gap-2 xs:gap-2.5 sm:gap-3 bg-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 overflow-hidden"
              style={{
                transform: "scale(0)",
                opacity: 0,
                minHeight: "48px",
              }}
            >
              {/* Label - desktop only */}
              <span className="hidden sm:block text-[11px] md:text-[12px] font-medium tracking-wide text-neutral-700 pl-4 md:pl-5 pr-2 whitespace-nowrap transition-opacity duration-300">
                {option.label}
              </span>

              {/* Icon */}
              <div
                className={`flex items-center justify-center w-12 h-12 xs:w-13 xs:h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${option.color} shadow-md`}
              >
                <option.icon
                  size={18}
                  strokeWidth={2}
                  className="text-white xs:w-5 xs:h-5 sm:w-5 sm:h-5"
                />
              </div>

              {/* Label - mobile (inside button) */}
              <span className="sm:hidden text-[11px] xs:text-[12px] font-medium tracking-wide text-neutral-700 pr-4 xs:pr-5">
                {option.label}
              </span>
            </button>
          ))}
        </div>

        {/* Main Button */}
        <button
          ref={mainButtonRef}
          onClick={toggleMenu}
          className="relative w-14 h-14 xs:w-15 xs:h-15 sm:w-16 sm:h-16 bg-neutral-900 rounded-full shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-300 flex items-center justify-center group overflow-hidden"
          style={{
            minWidth: "56px",
            minHeight: "56px",
          }}
          aria-label={isOpen ? "Close contact menu" : "Open contact menu"}
          aria-expanded={isOpen}
        >
          {/* Ripple effect */}
          <div className="absolute inset-0 bg-white rounded-full scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-10 transition-all duration-500 group-active:scale-110" />

          {/* Icon container */}
          <div ref={mainButtonIconRef} className="relative z-10">
            {isOpen ? (
              <X size={22} strokeWidth={2} className="text-white xs:w-6 xs:h-6 sm:w-6 sm:h-6" />
            ) : (
              <MessageCircle size={22} strokeWidth={2} className="text-white xs:w-6 xs:h-6 sm:w-6 sm:h-6" />
            )}
          </div>

          {/* Pulse animation when closed */}
          {!isOpen && (
            <>
              <div className="absolute inset-0 rounded-full bg-neutral-900 animate-ping opacity-20" />
              <div className="absolute inset-0 rounded-full bg-neutral-900 animate-pulse opacity-30" />
            </>
          )}
        </button>

        {/* Tooltip - desktop only */}
        {!isOpen && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block">
            <div className="bg-neutral-900 text-white text-[11px] font-medium tracking-wide px-4 py-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Need Help? Contact Us
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                <div className="w-2 h-2 bg-neutral-900 rotate-45" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingEnquiry;
