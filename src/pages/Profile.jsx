import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true",
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  const [showEdit, setShowEdit] = useState(false);

  const [editData, setEditData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
  });

  // Get actual orders belonging to the logged-in user
  const recentOrders = (() => {
    try {
      const orders = JSON.parse(localStorage.getItem("orders")) || [];

      return orders
        .filter(
          (order) =>
            order.customer?.email?.toLowerCase() === user.email?.toLowerCase(),
        )
        .slice(0, 3);
    } catch {
      return [];
    }
  })();

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditData({
      ...editData,
      [name]: value,
    });
  };

  const handleSaveProfile = (event) => {
    event.preventDefault();

    const updatedUser = {
      ...user,
      ...editData,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setShowEdit(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("rememberMe");
    setIsLoggedIn(false);
    navigate("/login");
  };

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to SnapCart!
          </h1>

          <p className="mt-3 text-gray-500">
            Please login or create an account to view your profile.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/login"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg border border-blue-600 px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

          <p className="mt-2 text-gray-500">
            Manage your account and personal information.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm md:col-span-1">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
                {(user.name || "U").charAt(0).toUpperCase()}
              </div>

              <h2 className="mt-4 text-xl font-bold text-gray-900">
                {user.name || "User"}
              </h2>

              <p className="mt-1 break-all text-sm text-gray-500">
                {user.email || "No email available"}
              </p>

              <span className="mt-3 rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
                Active Account
              </span>
            </div>

            <button
              onClick={() => setShowEdit(true)}
              className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Edit Profile
            </button>

            <button
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg border border-red-500 py-3 font-semibold text-red-500 hover:bg-red-50"
            >
              Logout
            </button>
          </div>

          <div className="space-y-6 md:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                Personal Information
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {user.name || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="mt-1 break-all font-medium text-gray-900">
                    {user.email || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {user.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {user.address || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Orders
                </h2>

                <Link
                  to="/orders"
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  View All
                </Link>
              </div>

              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.id}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {order.date
                            ? new Date(
                                `${order.date}T00:00:00`,
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "Date unavailable"}
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          ₹{Number(order.total || 0).toLocaleString("en-IN")}
                        </p>

                        <p
                          className={`mt-1 text-sm font-medium ${
                            order.status === "Delivered"
                              ? "text-green-600"
                              : order.status === "Cancelled"
                                ? "text-red-600"
                                : "text-blue-600"
                          }`}
                        >
                          {order.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-4xl">📦</p>

                  <h3 className="mt-3 font-semibold text-gray-900">
                    No Orders Yet
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Your recent orders will appear here after you place an
                    order.
                  </p>

                  <Link
                    to="/products"
                    className="mt-4 inline-block font-semibold text-blue-600 hover:underline"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                Edit Profile
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleEditChange}
                    placeholder="Enter phone number"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={editData.address}
                    onChange={handleEditChange}
                    placeholder="Enter your address"
                    rows="3"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    Save Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
                    className="flex-1 rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
