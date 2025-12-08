
function TermsOfuse() {
    return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      
      <div className="max-w-5xl mx-auto px-4 py-24">
        {/* Title */}
        <h1 className="text-3xl  text-gray-900 mb-6 border-b pb-3">
          Terms of Use
        </h1>

        <p className="text-sm text-gray-600 mb-8">
          These Terms of Use constitute a binding agreement between the User and Aroha
          House, governing access and use of the platform.
        </p>

        {/* Sections */}
        <div className="space-y-8">
          {/* Eligibility */}
          <section>
            <h2 className="text-xl  mb-2">1.1 Eligibility</h2>
            <p className="text-gray-700">
              Users must be at least 18 years of age or be accessing the website under
              parental supervision.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-xl  mb-2">1.2 User Accounts</h2>
            <p className="text-gray-700">
              Users are solely responsible for maintaining confidentiality of account
              credentials. Aroha House shall not be liable for unauthorized access or
              actions performed under a registered account.
            </p>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-xl  mb-2">1.3 Acceptable Use</h2>
            <p className="text-gray-700">
              Users shall not engage in any activity that is unlawful, defamatory,
              infringing, or otherwise harmful to the interests of Aroha House.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-xl  mb-2">1.4 Intellectual Property</h2>
            <p className="text-gray-700">
              All trademarks, content, design, graphics, and other intellectual property on
              the site are the sole property of Aroha House. No content may be copied,
              reproduced, or exploited without express written permission.
            </p>
          </section>

          {/* Force Majeure */}
          <section>
            <h2 className="text-xl  mb-2">1.5 Force Majeure</h2>
            <p className="text-gray-700">
              Aroha House shall not be held liable for failure or delay in performance due
              to causes beyond reasonable control including acts of God, war, pandemics,
              cyberattacks, or service outages.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-xl  mb-2">1.6 Indemnification</h2>
            <p className="text-gray-700">
              Users agree to indemnify and hold harmless Aroha House and its affiliates
              from any loss, liability, claim, or expense arising due to violation of these
              terms.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl  mb-2">1.7 Limitation of Liability</h2>
            <p className="text-gray-700">
              To the maximum extent permissible under law, Aroha House disclaims liability
              for any direct, indirect, incidental, or consequential damages arising from
              the use or inability to use the website or products.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-xl  mb-2">1.8 Governing Law</h2>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws
              of India. Disputes shall be subject to exclusive jurisdiction of the Hon’ble
              High Court at Calcutta: High Court of Calcutta, 3, Esplanade Row W, BBD Bagh,
              Kolkata, West Bengal 700001.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsOfuse;
