import { useRef, useCallback, useEffect, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowUp, Loader2 } from "lucide-react";
import type { FileEntry, FileSource } from "../../types/file";
import { FileRow } from "./FileRow";
import { Breadcrumb } from "./Breadcrumb";
import { EmptyState } from "./EmptyState";

interface FilePanelProps {
  title: string;
  source: FileSource;
  files: FileEntry[];
  currentPath: string;
  selected: Set<string>;
  loading: boolean;
  error: string | null;
  sortKey: string;
  sortDir: string;
  onNavigate: (folderName: string) => void;
  onNavigateUp: () => void;
  onNavigateTo: (path: string) => void;
  onToggleSelect: (name: string, multi: boolean) => void;
  onSelectRange: (name: string) => void;
  onSort: (key: "name" | "size" | "modified") => void;
  onDragStart: (files: FileEntry[], source: FileSource) => void;
  onDrop: (targetPath: string) => void;
  dragOver: boolean;
}

const ROW_HEIGHT = 30;

export function FilePanel({
  title,
  source,
  files,
  currentPath,
  selected,
  loading,
  error,
  sortKey,
  sortDir,
  onNavigate,
  onNavigateUp,
  onNavigateTo,
  onToggleSelect,
  onSelectRange,
  onSort,
  onDragStart,
  onDrop,
  dragOver,
}: FilePanelProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [isDragTarget, setIsDragTarget] = useState(false);

  const virtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const handleClick = useCallback(
    (file: FileEntry, e: React.MouseEvent) => {
      if (e.shiftKey) {
        onSelectRange(file.name);
      } else {
        onToggleSelect(file.name, e.metaKey);
      }
    },
    [onToggleSelect, onSelectRange],
  );

  const handleDoubleClick = useCallback(
    (file: FileEntry) => {
      if (file.is_dir) {
        onNavigate(file.name);
      }
    },
    [onNavigate],
  );

  const handleDragStart = useCallback(
    (file: FileEntry, e: React.DragEvent) => {
      const draggedFiles = selected.has(file.name)
        ? files.filter((f) => selected.has(f.name))
        : [file];
      e.dataTransfer.setData("text/plain", JSON.stringify(draggedFiles.map((f) => f.name)));
      onDragStart(draggedFiles, source);
    },
    [files, selected, onDragStart, source],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragTarget(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragTarget(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragTarget(false);
      onDrop(currentPath);
    },
    [onDrop, currentPath],
  );

  // Reset the list virtualizer when files change
  useEffect(() => {
    virtualizer.scrollToIndex(0);
  }, [currentPath]);

  const sortArrow = (key: string) => {
    if (sortKey !== key) return null;
    return <span className="text-blue-400">{sortDir === "asc" ? " ↑" : " ↓"}</span>;
  };

  const showDragOverlay = isDragTarget || dragOver;

  return (
    <div
      className={`flex flex-1 flex-col overflow-hidden ${
        showDragOverlay ? "ring-2 ring-blue-500/50 ring-inset" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          {title}
        </span>
        <button
          onClick={onNavigateUp}
          className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-white"
          title="Go up"
        >
          <ArrowUp size={13} />
        </button>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb path={currentPath} onNavigate={onNavigateTo} />

      {/* Sort header */}
      <div className="flex items-center border-b border-neutral-800/50 px-3 py-1 text-[11px] text-neutral-600">
        <button className="flex-1 text-left hover:text-neutral-400" onClick={() => onSort("name")}>
          Name{sortArrow("name")}
        </button>
        <button className="w-28 text-right hover:text-neutral-400" onClick={() => onSort("modified")}>
          Modified{sortArrow("modified")}
        </button>
        <button className="w-16 text-right hover:text-neutral-400" onClick={() => onSort("size")}>
          Size{sortArrow("size")}
        </button>
      </div>

      {/* File list */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 size={20} className="animate-spin text-neutral-600" />
        </div>
      ) : error ? (
        <EmptyState message={error} />
      ) : files.length === 0 ? (
        <EmptyState message="Empty folder" />
      ) : (
        <div ref={parentRef} className="flex-1 overflow-auto">
          <div
            style={{ height: virtualizer.getTotalSize(), position: "relative" }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const file = files[virtualRow.index];
              return (
                <div
                  key={file.name}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <FileRow
                    file={file}
                    selected={selected.has(file.name)}
                    onClick={(e) => handleClick(file, e)}
                    onDoubleClick={() => handleDoubleClick(file)}
                    onDragStart={(e) => handleDragStart(file, e)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Drag overlay */}
      {showDragOverlay && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-blue-500/5">
          <span className="rounded-lg bg-blue-600/80 px-4 py-2 text-sm font-medium text-white shadow-lg">
            Drop here
          </span>
        </div>
      )}
    </div>
  );
}
