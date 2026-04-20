import { NextResponse } from "next/server";

/** Demo GET products API – for "Get products from API URL" tab. Same structure as expected by the import flow. */
export async function GET() {
  const products = [
    {
      title: "Classic Cotton T-Shirt",
      description: "Premium cotton tee, from demo API.",
      category: "T-Shirts",
      price: "29.99",
      currency: "USD",
      sizes: ["S", "M", "L", "XL"],
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      ],
    },
    {
      title: "Slim Fit Jeans",
      description: "Comfortable slim fit denim.",
      category: "Jeans",
      price: "59.99",
      currency: "USD",
      sizes: ["28", "30", "32", "34"],
      images: [
        "https://images.unsplash.com/photo-1542272454315-7d0ab97db995?w=400&h=400&fit=crop",
      ],
    },
    {
      title: "Summer Dress",
      description: "Light and breezy summer dress.",
      category: "Dresses",
      price: "45.00",
      currency: "USD",
      sizes: ["XS", "S", "M", "L"],
      images: [
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
      ],
    },
  ];

  return NextResponse.json({ products });
}
