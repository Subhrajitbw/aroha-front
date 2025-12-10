// src/styles/categorySectionResponsive.js
export const responsiveStyles = `
  @media (max-height: 800px) {
    .space-y-12 > * + * { margin-top: 2rem !important; }
    .space-y-8 > * + * { margin-top: 1.5rem !important; }
    .space-y-6 > * + * { margin-top: 1.25rem !important; }
    .space-y-4 > * + * { margin-top: 1rem !important; }
  }
  @media (max-height: 700px) {
    .space-y-12 > * + * { margin-top: 1.5rem !important; }
    .space-y-8 > * + * { margin-top: 1.25rem !important; }
    .space-y-6 > * + * { margin-top: 1rem !important; }
    .space-y-4 > * + * { margin-top: 0.75rem !important; }
  }
  @media (max-height: 600px) {
    .space-y-12 > * + * { margin-top: 1rem !important; }
    .space-y-8 > * + * { margin-top: 1rem !important; }
    .space-y-6 > * + * { margin-top: 0.75rem !important; }
    .space-y-4 > * + * { margin-top: 0.5rem !important; }
  }
  @media (max-height: 500px) {
    .cta-button { padding: 0.625rem 1.25rem !important; font-size: 0.875rem !important; }
    .space-y-12 > * + * { margin-top: 0.75rem !important; }
    .space-y-8 > * + * { margin-top: 0.75rem !important; }
    .space-y-6 > * + * { margin-top: 0.5rem !important; }
    .space-y-4 > * + * { margin-top: 0.375rem !important; }
  }
`;
