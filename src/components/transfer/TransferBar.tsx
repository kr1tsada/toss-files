import { X } from "lucide-react";
import type { TransferItem } from "../../hooks/useTransfer";
import { formatFileSize, formatSpeed } from "../../lib/fileUtils";

interface TransferBarProps {
  activeTransfer: TransferItem | null;
  onCancel?: () => void;
}

export function TransferBar({ activeTransfer, onCancel }: TransferBarProps) {
  if (!activeTransfer) return null;

  const progress = activeTransfer.progress;
  const percentage = progress?.percentage ?? 0;
  const dirLabel = activeTransfer.direction === "pull" ? "Pulling" : "Pushing";

  return (
    <div className="border-t border-edge px-4 py-2">
      <div className="flex items-center gap-3 text-xs">
        <span className="text-fg-3">{dirLabel}:</span>
        <span className="min-w-0 flex-1 truncate text-fg-2">
          {activeTransfer.fileName}
        </span>
        {progress && (
          <>
            <span className="shrink-0 text-fg-3">
              {formatFileSize(progress.bytes_transferred)} / {formatFileSize(progress.total_bytes)}
            </span>
            {progress.speed_bps > 0 && (
              <span className="shrink-0 text-fg-4">
                {formatSpeed(progress.speed_bps)}
              </span>
            )}
          </>
        )}
        <span className="shrink-0 font-medium text-accent-text">
          {Math.round(percentage)}%
        </span>
        {onCancel && (
          <button
            onClick={onCancel}
            className="shrink-0 rounded p-0.5 text-fg-4 hover:bg-surface-2 hover:text-red-500 dark:hover:text-red-400"
            title="Cancel transfer"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
