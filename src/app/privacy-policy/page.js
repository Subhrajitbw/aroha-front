import React from "react";

export const metadata = {
  title: 'Privacy Policy | Aroha',
  description: 'How we collect, use, and protect your personal information.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-stone-900 pt-12 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl mb-12">Privacy Policy</h1>
        <div className="prose prose-stone max-w-none space-y-8 text-stone-600 leading-relaxed">
          <p className="text-sm font-medium text-stone-400 italic">
            This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our site.
          </p>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.1 Information Collection</h2>
            <p>
              We collect information you provide directly, such as your name, email, shipping address, and payment details when you make a purchase. We also automatically collect certain device information, including IP address, time zone, and cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.2 Use of Information</h2>
            <p>
              We use the collected information to fulfill orders, communicate with you, screen for potential risk or fraud, and, according to your preferences, provide you with information or advertising relating to our products or services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.3 Data Sharing</h2>
            <p>
              We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use Medusa for our online store and Google Analytics to understand how our customers use the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.4 Security</h2>
            <p>
              Aroha House takes reasonable precautions and follows industry best practices to ensure your personal information is not inappropriately lost, misused, accessed, disclosed, altered, or destroyed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.5 Cookies</h2>
            <p>
              We use cookies to improve your experience on our site, track analytics, and remember your preferences. You can choose to disable cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900 mb-4 uppercase tracking-wider">1.6 Contact Us</h2>
            <p>
              For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <span className="text-stone-900 font-medium">contact.arohahouse@gmail.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
