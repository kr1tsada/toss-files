import { CheckCircle, XCircle, Loader2, Clock, RotateCw } from "lucide-react";
import type { TransferItem } from "../../hooks/useTransfer";
import { humanizeError } from "../../types/transfer";

interface TransferQueueProps {
  queue: TransferItem[];
  onClear: () => void;
  onRetry?: (itemId: string) => void;
}

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock size={12} className="text-fg-4" />,
  active: <Loader2 size={12} className="animate-spin text-accent-text" />,
  done: <CheckCircle size={12} className="text-green-500" />,
  error: <XCircle size={12} className="text-red-500" />,
};

export function TransferQueue({ queue, onClear, onRetry }: TransferQueueProps) {
  if (queue.length === 0) return null;

  const completed = queue.filter((i) => i.status === "done" || i.status === "error");

  return (
    <div className="border-t border-edge">
      <div className="flex items-center justify-between px-4 py-1.5">
        <span className="text-xs text-fg-4">
          Transfers ({completed.length}/{queue.length})
        </span>
        {completed.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-fg-5 hover:text-fg-3"
          >
            Clear
          </button>
        )}
      </div>
      <div className="max-h-32 overflow-auto">
        {queue.map((item) => {
          const isError = item.status === "error";
          const errMsg = isError
            ? humanizeError(item.result?.error_kind ?? null, item.result?.error)
            : null;
          const canRetry =
            isError && item.result?.error_kind !== "cancelled" && !!onRetry;

          return (
            <div
              key={item.id}
              className="flex items-center gap-2 px-4 py-1 text-xs"
            >
              {statusIcon[item.status]}
              <span className="text-fg-4">
                {item.direction === "pull" ? "←" : "→"}
              </span>
              <span className="min-w-0 flex-1 truncate text-fg-3">
                {item.fileName}
              </span>
              {errMsg && (
                <span
                  className="max-w-[14rem] truncate text-red-500 dark:text-red-400"
                  title={item.result?.error ?? undefined}
                >
                  {errMsg}
                </span>
              )}
              {canRetry && (
                <button
                  onClick={() => onRetry?.(item.id)}
                  className="shrink-0 rounded p-0.5 text-fg-4 hover:bg-surface-2 hover:text-accent-text"
                  title="Retry"
                >
                  <RotateCw size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
