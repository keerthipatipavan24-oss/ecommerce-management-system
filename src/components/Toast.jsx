import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const styles = {
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-yellow-500",
    info: "bg-blue-600",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "!",
    info: "i",
  };

  return (
    <div className="fixed right-5 top-5 z-[100] animate-in slide-in-from-right duration-300">
      <div
        role="status"
        className={`flex min-w-[280px] items-center gap-3 rounded-xl px-5 py-4 text-white shadow-lg ${styles[type] || styles.success}`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 font-bold">
          {icons[type] || icons.success}
        </span>

        <p className="flex-1 text-sm font-medium">{message}</p>

        <button
          onClick={onClose}
          className="text-lg text-white/80 hover:text-white"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
