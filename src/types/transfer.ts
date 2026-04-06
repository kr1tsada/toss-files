export interface TransferProgress {
  fileName: string;
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export interface TransferResult {
  fileName: string;
  success: boolean;
  error: string | null;
}
