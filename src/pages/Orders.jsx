import { useEffect, useState } from "react";
import Toast from "../components/Toast";

const getSavedOrders = () => {
  try {
    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    return Array.isArray(savedOrders) ? savedOrders : [];
  } catch {
    return [];
  }
};

export default function Orders() {
  const [orders, setOrders] = useState(getSavedOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setOrders(getSavedOrders());
  }, []);

  const saveOrders = (updatedOrders) => {
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    if (selectedOrder) {
      const updatedSelectedOrder = updatedOrders.find(
        (order) => order.id === selectedOrder.id,
      );

      setSelectedOrder(updatedSelectedOrder || null);
    }
  };

  const [toast, setToast] = useState({
    message: "",
    type: "success",
  });

  const handleCancelOrder = (orderId) => {
    setCancelOrderId(orderId);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = () => {
    const updatedOrders = orders.map((order) =>
      order.id === cancelOrderId && order.status === "Processing"
        ? { ...order, status: "Cancelled" }
        : order,
    );

    saveOrders(updatedOrders);

    setShowCancelModal(false);
    setCancelOrderId(null);

    setToast({
      message: "Order cancelled successfully!",
      type: "success",
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = String(order.id || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim());

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered",
  ).length;

  const totalOrderValue = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const statusColors = {
    Delivered: "bg-green-100 text-green-700",
    Shipped: "bg-blue-100 text-blue-700",
    Processing: "bg-yellow-100 text-yellow-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
      <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
              My Orders
            </h1>
            <p className="mt-2 text-gray-600">
              Track and manage your shopping orders.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <h2 className="mt-3 text-3xl font-bold text-gray-900">
                {orders.length}
              </h2>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Delivered Orders
              </p>
              <h2 className="mt-3 text-3xl font-bold text-green-600">
                {deliveredOrders}
              </h2>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
              <p className="text-sm font-medium text-gray-500">
                Total Order Value
              </p>
              <h2 className="mt-3 text-3xl font-bold text-gray-900">
                ₹{totalOrderValue.toLocaleString("en-IN")}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Excludes cancelled orders
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by order ID..."
              aria-label="Search orders by order ID"
              className="w-full flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter orders by status"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Order History
              </h2>
              <span className="text-sm text-gray-500">
                {filteredOrders.length} orders
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Order ID</th>
                    <th className="px-6 py-4 font-semibold">Order Date</th>
                    <th className="px-6 py-4 font-semibold">Items</th>
                    <th className="px-6 py-4 font-semibold">Total</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-5 font-semibold text-blue-600">
                        {order.id}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-600">
                        {formatDate(order.date)}
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-600">
                        {order.items}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm font-semibold text-gray-900">
                        ₹{Number(order.total || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            statusColors[order.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-sm font-semibold text-blue-600 hover:underline"
                          >
                            View
                          </button>

                          {order.status === "Processing" && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-sm font-semibold text-red-600 hover:underline"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <h3 className="text-base font-semibold text-gray-800">
                          {orders.length === 0
                            ? "No orders yet"
                            : "No orders found"}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                          {orders.length === 0
                            ? "Your placed orders will appear here."
                            : "Try another order ID or change the status filter."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Details Modal */}
          {selectedOrder && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
              onClick={() => setSelectedOrder(null)}
            >
              <div
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8"
                onClick={(event) => event.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Order Details
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Order ID: {selectedOrder.id}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(null)}
                    aria-label="Close order details"
                    className="rounded-lg px-3 py-1 text-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  >
                    &times;
                  </button>
                </div>

                {/* Order Information */}
                <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">
                  <div>
                    <p className="text-xs text-gray-500">Order Date</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {formatDate(selectedOrder.date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Order Status</p>
                    <span
                      className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        statusColors[selectedOrder.status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {selectedOrder.paymentMethod || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="mt-1 font-bold text-gray-900">
                      ₹
                      {Number(selectedOrder.total || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Ordered Products */}
                <div className="mt-7">
                  <h3 className="text-lg font-bold text-gray-900">
                    Ordered Products
                  </h3>

                  <div className="mt-4 space-y-4">
                    {selectedOrder.products?.length > 0 ? (
                      selectedOrder.products.map((product, index) => (
                        <div
                          key={`${product.id}-${index}`}
                          className="flex gap-4 rounded-xl border border-gray-100 p-4"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-20 w-20 rounded-lg bg-gray-50 object-contain"
                          />

                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {product.name}
                            </h4>

                            {product.selectedSize && (
                              <p className="mt-1 text-sm text-gray-500">
                                Size: {product.selectedSize}
                              </p>
                            )}

                            <p className="mt-1 text-sm text-gray-500">
                              Quantity: {product.quantity}
                            </p>

                            <p className="mt-2 font-semibold text-gray-900">
                              ₹
                              {(
                                Number(product.price || 0) *
                                Number(product.quantity || 0)
                              ).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        Product details are not available for this order.
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="mt-7">
                  <h3 className="text-lg font-bold text-gray-900">
                    Customer Information
                  </h3>

                  <div className="mt-3 space-y-2 rounded-xl border border-gray-100 p-4 text-sm">
                    <p>
                      <span className="text-gray-500">Name: </span>
                      <span className="font-medium text-gray-900">
                        {selectedOrder.customer?.name || "-"}
                      </span>
                    </p>

                    <p>
                      <span className="text-gray-500">Email: </span>
                      <span className="font-medium text-gray-900">
                        {selectedOrder.customer?.email || "-"}
                      </span>
                    </p>

                    <p>
                      <span className="text-gray-500">Mobile: </span>
                      <span className="font-medium text-gray-900">
                        {selectedOrder.customer?.phone || "-"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mt-7">
                  <h3 className="text-lg font-bold text-gray-900">
                    Delivery Address
                  </h3>

                  <div className="mt-3 rounded-xl border border-gray-100 p-4 text-sm leading-6 text-gray-700">
                    <p className="font-semibold text-gray-900">
                      {selectedOrder.customer?.name || ""}
                    </p>

                    <p>{selectedOrder.address?.street || "-"}</p>

                    <p>
                      {[
                        selectedOrder.address?.city,
                        selectedOrder.address?.state,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                    <p>PIN Code: {selectedOrder.address?.pincode || "-"}</p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  {selectedOrder.status === "Processing" && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      className="flex-1 rounded-lg bg-red-50 px-5 py-3 font-semibold text-red-600 hover:bg-red-100"
                    >
                      Cancel Order
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showCancelModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
              !
            </div>

            <h2 className="mt-4 text-center text-xl font-bold text-gray-900">
              Cancel Order?
            </h2>

            <p className="mt-2 text-center text-sm text-gray-500">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelOrderId(null);
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Keep Order
              </button>

              <button
                onClick={confirmCancelOrder}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
