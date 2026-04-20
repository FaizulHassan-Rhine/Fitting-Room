import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark-gray text-white border-t border-medium-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">VTO</h3>
            <p className="text-light-gray text-sm">
              Professional 2D fitting room platform for clothing.
            </p>
          </div>

          {/* For Consumers */}
          <div>
            <h4 className="font-semibold mb-4">For Consumers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/browse" className="text-light-gray hover:text-white transition-colors">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-light-gray hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-light-gray hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* For Brands */}
          <div>
            <h4 className="font-semibold mb-4">For Brands</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/brands" className="text-light-gray hover:text-white transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-light-gray hover:text-white transition-colors">
                  Register Brand
                </Link>
              </li>
              <li>
                <Link href="/rankings" className="text-light-gray hover:text-white transition-colors">
                  Trendy Brands Explained
                </Link>
              </li>
              <li>
                <Link href="/brands/pricing" className="text-light-gray hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-light-gray hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-light-gray hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-light-gray hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-medium-gray mt-8 pt-8 text-sm text-light-gray text-center">
          <p>&copy; {new Date().getFullYear()} The Fitting Room Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

