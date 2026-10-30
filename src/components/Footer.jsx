import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Link to="/" className="text-2xl font-bold text-blue-400">
            SnapCart
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-gray-400">
            Discover great products at great prices. Your everyday shopping,
            made simple.
          </p>
        </div>
        {/* navigation links */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/" className="transition hover:text-blue-400">
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className="transition hover:text-blue-400">
                Products
              </Link>
            </li>

            <li>
              <Link to="/categories" className="transition hover:text-blue-400">
                Categories
              </Link>
            </li>

            <li>
              <Link to="/orders" className="transition hover:text-blue-400">
                Orders
              </Link>
            </li>
          </ul>
        </div>

        {/* contact information */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">Contact Us</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>Email: support@snapcart.com</li>
            <li>Customer Support: Mon-Sat</li>
            <li>Online Shopping: 24/7</li>
          </ul>
        </div>
          </div>
          <div className="border-t border-gray-700 px-6 py-5 text-center text-sm text-gray-400">© {new Date().getFullYear()} SnapCart. All rights reserved.</div>
    </footer>
  );
}
