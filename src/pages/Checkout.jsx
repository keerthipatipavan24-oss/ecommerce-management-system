import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  const [savedUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  const [formData, setFormData] = useState({
    name: savedUser.name || "",
    email: savedUser.email || "",
    phone: savedUser.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [paymentData, setPaymentData] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
  });

  const [showCvv, setShowCvv] = useState(false);
  const [errors, setErrors] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  // Remove an item from Checkout and update the saved cart
  const handleRemoveItem = (id, selectedSize = "") => {
    const updatedCart = cartItems.filter(
      (item) => !(item.id === id && (item.selectedSize || "") === selectedSize),
    );

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const deliveryCharge = 0;
  const totalAmount = subtotal + deliveryCharge;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handlePaymentChange = (event) => {
    const { name, value } = event.target;

    setPaymentData({
      ...paymentData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);

    setErrors({
      ...errors,
      payment: "",
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      upiId: "",
    });
  };

  const handlePlaceOrder = (event) => {
    event.preventDefault();
    if (localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }

    const newErrors = {};

    // Delivery validation

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Delivery address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Enter a valid 6-digit PIN code";
    }

    if (cartItems.length === 0) {
      newErrors.cart = "Your cart is empty";
    }

    // Payment validation

    if (paymentMethod === "UPI") {
      if (!/^[\w.-]+@[\w.-]+$/.test(paymentData.upiId.trim())) {
        newErrors.upiId = "Enter a valid UPI ID";
      }
    }

    if (paymentMethod === "Debit Card" || paymentMethod === "Credit Card") {
      if (!paymentData.cardName.trim()) {
        newErrors.cardName = "Cardholder name is required";
      }

      const cardNumber = paymentData.cardNumber.replace(/\s/g, "");

      if (!/^\d{16}$/.test(cardNumber)) {
        newErrors.cardNumber = "Enter a valid 16-digit card number";
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.expiryDate)) {
        newErrors.expiryDate = "Enter expiry date in MM/YY format";
      } else {
        const [month, year] = paymentData.expiryDate.split("/").map(Number);

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        if (
          year < currentYear ||
          (year === currentYear && month < currentMonth)
        ) {
          newErrors.expiryDate = "Card has expired";
        }
      }

      if (!/^\d{3,4}$/.test(paymentData.cvv)) {
        newErrors.cvv = "Enter a valid 3 or 4-digit CVV";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const orderId = `ORD${Date.now().toString().slice(-8)}`;

    const newOrder = {
      id: orderId,
      date: new Date().toISOString().split("T")[0],
      items: cartItems.reduce((total, item) => total + item.quantity, 0),
      products: cartItems.map((item) => ({ ...item })),
      total: totalAmount,
      status: "Processing",
      customer: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      },
      address: {
        street: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      },
      paymentMethod,
    };

    let existingOrders = [];

    try {
      existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    } catch {
      existingOrders = [];
    }

    localStorage.setItem(
      "orders",
      JSON.stringify([newOrder, ...existingOrders]),
    );

    localStorage.setItem("cart", JSON.stringify([]));

    window.dispatchEvent(new Event("cartUpdated"));

    setPlacedOrder(newOrder);
    setOrderPlaced(true);

    // Scroll to top after successful order placement
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Order success page

  if (orderPlaced && placedOrder) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-gray-50 px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">
            ✓
          </div>

          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            Order Placed Successfully!
          </h1>

          <p className="mt-3 text-gray-500">
            Thank you for shopping with SnapCart. Your order has been confirmed.
          </p>

          <div className="mt-6 rounded-xl bg-gray-50 p-5 text-left">
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Order ID</span>
              <span className="font-semibold text-gray-900">
                {placedOrder.id}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-3">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-semibold text-gray-900">
                ₹{placedOrder.total.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-3">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-semibold text-gray-900">
                {placedOrder.paymentMethod}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-3">
              <span className="text-gray-500">Order Status</span>
              <span className="font-semibold text-green-600">
                {placedOrder.status}
              </span>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/orders")}
              className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              View My Orders
            </button>

            <button
              onClick={() => navigate("/products")}
              className="flex-1 rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart page

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h1>

        <p className="mt-2 text-gray-500">
          Add some products before proceeding to checkout.
        </p>

        <Link
          to="/products"
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

          <p className="mt-2 text-gray-500">
            Complete your delivery details and place your order.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Delivery Information */}

            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-900">
                  1. Delivery Information
                </h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Mobile Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      House / Street Address
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter house number, street and area"
                      rows="3"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      State
                    </label>

                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Enter state"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    {errors.state && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      PIN Code
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      maxLength={6}
                      placeholder="Enter 6-digit PIN code"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    {errors.pincode && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-bold text-gray-900">
                  2. Payment Method
                </h2>

                <div className="space-y-3">
                  {[
                    {
                      value: "UPI",
                      label: "UPI",
                      description: "Pay using UPI",
                      icon: "📱",
                    },
                    {
                      value: "Debit Card",
                      label: "Debit Card",
                      description: "Pay using your debit card",
                      icon: "💳",
                    },
                    {
                      value: "Credit Card",
                      label: "Credit Card",
                      description: "Pay using your credit card",
                      icon: "💳",
                    },
                    {
                      value: "COD",
                      label: "Cash on Delivery",
                      description: "Pay when your order arrives",
                      icon: "💵",
                    },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                        paymentMethod === method.value
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={() => handlePaymentMethodChange(method.value)}
                        className="h-4 w-4 accent-blue-600"
                      />

                      <span className="text-2xl">{method.icon}</span>

                      <span>
                        <span className="block font-semibold text-gray-900">
                          {method.label}
                        </span>

                        <span className="text-sm text-gray-500">
                          {method.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>

                {/* UPI Details */}

                {paymentMethod === "UPI" && (
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      UPI ID
                    </label>

                    <input
                      type="text"
                      name="upiId"
                      value={paymentData.upiId}
                      onChange={handlePaymentChange}
                      placeholder="example@upi"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    {errors.upiId && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.upiId}
                      </p>
                    )}
                  </div>
                )}

                {/* Card Details */}

                {(paymentMethod === "Debit Card" ||
                  paymentMethod === "Credit Card") && (
                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Cardholder Name
                      </label>

                      <input
                        type="text"
                        name="cardName"
                        value={paymentData.cardName}
                        onChange={handlePaymentChange}
                        placeholder="Name on card"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                      />

                      {errors.cardName && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.cardName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Card Number
                      </label>

                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={(event) => {
                          const value = event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 16);

                          setPaymentData({
                            ...paymentData,
                            cardNumber: value,
                          });

                          setErrors({
                            ...errors,
                            cardNumber: "",
                          });
                        }}
                        maxLength={16}
                        placeholder="Enter 16-digit card number"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                      />

                      {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Expiry Date
                        </label>

                        <input
                          type="text"
                          name="expiryDate"
                          placeholder="MM/YY"
                          maxLength="5"
                          value={paymentData.expiryDate}
                          className="w-full rounded-xl border border-gray-300 px-4 py-4 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          onChange={(e) => {
                            let value = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);

                            if (value.length > 2) {
                              value = value.slice(0, 2) + "/" + value.slice(2);
                            }

                            handlePaymentChange({
                              target: {
                                name: "expiryDate",
                                value,
                              },
                            });
                          }}
                        />

                        {errors.expiryDate && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.expiryDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          CVV
                        </label>

                        <input
                          type={showCvv ? "text" : "password"}
                          name="cvv"
                          value={paymentData.cvv}
                          onChange={(event) => {
                            const value = event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);

                            setPaymentData({
                              ...paymentData,
                              cvv: value,
                            });

                            setErrors({
                              ...errors,
                              cvv: "",
                            });
                          }}
                          maxLength={4}
                          placeholder="CVV"
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                        />

                        {errors.cvv && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.cvv}
                          </p>
                        )}
                      </div>
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={showCvv}
                        onChange={(event) => setShowCvv(event.target.checked)}
                        className="h-4 w-4 accent-blue-600"
                      />
                      Show CVV
                    </label>
                  </div>
                )}

                <p className="mt-5 text-xs text-gray-500">
                  Demo checkout only. No actual payment will be processed. Never
                  enter real card or UPI credentials.
                </p>
              </div>
            </div>

            {/* Order Summary */}

            <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                3. Order Summary
              </h2>

              <div className="space-y-5">
                {cartItems.map((item, index) => (
                  <div
                    key={`${item.id}-${item.selectedSize || ""}-${index}`}
                    className="flex gap-4 border-b border-gray-100 pb-5"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg bg-gray-100 object-contain"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>

                      {item.selectedSize && (
                        <p className="mt-1 text-sm text-gray-500">
                          Size: {item.selectedSize}
                        </p>
                      )}

                      <p className="mt-1 text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>

                      <p className="mt-2 font-semibold text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveItem(item.id, item.selectedSize || "")
                        }
                        className="mt-2 text-sm font-medium text-red-500 hover:text-red-700 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Charge</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">
                      Total Amount
                    </span>

                    <span className="text-xl font-bold text-gray-900">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Place Order
              </button>

              <Link
                to="/cart"
                className="mt-4 block text-center text-sm font-medium text-blue-600 hover:underline"
              >
                Back to Cart
              </Link>

              <p className="mt-4 text-center text-xs text-gray-400">
                Your order details will be saved in SnapCart.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
