import { invoke } from "@tauri-apps/api/core";
import type { Device } from "../types/device";
import type { FileEntry } from "../types/file";
import type { TransferResult } from "../types/transfer";

export async function listDevices(): Promise<Device[]> {
  return invoke("list_devices");
}

export async function listFiles(
  deviceId: string,
  path: string,
): Promise<FileEntry[]> {
  return invoke("list_files", { deviceId, path });
}

export async function deleteFiles(
  deviceId: string,
  path: string,
): Promise<void> {
  return invoke("delete_files", { deviceId, path });
}

export async function createFolder(
  deviceId: string,
  path: string,
): Promise<void> {
  return invoke("create_folder", { deviceId, path });
}

export async function pullFiles(
  deviceId: string,
  remotePath: string,
  localPath: string,
): Promise<TransferResult> {
  return invoke("pull_files", { deviceId, remotePath, localPath });
}

export async function pushFiles(
  deviceId: string,
  localPath: string,
  remotePath: string,
): Promise<TransferResult> {
  return invoke("push_files", { deviceId, localPath, remotePath });
}
