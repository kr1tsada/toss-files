import type { FileEntry } from "../../types/file";

export function FileRow({ file }: { file: FileEntry }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-neutral-800">
      <span>{file.is_dir ? "📁" : "📄"}</span>
      <span className="truncate">{file.name}</span>
    </div>
  );
}
