export const metadata = {
  title: "Privacy Policy | The Fitting Room Platform",
  description: "Read our privacy policy to understand how we protect and handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-medium-gray mb-8">Last updated: January 22, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <p className="text-medium-gray mb-3">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-medium-gray space-y-2 ml-4">
              <li>Account information (name, email, password)</li>
              <li>Brand information (for brand accounts)</li>
              <li>Photos you upload for fitting room</li>
              <li>Optional body measurements</li>
              <li>Product interaction data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-medium-gray space-y-2 ml-4">
              <li>To provide fitting room services</li>
              <li>To improve our platform and services</li>
              <li>To communicate with you about your account</li>
              <li>To send product interaction data to relevant brands (non-personal data only)</li>
              <li>To ensure platform security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Image Storage and Privacy</h2>
            <p className="text-medium-gray mb-3">
              Your uploaded images are treated with the highest level of privacy:
            </p>
            <ul className="list-disc list-inside text-medium-gray space-y-2 ml-4">
              <li>Images are encrypted and securely stored</li>
              <li>Only stored after account verification (if you choose to save them)</li>
              <li>Never shared with brands or third parties</li>
              <li>You can delete your images at any time</li>
              <li>Images are automatically deleted after 90 days of inactivity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Data Sharing</h2>
            <p className="text-medium-gray mb-3">
              We share limited data as follows:
            </p>
            <ul className="list-disc list-inside text-medium-gray space-y-2 ml-4">
              <li>Product interaction data is shared with relevant brands (non-personal)</li>
              <li>We never share personal information, photos, or measurements</li>
              <li>We may share aggregated, anonymized data for analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
            <p className="text-medium-gray mb-3">You have the right to:</p>
            <ul className="list-disc list-inside text-medium-gray space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and all associated data</li>
              <li>Export your data</li>
              <li>Opt-out of non-essential communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Security</h2>
            <p className="text-medium-gray">
              We implement industry-standard security measures to protect your data, including 
              encryption, secure servers, and regular security audits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Contact Us</h2>
            <p className="text-medium-gray">
              If you have questions about this Privacy Policy, please contact us at privacy@vto-platform.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

