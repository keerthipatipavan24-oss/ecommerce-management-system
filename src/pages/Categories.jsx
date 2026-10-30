import { useState, useEffect } from "react";
import { getSavedProducts } from "../data/productStorage";
import { Link } from "react-router-dom";

export default function Categories() {
  const [products] = useState(getSavedProducts);
  const categories = [
    {
      name: "Electronics",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600",
      description: "Explore gadgets and electronic essentials.",
    },
    {
      name: "Men's Clothing",
      image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600",
      description: "Discover styles for every occasion.",
    },
    {
      name: "Footwear",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
      description: "Find comfortable shoes for every day.",
    },
    {
      name: "Accessories",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
      description: "Complete your look with everyday essentials.",
    },
  ];

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section 1: Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Shop by Category
          </h1>
          <p className="mt-3 text-gray-600">
            Explore our collections and find the products you love.
          </p>
        </div>

        {/* Section 2: Category Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const productCount = products.filter(
              (product) => product.category === category.name,
            ).length;

            return (
              <div
                key={category.name}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-52 w-full object-cover"
                />

                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {category.name}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {category.description}
                  </p>

                  <p className="mt-3 text-sm font-medium text-blue-600">
                    {productCount} Products
                  </p>

                  <Link
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    className="mt-4 block rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
