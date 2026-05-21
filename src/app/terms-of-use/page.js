import React from "react";

export const metadata = {
  title: 'Terms of Use | Aroha',
  description: 'The terms and conditions for using the Aroha platform.',
};

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-white text-stone-900 pt-12 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl mb-12">Terms of Use</h1>
        <div className="prose prose-stone max-w-none space-y-8 text-stone-600 leading-relaxed">
          <p className="text-sm font-medium text-stone-400 italic">
            This platform is owned and operated by Aroha House. Throughout the site, the terms “we”, “us” and “our” refer to Aroha House. By using this site, you agree to the following terms.
          </p>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.1 Online Store Terms</h2>
            <p>
              By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.2 General Conditions</h2>
            <p>
              We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.3 Accuracy & Timeliness</h2>
            <p>
              We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon as the sole basis for making decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.4 Modifications to Service</h2>
            <p>
              Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service without notice at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.5 Governing Law</h2>
            <p>
              These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
