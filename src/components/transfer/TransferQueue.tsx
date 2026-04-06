import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import type { TransferItem } from "../../hooks/useTransfer";

interface TransferQueueProps {
  queue: TransferItem[];
  onClear: () => void;
}

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock size={12} className="text-neutral-500" />,
  active: <Loader2 size={12} className="animate-spin text-blue-400" />,
  done: <CheckCircle size={12} className="text-green-500" />,
  error: <XCircle size={12} className="text-red-500" />,
};

export function TransferQueue({ queue, onClear }: TransferQueueProps) {
  if (queue.length === 0) return null;

  const completed = queue.filter((i) => i.status === "done" || i.status === "error");

  return (
    <div className="border-t border-neutral-800">
      <div className="flex items-center justify-between px-4 py-1.5">
        <span className="text-xs text-neutral-500">
          Transfers ({completed.length}/{queue.length})
        </span>
        {completed.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-neutral-600 hover:text-neutral-400"
          >
            Clear
          </button>
        )}
      </div>
      <div className="max-h-32 overflow-auto">
        {queue.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 px-4 py-1 text-xs"
          >
            {statusIcon[item.status]}
            <span className="text-neutral-500">
              {item.direction === "pull" ? "←" : "→"}
            </span>
            <span className="min-w-0 flex-1 truncate text-neutral-400">
              {item.fileName}
            </span>
            {item.result?.error && (
              <span className="truncate text-red-400">{item.result.error}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
