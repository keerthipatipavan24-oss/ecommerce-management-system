import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getSavedProducts } from "../data/productStorage";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Load products from localStorage
  const [products] = useState(getSavedProducts);

  // Find selected product
  const product = products.find((item) => item.id === Number(id));

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Product Not Found
          </h1>
          <Link
            to="/products"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const hasSizes = Boolean(product.sizes?.length);
  const specifications = product.specifications || {};

  // Add product to cart
  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      setMessage("Please select a size before adding to cart.");
      return false;
    }

    let savedCart = [];

    try {
      savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      savedCart = [];
    }

    const existingItem = savedCart.find(
      (item) =>
        item.id === product.id && (item.selectedSize || "") === selectedSize,
    );

    const currentQuantity = existingItem ? existingItem.quantity : 0;

    if (currentQuantity + quantity > product.stock) {
      setMessage(`Only ${product.stock} item(s) are available in stock.`);
      return false;
    }

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      savedCart.push({
        ...product,
        quantity,
        selectedSize,
      });
    }

    localStorage.setItem("cart", JSON.stringify(savedCart));
    window.dispatchEvent(new Event("cartUpdated"));

    setMessage("Product added to cart successfully!");

    return true;
  };

  // Buy Now
  const handleBuyNow = () => {
    if (hasSizes && !selectedSize) {
      setMessage("Please select a size before proceeding.");
      return;
    }

    const addedSuccessfully = handleAddToCart();

    if (!addedSuccessfully) {
      return;
    }

    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {
      navigate("/login");
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-blue-600">
            Products
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product Image */}
          <div className="h-[350px] rounded-xl border border-gray-200 bg-white p-5 sm:h-[450px] lg:sticky lg:top-6">
            <div className="flex h-full items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <p className="text-sm font-medium text-blue-600">
              {product.category}
            </p>

            <h1 className="mt-2 text-2xl font-semibold leading-snug text-gray-900 sm:text-3xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="rounded bg-green-700 px-2 py-1 font-semibold text-white">
                {product.rating} ★
              </span>
              <span className="text-gray-500">Customer rating</span>
            </div>

            <div className="my-5 border-t border-gray-200" />

            {/* Price */}
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
              <p className="mt-2 text-sm text-green-700">
                Inclusive of all applicable taxes
              </p>
            </div>

            {/* Stock Availability */}
            <p
              className={`mt-5 font-semibold ${
                isOutOfStock
                  ? "text-red-600"
                  : product.stock <= 5
                    ? "text-orange-600"
                    : "text-green-700"
              }`}
            >
              {isOutOfStock
                ? "Currently unavailable"
                : product.stock <= 5
                  ? `Only ${product.stock} left in stock`
                  : "In stock"}
            </p>

            {/* Delivery Information */}
            <div className="mt-5 rounded-lg border border-gray-200 p-4">
              <p className="font-semibold text-gray-800">
                Delivery information
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Delivery options will be available during checkout.
              </p>
            </div>

            {/* Size Selector */}
            {hasSizes && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-gray-800">
                  Select Size:{" "}
                  <span className="font-normal text-blue-600">
                    {selectedSize || "Choose a size"}
                  </span>
                </p>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => {
                        setSelectedSize(size);
                        setMessage("");
                      }}
                      className={`min-w-12 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        selectedSize === size
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white text-gray-800 hover:border-blue-600"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <label
                htmlFor="quantity"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Quantity
              </label>

              <select
                id="quantity"
                value={quantity}
                onChange={(event) => {
                  setQuantity(Number(event.target.value));
                  setMessage("");
                }}
                disabled={isOutOfStock}
                className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 disabled:bg-gray-100"
              >
                {Array.from(
                  { length: Math.min(product.stock, 5) },
                  (_, index) => index + 1,
                ).map((number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))}
              </select>
            </div>

            {/* Validation Message */}
            {message && (
              <p
                className={`mt-4 text-sm font-medium ${
                  message.includes("successfully")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Add to Cart
              </button>

              <button
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="flex-1 rounded-lg border border-blue-600 bg-white px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-400 disabled:text-gray-400"
              >
                Buy Now
              </button>
            </div>

            <Link
              to="/products"
              className="mt-5 text-sm font-medium text-blue-600 hover:underline"
            >
              Back to Products
            </Link>
          </div>
        </div>

        {/* Product Description */}
        <section className="mt-12 border-t border-gray-200 pt-8 sm:mt-16">
          <h2 className="text-2xl font-bold text-gray-900">
            Product Description
          </h2>

          <p className="mt-4 max-w-5xl whitespace-pre-line text-base leading-7 text-gray-600">
            {product.description ||
              `Explore the ${product.name} from our ${product.category} collection.`}
          </p>
        </section>

        {/* Product Specifications */}
        <section className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Product Specifications
          </h2>

          <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
            <div className="divide-y divide-gray-200">
              {Object.entries(specifications).map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-2 gap-4 bg-white p-4 transition hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-500 sm:text-base">
                    {label}
                  </span>
                  <span className="break-words text-sm font-medium text-gray-800 sm:text-base">
                    {value}
                  </span>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4 bg-white p-4">
                <span className="text-sm text-gray-500 sm:text-base">
                  Category
                </span>
                <span className="text-sm font-medium text-gray-800 sm:text-base">
                  {product.category}
                </span>
              </div>

              {hasSizes && (
                <div className="grid grid-cols-2 gap-4 bg-white p-4">
                  <span className="text-sm text-gray-500 sm:text-base">
                    Available Sizes
                  </span>
                  <span className="text-sm font-medium text-gray-800 sm:text-base">
                    {product.sizes.join(", ")}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 bg-white p-4">
                <span className="text-sm text-gray-500 sm:text-base">
                  Availability
                </span>
                <span
                  className={`text-sm font-medium sm:text-base ${
                    isOutOfStock ? "text-red-600" : "text-green-700"
                  }`}
                >
                  {isOutOfStock ? "Out of stock" : "In stock"}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
