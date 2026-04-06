import { invoke } from "@tauri-apps/api/core";

export async function listDevices(): Promise<string[]> {
  return invoke("list_devices");
}

export async function listFiles(
  deviceId: string,
  path: string,
): Promise<string[]> {
  return invoke("list_files", { deviceId, path });
}

export async function transferFiles(): Promise<string> {
  return invoke("transfer_files");
}
