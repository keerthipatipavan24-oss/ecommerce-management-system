import { useState, useEffect } from "react";
import { getSavedProducts, saveProducts } from "../data/productStorage";
import Toast from "../components/Toast";

const categories = ["Electronics", "Men's Clothing", "Footwear", "Accessories"];

export default function AdminProducts() {
  const [products, setProducts] = useState(getSavedProducts);
  const [showForm, setShowForm] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [toast, setToast] = useState("");

  const emptyForm = {
    name: "",
    category: "Electronics",
    price: "",
    image: "",
    description: "",
    rating: "4.0",
    stock: "",
    sizes: "",
    specifications: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Automatically scroll to top
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open Add Product Modal
  const handleAdd = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setShowForm(true);
  };

  // Open Edit Product Modal
  const handleEdit = (product) => {
    setEditingId(product.id);

    setFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      image: product.image,
      description: product.description,
      rating: String(product.rating),
      stock: String(product.stock),
      sizes: product.sizes?.join(", ") || "",
      specifications: Object.entries(product.specifications || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n"),
    });

    setShowForm(true);
  };

  // Add or Update Product
  const handleSubmit = (e) => {
    e.preventDefault();

    const specifications = {};

    formData.specifications
      .split("\n")
      .filter((line) => line.trim())
      .forEach((line) => {
        const separatorIndex = line.indexOf(":");

        if (separatorIndex !== -1) {
          const key = line.slice(0, separatorIndex).trim();
          const value = line.slice(separatorIndex + 1).trim();

          if (key && value) {
            specifications[key] = value;
          }
        }
      });

    const productData = {
      id:
        editingId ??
        (products.length
          ? Math.max(...products.map((product) => Number(product.id))) + 1
          : 1),
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      image: formData.image.trim(),
      description: formData.description.trim(),
      rating: Number(formData.rating),
      stock: Number(formData.stock),
      specifications,
      ...(formData.sizes.trim()
        ? {
            sizes: formData.sizes
              .split(",")
              .map((size) => size.trim())
              .filter(Boolean),
          }
        : {}),
    };

    let updatedProducts;

    if (editingId !== null) {
      updatedProducts = products.map((product) =>
        product.id === editingId ? productData : product,
      );

      setToast("Product updated successfully!");
    } else {
      updatedProducts = [...products, productData];

      setToast("Product added successfully!");
    }

    setProducts(updatedProducts);
    saveProducts(updatedProducts);

    setShowForm(false);
    setFormData({ ...emptyForm });
    setEditingId(null);
  };

  // Open Delete Confirmation Modal
  const handleDeleteClick = (product) => {
    setDeleteProduct(product);
  };

  // Confirm Delete Product
  const handleConfirmDelete = () => {
    if (!deleteProduct) return;

    const updatedProducts = products.filter(
      (product) => product.id !== deleteProduct.id,
    );

    setProducts(updatedProducts);
    saveProducts(updatedProducts);

    setDeleteProduct(null);
    setToast("Product deleted successfully!");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Product Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your SnapCart products.
            </p>
          </div>

          <button
            onClick={handleAdd}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Add Product
          </button>
        </div>

        {/* Product Count and Search */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-lg border bg-white px-5 py-3">
            <p className="text-sm text-gray-500">Total Products</p>

            <p className="text-2xl font-bold text-gray-900">
              {products.length}
            </p>
          </div>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 sm:max-w-xs"
          />
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-gray-100 text-sm text-gray-600">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Stock</th>
                <th className="px-5 py-4">Rating</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />

                      <div>
                        <p className="font-semibold text-gray-800">
                          {product.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          ID: {product.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {product.category}
                  </td>

                  <td className="px-5 py-4 font-medium text-gray-800">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {product.stock}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    ⭐ {product.rating}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewProduct(product)}
                        className="rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-100"
                      >
                        View
                      </button>

                      <button
                        onClick={() => handleEdit(product)}
                        className="rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* View Product Details Modal */}
        {viewProduct && (
          <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Product Details
                </h2>

                <button
                  onClick={() => setViewProduct(null)}
                  className="text-2xl text-gray-500 hover:text-gray-800"
                >
                  &times;
                </button>
              </div>

              <img
                src={viewProduct.image}
                alt={viewProduct.name}
                className="h-56 w-full rounded-xl object-cover"
              />

              <h3 className="mt-4 text-xl font-bold text-gray-900">
                {viewProduct.name}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Product ID: {viewProduct.id}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-semibold text-gray-800">
                    {viewProduct.category}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-semibold text-gray-800">
                    ₹{Number(viewProduct.price).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Stock</p>
                  <p className="font-semibold text-gray-800">
                    {viewProduct.stock}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-semibold text-gray-800">
                    ⭐ {viewProduct.rating}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="mt-1 text-sm leading-6 text-gray-700">
                  {viewProduct.description}
                </p>
              </div>

              {viewProduct.sizes?.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-medium text-gray-500">
                    Available Sizes
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {viewProduct.sizes.map((size) => (
                      <span
                        key={size}
                        className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(viewProduct.specifications || {}).length > 0 && (
                <div className="mt-5">
                  <p className="mb-3 text-sm font-semibold text-gray-800">
                    Specifications
                  </p>

                  <div className="space-y-2">
                    {Object.entries(viewProduct.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between gap-4 border-b border-gray-100 pb-2 text-sm"
                        >
                          <span className="text-gray-500">{key}</span>
                          <span className="text-right font-medium text-gray-800">
                            {value}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => setViewProduct(null)}
                className="mt-6 w-full rounded-lg bg-gray-900 py-3 font-semibold text-white hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Add / Edit Product Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId !== null ? "Edit Product" : "Add New Product"}
                </h2>

                <button
                  type="button"
                  onClick={closeForm}
                  className="text-2xl text-gray-500 hover:text-gray-800"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Product Name
                  </label>

                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Category
                    </label>

                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full rounded-lg border px-3 py-2"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Price (₹)
                    </label>

                    <input
                      required
                      type="number"
                      min="1"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder="Enter price"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Stock
                    </label>

                    <input
                      required
                      type="number"
                      min="0"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder="Enter stock quantity"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Rating
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Image URL
                  </label>

                  <input
                    required
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    required
                    rows="3"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Enter product description"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Sizes (optional)
                  </label>

                  <input
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="S, M, L, XL or 7, 8, 9, 10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Specifications
                  </label>

                  <textarea
                    rows="4"
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder={
                      "Brand: SnapCart\nColour: Black\nMaterial: Cotton"
                    }
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Enter one specification per line using Key: Value.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-lg border px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
                  >
                    {editingId !== null ? "Update Product" : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">
                🗑️
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                Delete Product?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800">
                  {deleteProduct.name}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setDeleteProduct(null)}
                  className="rounded-lg border px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmDelete}
                  className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        <Toast message={toast} type="success" onClose={() => setToast("")} />
      </div>
    </div>
  );
}
