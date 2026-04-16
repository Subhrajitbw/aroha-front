
function PrivacyPolicy() {
    
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      
      <div className="max-w-5xl mx-auto px-4 py-24">
        {/* Title */}
        <h1 className="text-3xl  text-gray-900 mb-6 border-b pb-3">
          Privacy Policy
        </h1>

        <p className="text-sm text-gray-600 mb-8">
          This Privacy Policy is published in accordance with the Information Technology
          Act, 2000 and applicable rules thereunder, including the Information Technology
          (Reasonable Security Practices and Procedures and Sensitive Personal Data or
          Information) Rules, 2011.
        </p>

        {/* Sections */}
        <div className="space-y-8">
          {/* 1. Information We Collect */}
          <section>
            <h2 className="text-xl  mb-2">
              1.1 Information We Collect
            </h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Identifiable data such as full name, address, contact details, and email ID</li>
              <li>Transactional and order data</li>
              <li>Device and technical data including IP address, cookies, and usage logs</li>
            </ul>
          </section>

          {/* 2. Purpose of Collection */}
          <section>
            <h2 className="text-xl  mb-2">
              1.2 Purpose of Collection
            </h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Fulfilling contractual obligations (order processing, delivery, returns)</li>
              <li>Compliance with legal requirements</li>
              <li>
                Legitimate business interests including customer support, marketing (where
                consented), and analytics
              </li>
            </ul>
          </section>

          {/* 3. Data Retention */}
          <section>
            <h2 className="text-xl  mb-2">1.3 Data Retention</h2>
            <p className="text-gray-700">
              Personal data shall be retained only for the duration necessary to fulfill the
              purposes stated herein, or as mandated by applicable law.
            </p>
          </section>

          {/* 4. Cookies */}
          <section>
            <h2 className="text-xl  mb-2">1.4 Cookies &amp; Tracking</h2>
            <p className="text-gray-700">
              We utilize cookies for operational functionality, analytics, user
              personalization, and advertising. By using our website, you consent to our
              cookie usage. Users may manage cookie preferences via browser settings.
            </p>
          </section>

          {/* 5. Disclosure */}
          <section>
            <h2 className="text-xl  mb-2">
              1.5 Disclosure of Information
            </h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Service providers (logistics, IT, analytics, payment gateways)</li>
              <li>Government authorities, if mandated by law</li>
              <li>Legal or regulatory agencies under judicial requirement</li>
            </ul>
          </section>

          {/* 6. User Rights */}
          <section>
            <h2 className="text-xl  mb-2">1.6 User Rights</h2>
            <p className="text-gray-700">
              You may request access, correction, or deletion of your data by emailing{" "}
              <span className="text-blue-600 underline">
                contact.arohahouse@gmail.com
              </span>
              . Marketing opt-out is available via unsubscribe links or written request.
            </p>
          </section>

          {/* 7. Security */}
          <section>
            <h2 className="text-xl  mb-2">1.7 Security</h2>
            <p className="text-gray-700">
              We implement appropriate technical and organizational security measures.
              However, Aroha House disclaims liability for any unauthorized access arising
              due to causes beyond reasonable control.
            </p>
          </section>

          {/* 8. Data Breach */}
          <section>
            <h2 className="text-xl  mb-2">1.8 Data Breach</h2>
            <p className="text-gray-700">
              In the event of a data breach affecting your personal information, we shall
              notify the impacted individuals and authorities in accordance with applicable
              legal requirements.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
