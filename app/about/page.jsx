export const metadata = {
  title: "About Us | The Fitting Room Platform",
  description: "Learn about our 2D fitting room platform for clothing and our mission to enhance online shopping.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">About Us</h1>

        <div className="space-y-8 text-lg text-medium-gray">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Our Mission</h2>
            <p>
              We are building a professional, minimalistic, and trustworthy platform that delivers 
              a 2D clothing-only fitting room experience. Our goal is to help consumers make 
              confident purchase decisions while helping brands showcase their products effectively.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">What We Do</h2>
            <p>
              Our platform connects clothing brands with consumers through cutting-edge 2D fitting 
              room technology. Consumers can browse products, upload their photos, and visualize 
              how clothing items look on them before making a purchase decision.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">For Brands</h2>
            <p>
              We provide brands with powerful tools to showcase their clothing collections, manage 
              products, track engagement, and gain insights into consumer preferences. Our credit 
              system allows brands to promote products and increase visibility.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">For Consumers</h2>
            <p>
              All consumer features are completely free. Browse products from verified brands, 
              use our fitting room technology, and shop with confidence. Your privacy and data 
              security are our top priorities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Our Values</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Privacy and security first</li>
              <li>Transparency in all operations</li>
              <li>User-controlled data</li>
              <li>Professional and trustworthy service</li>
              <li>Continuous innovation</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

