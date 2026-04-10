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

  const pull = useCallback(
    async (
      deviceId: string,
      remotePaths: string[],
      localDir: string,
      onComplete?: () => void,
    ) => {
      setIsTransferring(true);
      const results: TransferResult[] = [];

      for (const remotePath of remotePaths) {
        const fileName = remotePath.split("/").pop() ?? remotePath;
        const item: TransferItem = {
          id: `pull-${Date.now()}-${fileName}`,
          fileName,
          direction: "pull",
          status: "active",
        };
        setActiveTransfer(item);
        setQueue((q) => [...q, item]);

        const result = await pullFiles(deviceId, remotePath, `${localDir.replace(/\/$/, "")}/${fileName}`);
        results.push(result);

        setQueue((q) =>
          q.map((i) =>
            i.id === item.id
              ? { ...i, status: result.success ? "done" : "error", result }
              : i,
          ),
        );
      }

      setActiveTransfer(null);
      setIsTransferring(false);
      onComplete?.();
      return results;
    },
    [],
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

      for (const localPath of localPaths) {
        const fileName = localPath.split("/").pop() ?? localPath;
        const item: TransferItem = {
          id: `push-${Date.now()}-${fileName}`,
          fileName,
          direction: "push",
          status: "active",
        };
        setActiveTransfer(item);
        setQueue((q) => [...q, item]);

        const result = await pushFiles(deviceId, localPath, `${remoteDir.replace(/\/$/, "")}/${fileName}`);
        results.push(result);

        setQueue((q) =>
          q.map((i) =>
            i.id === item.id
              ? { ...i, status: result.success ? "done" : "error", result }
              : i,
          ),
        );
      }

      setActiveTransfer(null);
      setIsTransferring(false);
      onComplete?.();
      return results;
    },
    [],
  );

  const cancel = useCallback(async () => {
    await cancelTransfer();
    setActiveTransfer((prev) =>
      prev ? { ...prev, status: "error", result: { file_name: prev.fileName, success: false, error: "Cancelled" } } : null,
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
    cancel,
    clearQueue,
  };
}

export type { TransferItem };
