import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }

    let savedUser = null;

    try {
      savedUser = JSON.parse(localStorage.getItem("user"));
    } catch {
      savedUser = null;
    }

    if (
      !savedUser ||
      savedUser.email.toLowerCase() !== email.trim().toLowerCase()
    ) {
      setError("Account not found. Please register first.");
      setSuccess("");
      return;
    }

    setError("");

    sessionStorage.setItem("resetEmail", savedUser.email);

    navigate("/reset-password");
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>

          <p className="mt-2 text-sm text-gray-500">
            Enter your registered email address to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </p>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
                setSuccess("");
              }}
              placeholder="Enter your registered email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Continue
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
