import { useState } from "react";
import type { TransferProgress } from "../types/transfer";

export function useTransfer() {
  const [progress, setProgress] = useState<TransferProgress | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  return { progress, setProgress, isTransferring, setIsTransferring };
}
