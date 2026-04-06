import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { TransferProgress } from "../types/transfer";

export function onTransferProgress(
  callback: (progress: TransferProgress) => void,
): Promise<UnlistenFn> {
  return listen<TransferProgress>("transfer-progress", (event) => {
    callback(event.payload);
  });
}
