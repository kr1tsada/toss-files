import { useState, useCallback, useEffect } from "react";
import type { TransferProgress, TransferResult } from "../types/transfer";
import { pullFiles, pushFiles, cancelTransfer } from "../lib/commands";
import { onTransferProgress } from "../lib/events";

interface TransferItem {
  id: string;
  fileName: string;
  direction: "pull" | "push";
  status: "pending" | "active" | "done" | "error";
  progress?: TransferProgress;
  result?: TransferResult;
  sourcePath: string;
  targetPath: string;
  deviceId: string;
}

function errorResult(fileName: string, message: string): TransferResult {
  return {
    file_name: fileName,
    success: false,
    error: message,
    error_kind: "unknown",
  };
}

export function useTransfer() {
  const [queue, setQueue] = useState<TransferItem[]>([]);
  const [activeTransfer, setActiveTransfer] = useState<TransferItem | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    const unlisten = onTransferProgress((progress) => {
      setActiveTransfer((prev) =>
        prev ? { ...prev, progress } : null,
      );
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const runOne = useCallback(
    async (item: TransferItem): Promise<TransferResult> => {
      try {
        const result =
          item.direction === "pull"
            ? await pullFiles(item.deviceId, item.sourcePath, item.targetPath)
            : await pushFiles(item.deviceId, item.sourcePath, item.targetPath);
        return result;
      } catch (e) {
        return errorResult(item.fileName, String(e));
      }
    },
    [],
  );

  const pull = useCallback(
    async (
      deviceId: string,
      remotePaths: string[],
      localDir: string,
      onComplete?: () => void,
    ) => {
      setIsTransferring(true);
      const results: TransferResult[] = [];

      try {
        for (const remotePath of remotePaths) {
          const fileName = remotePath.split("/").pop() ?? remotePath;
          const item: TransferItem = {
            id: `pull-${Date.now()}-${fileName}`,
            fileName,
            direction: "pull",
            status: "active",
            sourcePath: remotePath,
            targetPath: `${localDir.replace(/\/$/, "")}/${fileName}`,
            deviceId,
          };
          setActiveTransfer(item);
          setQueue((q) => [...q, item]);

          const result = await runOne(item);
          results.push(result);

          setQueue((q) =>
            q.map((i) =>
              i.id === item.id
                ? { ...i, status: result.success ? "done" : "error", result }
                : i,
            ),
          );
        }
      } finally {
        setActiveTransfer(null);
        setIsTransferring(false);
        onComplete?.();
      }
      return results;
    },
    [runOne],
  );

  const push = useCallback(
    async (
      deviceId: string,
      localPaths: string[],
      remoteDir: string,
      onComplete?: () => void,
    ) => {
      setIsTransferring(true);
      const results: TransferResult[] = [];

      try {
        for (const localPath of localPaths) {
          const fileName = localPath.split("/").pop() ?? localPath;
          const item: TransferItem = {
            id: `push-${Date.now()}-${fileName}`,
            fileName,
            direction: "push",
            status: "active",
            sourcePath: localPath,
            targetPath: `${remoteDir.replace(/\/$/, "")}/${fileName}`,
            deviceId,
          };
          setActiveTransfer(item);
          setQueue((q) => [...q, item]);

          const result = await runOne(item);
          results.push(result);

          setQueue((q) =>
            q.map((i) =>
              i.id === item.id
                ? { ...i, status: result.success ? "done" : "error", result }
                : i,
            ),
          );
        }
      } finally {
        setActiveTransfer(null);
        setIsTransferring(false);
        onComplete?.();
      }
      return results;
    },
    [runOne],
  );

  const retry = useCallback(
    async (itemId: string, onComplete?: () => void) => {
      const original = queue.find((i) => i.id === itemId);
      if (!original) return;

      const retryItem: TransferItem = {
        ...original,
        id: `${original.direction}-${Date.now()}-${original.fileName}`,
        status: "active",
        progress: undefined,
        result: undefined,
      };

      setIsTransferring(true);
      setActiveTransfer(retryItem);
      setQueue((q) => [...q, retryItem]);

      try {
        const result = await runOne(retryItem);
        setQueue((q) =>
          q.map((i) =>
            i.id === retryItem.id
              ? { ...i, status: result.success ? "done" : "error", result }
              : i,
          ),
        );
        return result;
      } finally {
        setActiveTransfer(null);
        setIsTransferring(false);
        onComplete?.();
      }
    },
    [queue, runOne],
  );

  const cancel = useCallback(async () => {
    try {
      await cancelTransfer();
    } catch {
      // ignore — cancel is best-effort
    }
    setActiveTransfer((prev) =>
      prev
        ? {
            ...prev,
            status: "error",
            result: {
              file_name: prev.fileName,
              success: false,
              error: "Cancelled",
              error_kind: "cancelled",
            },
          }
        : null,
    );
    setIsTransferring(false);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue((q) => q.filter((i) => i.status === "active" || i.status === "pending"));
  }, []);

  return {
    queue,
    activeTransfer,
    isTransferring,
    pull,
    push,
    retry,
    cancel,
    clearQueue,
  };
}

export type { TransferItem };
