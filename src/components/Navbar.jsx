import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Toast from "./Toast";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true",
  );

  const [cartCount, setCartCount] = useState(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      return savedCart.reduce((total, item) => total + item.quantity, 0);
    } catch {
      return 0;
    }
  });

  // Cart count synchronization
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const total = savedCart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  // Login/logout synchronization
  useEffect(() => {
    const updateLoginStatus = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    window.addEventListener("authUpdated", updateLoginStatus);

    return () => {
      window.removeEventListener("authUpdated", updateLoginStatus);
    };
  }, []);

  // Show login success toast after navigation
  useEffect(() => {
    if (location.state?.loginSuccess) {
      setToast(location.state.loginSuccess);

      navigate(location.pathname + location.search, {
        replace: true,
        state: null,
      });
    }
  }, [location, navigate]);

  const linkClass = ({ isActive }) =>
    isActive ? "font-semibold text-blue-400" : "transition hover:text-blue-400";

  const closeMenu = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("rememberMe");

    setIsLoggedIn(false);
    setProfileOpen(false);
    setMenuOpen(false);

    window.dispatchEvent(new Event("authUpdated"));

    setToast("Logged out successfully!");
  };

  // Login navigation - remember current page
  const handleLogin = () => {
    const currentPage = location.pathname + location.search;

    closeMenu();

    navigate("/login", {
      state: {
        from: currentPage,
      },
    });
  };

  // Profile dropdown content
  const profileLinks = (
    <>
      <NavLink
        to="/admin/products"
        onClick={closeMenu}
        className="block px-4 py-3 text-sm hover:bg-gray-700 hover:text-blue-400"
      >
        ⚙️ Admin Panel
      </NavLink>

      <NavLink
        to="/profile"
        onClick={closeMenu}
        className="block px-4 py-3 text-sm hover:bg-gray-700 hover:text-blue-400"
      >
        👤 My Profile
      </NavLink>

      {isLoggedIn && (
        <NavLink
          to="/orders"
          onClick={closeMenu}
          className="block px-4 py-3 text-sm hover:bg-gray-700 hover:text-blue-400"
        >
          📦 My Orders
        </NavLink>
      )}

      <div className="my-1 border-t border-gray-700" />

      {isLoggedIn ? (
        <button
          type="button"
          onClick={handleLogout}
          className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-gray-700"
        >
          🚪 Logout
        </button>
      ) : (
        <button
          type="button"
          onClick={handleLogin}
          className="w-full px-4 py-3 text-left text-sm hover:bg-gray-700 hover:text-blue-400"
        >
          🔑 Login
        </button>
      )}
    </>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gray-900 text-white shadow-md">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-4">
          {/* Left: Logo */}
          <NavLink
            to="/"
            onClick={closeMenu}
            className="w-fit text-2xl font-bold text-blue-400"
          >
            SnapCart
          </NavLink>

          {/* Centre: Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>

            <NavLink to="/products" className={linkClass}>
              Products
            </NavLink>

            <NavLink to="/categories" className={linkClass}>
              Categories
            </NavLink>

            <NavLink to="/orders" className={linkClass}>
              Orders
            </NavLink>
          </div>

          {/* Right: Cart and Profile */}
          <div className="hidden items-center justify-end gap-6 md:flex">
            {/* Cart */}
            <NavLink
              to="/cart"
              aria-label={`Shopping cart with ${cartCount} items`}
              className={linkClass}
            >
              <span className="relative inline-block text-xl">
                🛒
                {cartCount > 0 && (
                  <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </span>
            </NavLink>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                className="flex items-center gap-2 transition hover:text-blue-400"
              >
                <span>Profile</span>
                <span className="text-sm">{profileOpen ? "▲" : "▼"}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-10 w-48 overflow-hidden rounded-lg border border-gray-700 bg-gray-800 py-2 shadow-xl">
                  {profileLinks}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="col-start-3 ml-auto flex flex-col gap-1.5 md:hidden"
          >
            <span
              className={`h-0.5 w-7 rounded bg-white transition-all ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />

            <span
              className={`h-0.5 w-7 rounded bg-white transition-all ${
                menuOpen ? "opacity-0" : ""
              }`}
            />

            <span
              className={`h-0.5 w-7 rounded bg-white transition-all ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="border-t border-gray-700 bg-gray-900 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-5">
              <NavLink to="/" onClick={closeMenu} className={linkClass}>
                Home
              </NavLink>

              <NavLink to="/products" onClick={closeMenu} className={linkClass}>
                Products
              </NavLink>

              <NavLink
                to="/categories"
                onClick={closeMenu}
                className={linkClass}
              >
                Categories
              </NavLink>

              <NavLink to="/orders" onClick={closeMenu} className={linkClass}>
                Orders
              </NavLink>

              <NavLink to="/cart" onClick={closeMenu} className={linkClass}>
                🛒 Cart
                {cartCount > 0 && (
                  <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                    {cartCount}
                  </span>
                )}
              </NavLink>

              {/* Mobile Profile Dropdown */}
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                className="flex items-center justify-between text-left hover:text-blue-400"
              >
                <span>👤 Profile</span>
                <span>{profileOpen ? "▲" : "▼"}</span>
              </button>

              {profileOpen && (
                <div className="ml-4 flex flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
                  {profileLinks}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Success Toast */}
      <Toast message={toast} type="success" onClose={() => setToast("")} />
    </>
  );
}
