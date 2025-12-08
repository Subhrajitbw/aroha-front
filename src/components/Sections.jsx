// src/components/Sections.jsx
import React, { forwardRef } from "react";

const Section = forwardRef(function Section({ className = "", children, ...props }, ref) {
  return (
    <section ref={ref} className={className} {...props}>
      {children}
    </section>
  );
});

export default Section;
