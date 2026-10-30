import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSavedProducts } from "../data/productStorage";

export default function Cart() {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  const [products] = useState(getSavedProducts);
  const [editingItem, setEditingItem] = useState(null);
  const [newSize, setNewSize] = useState("");
  const [sizeError, setSizeError] = useState("");

  const navigate = useNavigate();

  // Proceed to Checkout
  const handleProceedToCheckout = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {
      navigate("/login");
      return;
    }

    navigate("/checkout");
  };

  // Save cart whenever cart items change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cartItems]);

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get product stock
  const getProductStock = (item) => {
    const product = products.find((p) => p.id === item.id);
    return product ? product.stock : item.stock || 0;
  };

  // Update quantity using product ID and selected size
  const updateQuantity = (id, selectedSize, change) => {
    setCartItems((previousItems) =>
      previousItems.map((item) => {
        if (item.id === id && (item.selectedSize || "") === selectedSize) {
          const newQuantity = item.quantity + change;
          const stock = getProductStock(item);

          if (newQuantity < 1 || newQuantity > stock) {
            return item;
          }

          return {
            ...item,
            quantity: newQuantity,
          };
        }

        return item;
      }),
    );
  };

  // Remove a specific product and size
  const removeItem = (id, selectedSize) => {
    setCartItems((previousItems) =>
      previousItems.filter(
        (item) =>
          !(item.id === id && (item.selectedSize || "") === selectedSize),
      ),
    );
  };

  // Open Edit Size modal
  const handleEditSize = (item) => {
    setEditingItem(item);
    setNewSize(item.selectedSize || "");
    setSizeError("");
  };

  // Close Edit Size modal
  const handleCloseSizeModal = () => {
    setEditingItem(null);
    setNewSize("");
    setSizeError("");
  };

  // Update selected size
  const handleUpdateSize = () => {
    if (!editingItem || !newSize) {
      setSizeError("Please select a size.");
      return;
    }

    if (newSize === editingItem.selectedSize) {
      handleCloseSizeModal();
      return;
    }

    const stock = getProductStock(editingItem);

    const existingItem = cartItems.find(
      (item) =>
        item.id === editingItem.id && (item.selectedSize || "") === newSize,
    );

    if (existingItem) {
      const combinedQuantity = existingItem.quantity + editingItem.quantity;

      if (combinedQuantity > stock) {
        setSizeError(`Only ${stock} item(s) are available in this product.`);
        return;
      }

      // Merge quantities into the existing size
      setCartItems((previousItems) => {
        const updatedItems = previousItems
          .map((item) => {
            if (
              item.id === editingItem.id &&
              (item.selectedSize || "") === newSize
            ) {
              return {
                ...item,
                quantity: item.quantity + editingItem.quantity,
              };
            }

            return item;
          })
          .filter(
            (item) =>
              !(
                item.id === editingItem.id &&
                (item.selectedSize || "") === (editingItem.selectedSize || "")
              ),
          );

        return updatedItems;
      });
    } else {
      // Change the size of the selected item
      setCartItems((previousItems) =>
        previousItems.map((item) => {
          if (
            item.id === editingItem.id &&
            (item.selectedSize || "") === (editingItem.selectedSize || "")
          ) {
            return {
              ...item,
              selectedSize: newSize,
            };
          }

          return item;
        }),
      );
    }

    handleCloseSizeModal();
  };

  // Order calculations
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // Empty Cart
  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="mb-4 text-6xl">🛒</div>

        <h2 className="text-2xl font-bold text-gray-800">Your Cart is Empty</h2>

        <p className="mt-2 text-center text-gray-500">
          Looks like you haven't added anything to your cart yet.
        </p>

        <Link
          to="/products"
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Page Heading */}
        <h1 className="mb-2 text-3xl font-bold text-gray-800">Shopping Cart</h1>

        <p className="mb-8 text-gray-500">
          You have {totalItems} item(s) in your cart.
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => {
              const availableSizes =
                products.find((p) => p.id === item.id)?.sizes || [];

              return (
                <div
                  key={`${item.id}-${item.selectedSize || "no-size"}`}
                  className="flex flex-col gap-5 rounded-xl bg-white p-5 shadow-sm sm:flex-row"
                >
                  {/* Product Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-32 w-full rounded-lg object-cover sm:w-32"
                  />

                  {/* Product Information */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.category}
                    </p>

                    {/* Selected Size */}
                    {item.selectedSize && (
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <p className="text-sm font-medium text-gray-700">
                          Size:{" "}
                          <span className="font-semibold text-blue-600">
                            {item.selectedSize}
                          </span>
                        </p>

                        {availableSizes.length > 0 && (
                          <button
                            onClick={() => handleEditSize(item)}
                            className="text-sm font-semibold text-blue-600 hover:underline"
                          >
                            Edit Size
                          </button>
                        )}
                      </div>
                    )}

                    {/* Unit Price */}
                    <p className="mt-2 font-bold text-blue-600">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>

                    {/* Quantity Controls */}
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.selectedSize || "", -1)
                        }
                        disabled={item.quantity <= 1}
                        className="h-8 w-8 rounded border hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        -
                      </button>

                      <span className="font-medium">{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.selectedSize || "", 1)
                        }
                        disabled={item.quantity >= getProductStock(item)}
                        className="h-8 w-8 rounded border hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove Item */}
                    <button
                      onClick={() =>
                        removeItem(item.id, item.selectedSize || "")
                      }
                      className="mt-4 text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Item Subtotal */}
                  <div className="font-semibold text-gray-800 sm:text-right">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </div>
                </div>
              );
            })}

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="mt-3 inline-block text-blue-600 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-gray-800">
              Order Summary
            </h2>

            <div className="mb-4 flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="mb-4 flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className="text-green-600">Free</span>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            {localStorage.getItem("isLoggedIn") !== "true" && (
              <div className="mb-4 mt-5 rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-sm font-semibold text-blue-800">
                  Login required to place your order
                </p>

                <p className="mt-1 text-xs text-blue-700">
                  Please log in or create an account before proceeding to
                  checkout.
                </p>
              </div>
            )}

            <button
              onClick={handleProceedToCheckout}
              className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Edit Size Modal */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={handleCloseSizeModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Product Size
                </h2>

                <p className="mt-1 text-sm text-gray-500">{editingItem.name}</p>
              </div>

              <button
                onClick={handleCloseSizeModal}
                className="text-2xl leading-none text-gray-500 hover:text-gray-900"
                aria-label="Close size selection"
              >
                &times;
              </button>
            </div>

            <p className="mt-6 text-sm font-semibold text-gray-700">
              Select New Size
            </p>

            <div className="mt-3 flex flex-wrap gap-3">
              {(products.find((p) => p.id === editingItem.id)?.sizes || []).map(
                (size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setNewSize(size);
                      setSizeError("");
                    }}
                    className={`min-w-12 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                      newSize === size
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white text-gray-800 hover:border-blue-600"
                    }`}
                  >
                    {size}
                  </button>
                ),
              )}
            </div>

            {sizeError && (
              <p className="mt-3 text-sm text-red-600">{sizeError}</p>
            )}

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleCloseSizeModal}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateSize}
                disabled={!newSize}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Update Size
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
