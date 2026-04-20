import Link from "next/link";

export const metadata = {
  title: "Trendy Brands Explained | The Fitting Room Platform",
  description: "Learn how we identify trending brands fairly and transparently based on performance metrics.",
};

export default function RankingsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">How We Rank Trendy Brands</h1>
        <p className="text-medium-gray mb-8 text-lg">
          Transparent, merit-based algorithm that identifies trending brands based on real performance
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">What Makes a Brand "Trendy"?</h2>
            <p className="text-medium-gray mb-4">
              Our "Trendy Brands" section showcases brands that are currently performing well across 
              multiple metrics. Rankings are determined by an algorithmic system based on real performance 
              data—not by who pays the most. Every brand has an equal opportunity to become trendy by 
              improving their metrics.
            </p>
          </section>

          <section className="bg-light-gray rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">What Makes a Brand Trendy?</h2>
            <p className="text-medium-gray mb-6">
              We analyze 4 key performance indicators to identify trending brands:
            </p>
            
            <div className="space-y-6">
              <div className="border-l-4 border-black pl-4">
                <h3 className="text-xl font-semibold mb-2">🔥 Popularity (25%)</h3>
                <p className="text-medium-gray mb-2">
                  Based on brand profile views, followers, and overall engagement with your brand page.
                </p>
                <p className="text-sm text-medium-gray">
                  <strong>How to improve:</strong> Create compelling brand profiles, engage with your audience, 
                  share quality content, and build a following.
                </p>
              </div>

              <div className="border-l-4 border-black pl-4">
                <h3 className="text-xl font-semibold mb-2">💡 Demand (25%)</h3>
                <p className="text-medium-gray mb-2">
                  Based on how often people search for your brand, add products to wishlists, 
                  and show interest signals.
                </p>
                <p className="text-sm text-medium-gray">
                  <strong>How to improve:</strong> Increase brand awareness, launch new collections, 
                  and create products people want.
                </p>
              </div>

              <div className="border-l-4 border-black pl-4">
                <h3 className="text-xl font-semibold mb-2">💰 Sales (30%)</h3>
                <p className="text-medium-gray mb-2">
                  Based on total sales count and conversion rate. This is weighted highest because 
                  sales directly indicate customer satisfaction and product quality.
                </p>
                <p className="text-sm text-medium-gray">
                  <strong>How to improve:</strong> Offer quality products, competitive pricing, 
                  accurate descriptions, and excellent customer service.
                </p>
              </div>

              <div className="border-l-4 border-black pl-4">
                <h3 className="text-xl font-semibold mb-2">👗 Fitting Room Usage (20%)</h3>
                <p className="text-medium-gray mb-2">
                  Based on how often customers try on your products in The Fitting Room. 
                  High try-on rates indicate engaging product presentations.
                </p>
                <p className="text-sm text-medium-gray">
                  <strong>How to improve:</strong> Upload high-quality product images, provide 
                  detailed size guides, and offer diverse product ranges.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">What "Trendy" Is NOT Based On</h2>
            <ul className="list-disc list-inside text-medium-gray space-y-2 ml-4">
              <li>How much you pay the platform</li>
              <li>Advertising spend</li>
              <li>Brand size or company revenue</li>
              <li>How long you&apos;ve been on the platform</li>
              <li>Personal relationships or favoritism</li>
            </ul>
            <p className="text-medium-gray mt-4">
              Trending status is purely algorithmic and merit-based. Every brand competes on the same playing field.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Credits & Promotions</h2>
            <p className="text-medium-gray mb-4">
              While trending status is based on performance, brands can purchase credits to promote individual 
              products. Promoted products appear with a "Promoted" badge and get additional visibility, 
              but this does NOT artificially boost your trending score.
            </p>
            <p className="text-medium-gray">
              Think of credits as advertising—they increase exposure, which can lead to more engagement, 
              but your trending status is still earned through actual performance metrics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How Often Do Trends Change?</h2>
            <p className="text-medium-gray mb-4">
              Trending brands are recalculated regularly based on rolling 30-day performance data. 
              This means:
            </p>
            <ul className="list-disc list-inside text-medium-gray space-y-2 ml-4">
              <li>Recent performance matters most</li>
              <li>New brands can quickly become trendy</li>
              <li>Established brands must maintain performance to stay trendy</li>
              <li>Trends reflect current market dynamics</li>
            </ul>
          </section>

          <section className="bg-black text-white rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4">For Brands: Track Your Performance</h2>
            <p className="text-light-gray mb-6">
              Want to see how trendy your brand is? Your brand dashboard shows:
            </p>
            <ul className="text-light-gray space-y-2 mb-6">
              <li>✓ Your current performance metrics</li>
              <li>✓ Trending status and performance trends</li>
              <li>✓ Specific recommendations to improve</li>
              <li>✓ How you compare to trending brands</li>
            </ul>
            <Link 
              href="/dashboard/brand" 
              className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-light-gray transition-colors"
            >
              Go to Brand Dashboard →
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Questions or Concerns?</h2>
            <p className="text-medium-gray mb-4">
              We&apos;re committed to transparency and fairness. If you have questions about how 
              trending brands are determined or believe there&apos;s an error in your metrics, please contact us.
            </p>
            <Link 
              href="/contact" 
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-dark-gray transition-colors"
            >
              Contact Support
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

