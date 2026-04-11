import {
  Folder,
  Image,
  Video,
  Music,
  FileText,
  Archive,
  FileCode,
  File,
} from "lucide-react";
import type { FileEntry } from "../../types/file";
import { formatFileSize, formatDate, getFileIcon } from "../../lib/fileUtils";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  folder: Folder,
  image: Image,
  video: Video,
  music: Music,
  "file-text": FileText,
  archive: Archive,
  "file-code": FileCode,
  file: File,
};

interface FileRowProps {
  file: FileEntry;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function FileRow({
  file,
  selected,
  onClick,
  onDoubleClick,
  onDragStart,
  onContextMenu,
}: FileRowProps) {
  const iconType = getFileIcon(file.name, file.is_dir);
  const Icon = iconMap[iconType] ?? File;

  return (
    <div
      className={`flex cursor-default select-none items-center gap-2 px-3 py-1 text-sm ${
        selected
          ? "bg-blue-600/20 text-white"
          : "text-neutral-300 hover:bg-neutral-800/60"
      }`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      draggable
      onDragStart={onDragStart}
    >
      <Icon
        size={15}
        className={file.is_dir ? "shrink-0 text-blue-400" : "shrink-0 text-neutral-500"}
      />
      <span className="min-w-0 flex-1 truncate">{file.name}</span>
      <span className="w-28 shrink-0 text-right text-xs text-neutral-600">
        {formatDate(file.modified)}
      </span>
      {!file.is_dir ? (
        <span className="w-16 shrink-0 text-right text-xs text-neutral-600">
          {formatFileSize(file.size)}
        </span>
      ) : (
        <span className="w-16 shrink-0" />
      )}
    </div>
  );
}
