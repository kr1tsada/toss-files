import type { TransferItem } from "../../hooks/useTransfer";
import { formatFileSize, formatSpeed } from "../../lib/fileUtils";

interface TransferBarProps {
  activeTransfer: TransferItem | null;
}

export function TransferBar({ activeTransfer }: TransferBarProps) {
  if (!activeTransfer) return null;

  const progress = activeTransfer.progress;
  const percentage = progress?.percentage ?? 0;
  const dirLabel = activeTransfer.direction === "pull" ? "Pulling" : "Pushing";

  return (
    <div className="border-t border-neutral-800 px-4 py-2">
      <div className="flex items-center gap-3 text-xs">
        <span className="text-neutral-400">{dirLabel}:</span>
        <span className="min-w-0 flex-1 truncate text-neutral-200">
          {activeTransfer.fileName}
        </span>
        {progress && (
          <>
            <span className="shrink-0 text-neutral-400">
              {formatFileSize(progress.bytes_transferred)} / {formatFileSize(progress.total_bytes)}
            </span>
            <span className="shrink-0 text-neutral-500">
              {formatSpeed(progress.speed_bps)}
            </span>
          </>
        )}
        <span className="shrink-0 font-medium text-blue-400">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
