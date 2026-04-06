interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
}

export function Toast({ message, type = "info" }: ToastProps) {
  const colors = {
    success: "bg-green-900 text-green-200",
    error: "bg-red-900 text-red-200",
    info: "bg-neutral-800 text-neutral-200",
  };

  return (
    <div
      className={`fixed bottom-4 right-4 rounded-lg px-4 py-2 text-sm shadow-lg ${colors[type]}`}
    >
      {message}
    </div>
  );
}
