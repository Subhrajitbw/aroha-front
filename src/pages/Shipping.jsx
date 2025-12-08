
function ShippingPolicy() {

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      
      <div className="max-w-5xl mx-auto px-4 py-24">
        {/* Title */}
        <h1 className="text-3xl text-gray-900 mb-6 border-b pb-3">
          Shipping &amp; Delivery Policy
        </h1>

        <p className="text-sm text-gray-600 mb-8">
          This Shipping &amp; Delivery Policy outlines the terms under which Aroha House
          (“Company”, “we”, “our”, “us”) processes, ships, and delivers orders placed on
          our platform. By purchasing from our website, you agree to the following
          conditions.
        </p>

        {/* Sections */}
        <div className="space-y-8">
          {/* 1. Shipping Locations */}
          <section>
            <h2 className="text-xl mb-2">1.1 Shipping Locations</h2>
            <p className="text-gray-700">
              We currently deliver to all major cities and towns across India. Certain
              remote or restricted locations may not be serviceable. In such cases,
              customers shall be informed prior to dispatch and refunded if necessary.
            </p>
          </section>

          {/* 2. Processing Time */}
          <section>
            <h2 className="text-xl mb-2">1.2 Processing Time</h2>
            <p className="text-gray-700">
              Orders are typically processed within{" "}
              <span className="font-medium">1–3 business days</span> from the date of
              confirmation. Orders placed on weekends or public holidays will be processed
              on the next working day. Custom, bulk, or made-to-order items may require
              additional processing time, which will be communicated at the time of
              purchase.
            </p>
          </section>

          {/* 1. Delivery Timelines */}
          <section>
            <h2 className="text-xl mb-2">1.3 Delivery Timelines</h2>
            <p className="text-gray-700 mb-2">
              Estimated delivery timelines vary by location:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>
                <span className="font-medium">Metro Cities:</span> 3–5 business days
              </li>
              <li>
                <span className="font-medium">Tier 2 &amp; Tier 3 Cities:</span> 5–7
                business days
              </li>
              <li>
                <span className="font-medium">Remote/Outlying Areas:</span> 7–10 business
                days
              </li>
            </ul>
            <p className="text-gray-700 mt-2">
              Please note that these are estimated timelines and actual delivery may vary
              due to courier delays, weather conditions, or other unforeseen circumstances.
            </p>
          </section>

          {/* 4. Shipping Charges */}
          <section>
            <h2 className="text-xl mb-2">1.4 Shipping Charges</h2>
            <p className="text-gray-700">
              Shipping charges are calculated at checkout based on order value, weight, and
              delivery location. Aroha House may offer free shipping promotions from time
              to time, which will be clearly indicated during checkout.
            </p>
          </section>

          {/* 5. Order Tracking */}
          <section>
            <h2 className="text-xl mb-2">1.5 Order Tracking</h2>
            <p className="text-gray-700">
              Once your order is dispatched, you will receive an email or SMS containing
              the tracking details. Customers may track shipments directly on the courier’s
              website using the provided tracking number.
            </p>
          </section>

          {/* 6. Delayed or Failed Deliveries */}
          <section>
            <h2 className="text-xl mb-2">1.6 Delayed or Failed Deliveries</h2>
            <p className="text-gray-700">
              In the event of a delay, Aroha House will make reasonable efforts to keep you
              informed. If delivery fails due to incorrect address, unavailability, or
              refusal to accept, the order may be returned to us and additional charges may
              apply for re-shipment.
            </p>
          </section>

          {/* 7. International Shipping */}
          <section>
            <h2 className="text-xl mb-2">1.7 International Shipping</h2>
            <p className="text-gray-700">
              Currently, Aroha House ships only within India. International shipping will
              be introduced in the future and communicated via official updates on our
              website.
            </p>
          </section>

          {/* 8. Contact */}
          <section>
            <h2 className="text-xl mb-2">1.8 Contact</h2>
            <p className="text-gray-700">
              For queries related to shipping and delivery, please contact us at{" "}
              <span className="text-blue-600 underline">
                contact.arohahouse@gmail.com
              </span>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ShippingPolicy;
