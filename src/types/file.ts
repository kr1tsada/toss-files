export interface FileEntry {
  name: string;
  is_dir: boolean;
  size: number;
  modified: string;
  permissions: string;
}

export type FileSource = "android" | "macos";
