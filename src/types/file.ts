export interface FileEntry {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  modified: string | null;
}

export type FileSource = "android" | "macos";
