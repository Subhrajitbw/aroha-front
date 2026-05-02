import React from "react";

export const metadata = {
  title: 'Shipping Policy | Aroha',
  description: 'Details about our shipping locations, processing times, and delivery timelines.',
};

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-white text-stone-900 pt-12 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl mb-12">Shipping & Delivery</h1>
        <div className="prose prose-stone max-w-none space-y-8 text-stone-600 leading-relaxed">
          <p className="text-sm font-medium text-stone-400 italic">
            This Shipping & Delivery Policy outlines the terms under which Aroha House processes, ships, and delivers orders placed on our platform.
          </p>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.1 Shipping Locations</h2>
            <p>
              We currently deliver to all major cities and towns across India. Certain remote or restricted locations may not be serviceable. Customers shall be informed prior to dispatch and refunded if necessary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.2 Processing Time</h2>
            <p>
              Orders are typically processed within <span className="font-medium text-stone-900">1–3 business days</span>. Custom, bulk, or made-to-order items may require additional processing time, which will be communicated at the time of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.3 Delivery Timelines</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><span className="font-medium text-stone-900">Metro Cities:</span> 3–5 business days</li>
              <li><span className="font-medium text-stone-900">Tier 2 & 3 Cities:</span> 5–7 business days</li>
              <li><span className="font-medium text-stone-900">Remote Areas:</span> 7–10 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.4 Shipping Charges</h2>
            <p>
              Shipping charges are calculated at checkout based on order value, weight, and delivery location. Free shipping promotions may be offered and will be indicated during checkout.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.5 Order Tracking</h2>
            <p>
              Once your order is dispatched, you will receive an email or SMS containing tracking details. You may track shipments directly on the courier’s website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.6 Contact</h2>
            <p>
              For queries related to shipping and delivery, please contact us at <span className="text-stone-900 font-medium">contact.arohahouse@gmail.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
