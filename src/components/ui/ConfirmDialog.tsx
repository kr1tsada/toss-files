import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  const confirmClass = destructive
    ? "bg-red-600 hover:bg-red-500"
    : "bg-blue-600 hover:bg-blue-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="w-80 rounded-lg bg-neutral-900 p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-400">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded px-3 py-1.5 text-sm text-neutral-400 hover:bg-neutral-800"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded px-3 py-1.5 text-sm text-white ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
