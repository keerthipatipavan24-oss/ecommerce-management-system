import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
      reset: "",
    });
  };

  const handleResetPassword = (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const resetEmail = sessionStorage.getItem("resetEmail");

    if (!resetEmail) {
      setErrors({
        reset: "Please verify your email through Forgot Password first.",
      });
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
      savedUser.email?.toLowerCase() !== resetEmail.toLowerCase()
    ) {
      setErrors({
        reset: "Account not found. Please try again.",
      });
      return;
    }

    if (savedUser.password !== formData.currentPassword) {
      setErrors({
        currentPassword: "Current password is incorrect",
      });
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setErrors({
        newPassword: "New password must be different from current password",
      });
      return;
    }

    const updatedUser = {
      ...savedUser,
      password: formData.newPassword,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    sessionStorage.removeItem("resetEmail");

    navigate("/login", {
      state: {
        message: "Password reset successfully. Please login.",
      },
    });
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>

          <p className="mt-2 text-sm text-gray-500">
            Verify your current password and create a new one.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5">
          {errors.reset && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {errors.reset}
            </p>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Current Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errors.currentPassword}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              New Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            Show Password
          </label>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Reset Password
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
