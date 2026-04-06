export interface TransferProgress {
  file_name: string;
  bytes_transferred: number;
  total_bytes: number;
  percentage: number;
  speed_bps: number;
}

export interface TransferResult {
  file_name: string;
  success: boolean;
  error: string | null;
}
