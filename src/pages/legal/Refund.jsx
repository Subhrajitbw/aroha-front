function ReturnRefundPolicy() {
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      
      <div className="max-w-5xl mx-auto px-4 py-24">
        {/* Title */}
        <h1 className="text-3xl text-gray-900 mb-6 border-b pb-3">
          Return &amp; Refund Policy
        </h1>

        <p className="text-sm text-gray-600 mb-8">
          This Return &amp; Refund Policy is applicable to all purchases made on the Aroha
          House platform.
        </p>

        {/* Sections */}
        <div className="space-y-8">
          {/* 1. Return Window */}
          <section>
            <h2 className="text-xl mb-2">1.1 Return Window</h2>
            <p className="text-gray-700">
              Customers may initiate a return request within seven (7) calendar days from
              the date of delivery.
            </p>
          </section>

          {/* 2. Eligibility Criteria */}
          <section>
            <h2 className="text-xl mb-2">1.2 Eligibility Criteria</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Item must be unused, undamaged, and returned in its original packaging with tags</li>
              <li>Custom or made-to-order products are not eligible for return unless received damaged</li>
            </ul>
          </section>

          {/* 3. Mandatory Unboxing Evidence */}
          <section>
            <h2 className="text-xl mb-2">1.3 Mandatory Unboxing Evidence</h2>
            <p className="text-gray-700">
              Return requests shall only be accepted if supported by unedited unboxing video
              footage clearly demonstrating the defect/damage. Any claim lacking such
              evidence shall be deemed ineligible.
            </p>
          </section>

          {/* 4. Inspection & Approval */}
          <section>
            <h2 className="text-xl mb-2">1.4 Inspection &amp; Approval</h2>
            <p className="text-gray-700">
              All returned goods shall undergo quality control inspection. Aroha House
              reserves the right to reject returns that fail to meet the above conditions.
            </p>
          </section>

          {/* 5. Refunds */}
          <section>
            <h2 className="text-xl mb-2">1.5 Refunds</h2>
            <p className="text-gray-700">
              Approved refunds shall be processed to the original payment method or via
              NEFT/UPI within seven (7) working days of return approval.
            </p>
          </section>

          {/* 6. Partial Refunds & Deductions */}
          <section>
            <h2 className="text-xl mb-2">1.6 Partial Refunds &amp; Deductions</h2>
            <p className="text-gray-700">
              Aroha House reserves the right to levy restocking or logistics charges in
              cases of partial refunds, discretionary approvals, or return misuse.
            </p>
          </section>

          {/* 7. Courier Disputes */}
          <section>
            <h2 className="text-xl mb-2">1.7 Courier Disputes</h2>
            <p className="text-gray-700">
              If an order is marked as delivered but not received by the customer, resolution
              shall rely on internal investigation and courier reports.
            </p>
          </section>

          {/* 8. Fraudulent Returns */}
          <section>
            <h2 className="text-xl mb-2">1.8 Fraudulent Returns</h2>
            <p className="text-gray-700">
              Aroha House reserves the right to blacklist accounts or take legal action in
              cases of repeated, abusive, or fraudulent return claims.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ReturnRefundPolicy;
