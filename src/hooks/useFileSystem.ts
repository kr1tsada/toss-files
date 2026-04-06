import { useState } from "react";
import type { FileEntry } from "../types/file";

export function useFileSystem() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [currentPath, setCurrentPath] = useState("/sdcard/");

  return { files, setFiles, currentPath, setCurrentPath };
}
