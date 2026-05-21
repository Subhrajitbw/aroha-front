import React from "react";

export const metadata = {
  title: 'Refund Policy | Aroha',
  description: 'Our policy on returns, exchanges, and refunds.',
};

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white text-stone-900 pt-12 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl mb-12">Refund & Return Policy</h1>
        <div className="prose prose-stone max-w-none space-y-8 text-stone-600 leading-relaxed">
          <p className="text-sm font-medium text-stone-400 italic">
            This Return, Exchange, and Refund Policy outlines the terms under which Aroha House accepts returns and processes refunds.
          </p>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.1 Eligibility for Returns</h2>
            <p>
              Return requests must be initiated within <span className="font-medium text-stone-900">48 hours</span> of delivery. To be eligible:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Item must be unused, undamaged, and in original packaging.</li>
              <li>Custom or made-to-order products are not eligible for return unless received damaged.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.2 Mandatory Unboxing Evidence</h2>
            <p>
              Return requests shall only be accepted if supported by <span className="font-medium text-stone-900">unedited unboxing video footage</span> clearly demonstrating the defect or damage. Any claim lacking such evidence shall be deemed ineligible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.3 Inspection & Approval</h2>
            <p>
              All returned goods shall undergo quality control inspection. Aroha House reserves the right to reject returns that fail to meet our eligibility conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.4 Refunds</h2>
            <p>
              Approved refunds shall be processed to the original payment method or via NEFT/UPI within <span className="font-medium text-stone-900">seven (7) working days</span> of return approval.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.5 Fraudulent Returns</h2>
            <p>
              Aroha House reserves the right to blacklist accounts or take legal action in cases of repeated, abusive, or fraudulent return claims.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
