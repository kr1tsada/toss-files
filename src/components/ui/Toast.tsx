import { useEffect } from "react";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  action?: { label: string; onClick: () => void };
  onClose: () => void;
}

export function Toast({
  message,
  type = "info",
  duration = 3000,
  action,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (duration <= 0) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const colors = {
    success: "bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-700",
    error: "bg-red-50 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-700",
    info: "bg-surface-1 text-fg border-edge-2",
  };

  return (
    <div
      className={`fixed bottom-4 right-4 flex max-w-sm items-center gap-3 rounded-lg border px-4 py-2 text-sm shadow-lg ${colors[type]}`}
    >
      <span className="flex-1">{message}</span>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded bg-black/10 px-2 py-0.5 text-xs font-medium hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
        >
          {action.label}
        </button>
      )}
      <button
        onClick={onClose}
        className="text-current opacity-60 hover:opacity-100"
        title="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
