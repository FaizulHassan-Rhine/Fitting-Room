export const metadata = {
  title: "Terms of Service | The Fitting Room Platform",
  description: "Read our terms of service to understand the rules and guidelines for using our platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>
        <p className="text-medium-gray mb-8">Last updated: January 22, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-medium-gray">
              By accessing and using this platform, you accept and agree to be bound by these Terms 
              of Service. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Use of Service</h2>
            <p className="text-medium-gray mb-3">You agree to:</p>
            <ul className="list-disc list-inside text-medium-gray space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Use the platform only for lawful purposes</li>
              <li>Not misuse or abuse the fitting room feature</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Fitting Room Disclaimer</h2>
            <p className="text-medium-gray">
              Our 2D fitting room feature is provided for visualization purposes only. The appearance 
              and fit shown are approximations. Actual product appearance and fit may vary. We make no 
              guarantees regarding the accuracy of the fitting room results.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. For Consumers</h2>
            <ul className="list-disc list-inside text-medium-gray space-y-2 ml-4">
              <li>All consumer features are free to use</li>
              <li>You must be 18 years or older to create an account</li>
              <li>Certain categories require account verification</li>
              <li>You retain ownership of images you upload</li>
              <li>You grant us license to process images for try-on purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. For Brands</h2>
            <ul className="list-disc list-inside text-medium-gray space-y-2 ml-4">
              <li>You must provide accurate brand and product information</li>
              <li>You own your product images and content</li>
              <li>You grant us license to display your products on our platform</li>
              <li>Admin approval is required before products go live</li>
              <li>Credits are non-refundable once purchased</li>
              <li>We reserve the right to suspend accounts that violate policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Intellectual Property</h2>
            <p className="text-medium-gray">
              The platform and its original content, features, and functionality are owned by us and 
              are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
            <p className="text-medium-gray">
              We shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
            <p className="text-medium-gray">
              We may terminate or suspend your account and access to the service immediately, without 
              prior notice, for conduct that we believe violates these Terms of Service or is harmful 
              to other users, us, or third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Changes to Terms</h2>
            <p className="text-medium-gray">
              We reserve the right to modify these terms at any time. We will notify users of any 
              material changes via email or platform notification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
            <p className="text-medium-gray">
              If you have questions about these Terms of Service, please contact us at legal@vto-platform.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

