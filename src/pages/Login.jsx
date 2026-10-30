import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Toast from "../components/Toast";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
      login: "",
    });
  };

  const handleLogin = (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    let savedUser = null;

    try {
      savedUser = JSON.parse(localStorage.getItem("user"));
    } catch {
      savedUser = null;
    }

    if (!savedUser) {
      setErrors({
        login: "Account not found. Please register first.",
      });
      return;
    }

    if (
      savedUser.email?.toLowerCase() !== formData.email.trim().toLowerCase() ||
      savedUser.password !== formData.password
    ) {
      setErrors({
        login: "Invalid email or password. Please try again.",
      });
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    window.dispatchEvent(new Event("authUpdated"));

    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }

    const redirectTo = location.state?.from || "/";

    navigate(redirectTo, {
        replace: true,
        state: {
            loginSuccess: "Login successfull",
        }
    });
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to continue shopping with SnapCart
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {errors.login && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {errors.login}
            </p>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-20 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              Remember Me
            </label>

            <Link
              to="/forgot-password"
              className="font-medium text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
      <Toast message={toast} type="success" onClose={() => setToast("")} />
    </div>
  );
}
