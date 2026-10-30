import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSavedProducts } from "../data/productStorage";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category") || "All";

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [sortBy, setSortBy] = useState("default");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [currentPage, setCurrentPage] = useState(1);
  const [products] = useState(getSavedProducts);

  // Size selection modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");

  const productsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
    setCurrentPage(1);
  }, [categoryFromUrl]);

  // Search, filter and sort products
  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase().trim()),
    )
    .filter(
      (product) =>
        selectedCategory === "All" || product.category === selectedCategory,
    )
    .filter((product) => product.price <= maxPrice)
    .sort((a, b) => {
      if (sortBy === "lowToHigh") return a.price - b.price;
      if (sortBy === "highToLow") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return a.id - b.id;
    });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;

  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage,
  );

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSortBy("default");
    setMaxPrice(10000);
    setCurrentPage(1);
  };

  // Save product to cart
  const addProductToCart = (product, size = "") => {
    let savedCart = [];

    try {
      savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      savedCart = [];
    }

    const existingItem = savedCart.find(
      (item) => item.id === product.id && item.selectedSize === size,
    );

    const currentQuantity = existingItem ? existingItem.quantity : 0;

    if (currentQuantity + 1 > product.stock) {
      return;
    }

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      savedCart.push({
        ...product,
        quantity: 1,
        selectedSize: size,
      });
    }

    localStorage.setItem("cart", JSON.stringify(savedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Handle Add to Cart button
  const handleAddToCart = (product) => {
    if (product.stock === 0) return;

    // Open size modal for products with available sizes
    if (product.sizes?.length > 0) {
      setSelectedProduct(product);
      setSelectedSize("");
      return;
    }

    // Directly add products without sizes
    addProductToCart(product);
  };

  // Confirm size and add clothing product to cart
  const handleConfirmSize = () => {
    if (!selectedSize || !selectedProduct) return;

    addProductToCart(selectedProduct, selectedSize);

    setSelectedProduct(null);
    setSelectedSize("");
  };

  // Close size modal
  const handleCloseModal = () => {
    setSelectedProduct(null);
    setSelectedSize("");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Page Heading */}
        <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>

        <p className="mt-2 text-gray-600">
          Discover products for your everyday needs.
        </p>

        {/* Search and Filters */}
        <div className="mt-8 grid grid-cols-1 gap-5 rounded-xl bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(event) => {
              setSelectedCategory(event.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Men's Clothing">Men's Clothing</option>
            <option value="Footwear">Footwear</option>
            <option value="Accessories">Accessories</option>
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="default">Sort By</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>

          {/* Price Filter */}
          <div className="w-full">
            <div className="mb-3 flex items-center justify-between">
              <label
                htmlFor="maxPrice"
                className="text-sm font-medium text-gray-700"
              >
                Maximum Price
              </label>

              <span className="text-sm font-semibold text-blue-600">
                ₹{maxPrice.toLocaleString("en-IN")}
              </span>
            </div>

            <input
              id="maxPrice"
              type="range"
              min="0"
              max="100000"
              step="500"
              value={maxPrice}
              onChange={(event) => {
                setMaxPrice(Number(event.target.value));
                setCurrentPage(1);
              }}
              className="w-full cursor-pointer accent-blue-600"
            />

            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>₹0</span>
              <span>₹10,000</span>
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            Clear All Filters
          </button>
        </div>

        {/* Product Count */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <p className="text-gray-600">
            Showing {filteredProducts.length === 0 ? 0 : startIndex + 1}
            {" - "}
            {startIndex + currentProducts.length} of {filteredProducts.length}{" "}
            products
          </p>

          <p className="text-sm text-gray-500">
            Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
          </p>
        </div>

        {/* Product Grid */}
        {currentProducts.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {currentProducts.map((product) => (
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

                  <h2 className="mt-2 text-lg font-semibold text-gray-900">
                    {product.name}
                  </h2>

                  <p className="mt-2 text-xl font-bold text-blue-600">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    ⭐ {product.rating} / 5
                  </p>

                  {/* Stock Availability */}
                  <p
                    className={`mb-3 mt-2 text-sm font-medium ${
                      product.stock === 0
                        ? "text-red-600"
                        : product.stock <= 5
                          ? "text-orange-600"
                          : "text-green-600"
                    }`}
                  >
                    {product.stock === 0
                      ? "Out of Stock"
                      : product.stock <= 5
                        ? `Only ${product.stock} left`
                        : `In Stock: ${product.stock}`}
                  </p>

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => {
                        window.scrollTo(0, 0);
                        navigate(`/products/${product.id}`);
                      }}
                      className="flex-1 rounded-lg border border-blue-600 px-3 py-2 font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1 rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* No Products Found */
          <div className="mt-8 rounded-xl bg-white px-4 py-16 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              No products found
            </h2>

            <p className="mt-2 text-gray-600">
              Try changing your search or filters.
            </p>

            <button
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((page) => page - 1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-lg border px-4 py-2 ${
                    currentPage === page
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Clothing Size Selection Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Select Size</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedProduct.name}
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="text-2xl leading-none text-gray-500 hover:text-gray-900"
                aria-label="Close size selection"
              >
                &times;
              </button>
            </div>

            <p className="mt-6 text-sm font-semibold text-gray-700">
              Choose your size
            </p>

            <div className="mt-3 flex flex-wrap gap-3">
              {selectedProduct.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-12 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                    selectedSize === size
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-800 hover:border-blue-600"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmSize}
                disabled={!selectedSize}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
