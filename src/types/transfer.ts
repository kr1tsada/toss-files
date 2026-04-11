export interface TransferProgress {
  file_name: string;
  bytes_transferred: number;
  total_bytes: number;
  percentage: number;
  speed_bps: number;
}

export type ErrorKind =
  | "device_offline"
  | "unauthorized"
  | "permission_denied"
  | "file_not_found"
  | "no_space"
  | "cancelled"
  | "unknown";

export interface TransferResult {
  file_name: string;
  success: boolean;
  error: string | null;
  error_kind: ErrorKind | null;
}

/// Human-friendly message for an error kind — shown in toasts/queue rows
export function humanizeError(kind: ErrorKind | null, fallback?: string | null): string {
  switch (kind) {
    case "device_offline":
      return "Device disconnected";
    case "unauthorized":
      return "Device unauthorized — check USB debugging prompt";
    case "permission_denied":
      return "Permission denied";
    case "file_not_found":
      return "File not found";
    case "no_space":
      return "Not enough space";
    case "cancelled":
      return "Cancelled";
    default:
      return fallback || "Transfer failed";
  }
}
