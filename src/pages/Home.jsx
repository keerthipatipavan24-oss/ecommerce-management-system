import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import products from "../data/products";

export default function Home() {
  const images = [
    {
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1000",
    },
    {
      category: "Men's Clothing",
      image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=1000",
    },
    {
      category: "Footwear",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000",
    },
    {
      category: "Accessories",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000",
    },
  ];

  const categories = [
    {
      name: "Electronics",
      icon: "🎧",
      description: "Explore the latest gadgets",
      link: "/products?category=Electronics",
    },
    {
      name: "Men's Clothing",
      icon: "👕",
      description: "Discover everyday fashion",
      link: "/products?category=Men's%20Clothing",
    },
    {
      name: "Footwear",
      icon: "👟",
      description: "Find your perfect pair",
      link: "/products?category=Footwear",
    },
    {
      name: "Accessories",
      icon: "🎒",
      description: "Complete your everyday look",
      link: "/products?category=Accessories",
    },
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((previousImage) => (previousImage + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const featuredProducts = products.filter((product) =>
    [1, 7, 13, 19].includes(product.id),
  );

  return (
    <div className="bg-gray-50">
      {/* Section 1: Hero Banner */}
      <section className="bg-gray-800 px-6 py-16 text-white md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          {/* Left Side */}
          <div>
            <p className="font-semibold uppercase tracking-widest text-blue-400">
              Welcome to SnapCart
            </p>

            <h1 className="mt-4 text-4xl font-bold md:text-6xl">
              Discover Products You'll Love
            </h1>

            <p className="mt-5 text-lg text-gray-300">
              Explore electronics, men's clothing, footwear, and accessories at
              great prices.
            </p>

            <Link
              to="/products"
              className="mt-8 inline-block rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Shop Now
            </Link>
          </div>

          {/* Right Side: Automatic Image Slider */}
          <div>
            <img
              src={images[currentImage].image}
              alt={images[currentImage].category}
              className="h-80 w-full rounded-2xl object-cover shadow-xl md:h-96"
            />

            <p className="mt-3 text-center font-semibold text-blue-400">
              {images[currentImage].category}
            </p>

            <div className="mt-4 flex justify-center gap-2">
              {images.map((image, index) => (
                <button
                  key={image.category}
                  onClick={() => setCurrentImage(index)}
                  aria-label={`Show ${image.category}`}
                  className={`h-2.5 rounded-full transition-all ${
                    currentImage === index
                      ? "w-8 bg-blue-400"
                      : "w-2.5 bg-gray-500"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Browse by Category */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <p className="font-semibold uppercase tracking-widest text-blue-600">
            EXPLORE COLLECTIONS
          </p>

          <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
            Shop Your Favourite Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.link}
              className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900 transition group-hover:text-blue-600">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {category.description}
                </p>
              </div>

              <span className="ml-3 text-4xl transition duration-300 group-hover:scale-110">
                {category.icon}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 3: Featured Products */}
      <section className="max-w-7xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Featured Products
            </h2>

            <p className="mt-2 text-gray-600">
              Check out our popular picks for you.
            </p>
          </div>

          <Link
            to="/products"
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            View All Products
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-52 w-full object-cover"
              />

              <div className="p-5">
                <p className="text-sm text-gray-500">{product.category}</p>

                <h3 className="mt-2 text-lg font-semibold text-gray-900">
                  {product.name}
                </h3>

                <p className="mt-3 text-3xl font-bold text-blue-600">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  ⭐ {product.rating} / 5
                </p>

                <Link
                  to={`/products/${product.id}`}
                  className="mt-4 block rounded-lg border border-blue-600 px-4 py-2 text-center font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
