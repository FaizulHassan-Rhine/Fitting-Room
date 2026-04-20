import Link from "next/link";

export const metadata = {
  title: "For Brands | The Fitting Room Platform",
  description: "Showcase your clothing line with cutting-edge fitting room technology. Increase customer confidence and reduce returns.",
};

export default function BrandsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Showcase Your Brand
          </h1>
          <p className="text-xl text-medium-gray mb-8">
            Join our platform and let customers try on your clothing. 
            Increase engagement, build confidence, and grow your sales.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/brands/search" className="btn btn-secondary">
              Browse Brands
            </Link>
            <Link href="/auth/register" className="btn btn-primary">
              Register Your Brand
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-light-gray py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why Join Our Platform
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-3">Fitting Room Technology</h3>
              <p className="text-medium-gray">
                Let customers see how your clothes look on them with our 2D fitting room feature.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Increase Conversions</h3>
              <p className="text-medium-gray">
                Help customers make confident purchase decisions and reduce return rates.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Analytics & Insights</h3>
              <p className="text-medium-gray">
                Track product performance, user engagement, and gain valuable consumer insights.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Easy Product Management</h3>
              <p className="text-medium-gray">
                Upload and manage your products with our intuitive brand dashboard.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Promoted Products</h3>
              <p className="text-medium-gray">
                Use credits to promote your products and increase visibility on the platform.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Brand Profile</h3>
              <p className="text-medium-gray">
                Create a professional brand profile with links to your website and social media.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How It Works
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Register Your Brand</h3>
                <p className="text-medium-gray">
                  Create a brand account and complete your profile with brand information and links.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Products</h3>
                <p className="text-medium-gray">
                  Add your clothing products with images, descriptions, sizes, and pricing.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Get Approved</h3>
                <p className="text-medium-gray">
                  Our admin team will review and approve your brand and products.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Reach Customers</h3>
                <p className="text-medium-gray">
                  Your products become available for consumers to browse and try on in our fitting room.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark-gray text-white py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-light-gray mb-8">
            Join hundreds of brands already using our platform
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/brands/search" className="btn btn-secondary">
              Browse Brands
            </Link>
            <Link href="/auth/register" className="btn btn-primary">
              Register Your Brand
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

