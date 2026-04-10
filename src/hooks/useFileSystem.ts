import { useState, useCallback } from "react";
import type { FileEntry, FileSource } from "../types/file";
import { listFiles, listLocalFiles } from "../lib/commands";
import { joinAndroidPath } from "../lib/fileUtils";
import { DEFAULT_ANDROID_PATH, DEFAULT_MACOS_PATH } from "../constants";

type SortKey = "name" | "size" | "modified";
type SortDir = "asc" | "desc";

export function useFileSystem(source: FileSource, deviceId: string | null) {
  const defaultPath = source === "android" ? DEFAULT_ANDROID_PATH : DEFAULT_MACOS_PATH;
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [currentPath, setCurrentPath] = useState(defaultPath);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const fetchFiles = useCallback(
    async (path: string) => {
      setLoading(true);
      setError(null);
      try {
        let result: FileEntry[];
        if (source === "android") {
          if (!deviceId) {
            setFiles([]);
            return;
          }
          result = await listFiles(deviceId, path);
        } else {
          result = await listLocalFiles(path);
        }
        setFiles(result);
        setCurrentPath(path);
        setSelected(new Set());
      } catch (e) {
        setError(String(e));
        setFiles([]);
      } finally {
        setLoading(false);
      }
    },
    [source, deviceId],
  );

  const navigate = useCallback(
    (folderName: string) => {
      const newPath =
        source === "android"
          ? joinAndroidPath(currentPath, folderName, "/")
          : `${currentPath.replace(/\/$/, "")}/${folderName}/`;
      fetchFiles(newPath);
    },
    [source, currentPath, fetchFiles],
  );

  const navigateUp = useCallback(() => {
    const parts = currentPath.replace(/\/$/, "").split("/").filter(Boolean);
    if (parts.length <= 1) return;
    parts.pop();
    const newPath = source === "android" ? `/${parts.join("/")}/` : `${parts.join("/")}/`;
    fetchFiles(newPath);
  }, [source, currentPath, fetchFiles]);

  const navigateTo = useCallback(
    (path: string) => {
      fetchFiles(path);
    },
    [fetchFiles],
  );

  const toggleSelect = useCallback(
    (name: string, multi: boolean) => {
      setSelected((prev) => {
        const next = new Set(multi ? prev : []);
        if (next.has(name)) {
          next.delete(name);
        } else {
          next.add(name);
        }
        return next;
      });
    },
    [],
  );

  const selectRange = useCallback(
    (name: string) => {
      if (selected.size === 0) {
        setSelected(new Set([name]));
        return;
      }
      const lastSelected = [...selected].pop()!;
      const startIdx = files.findIndex((f) => f.name === lastSelected);
      const endIdx = files.findIndex((f) => f.name === name);
      if (startIdx === -1 || endIdx === -1) return;
      const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
      const range = files.slice(from, to + 1).map((f) => f.name);
      setSelected(new Set([...selected, ...range]));
    },
    [files, selected],
  );

  const selectAll = useCallback(() => {
    setSelected(new Set(files.map((f) => f.name)));
  }, [files]);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const sortedFiles = [...files].sort((a, b) => {
    // Folders first always
    if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1;
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name") return a.name.localeCompare(b.name) * mul;
    if (sortKey === "size") return (a.size - b.size) * mul;
    // modified: unix timestamp string (macOS) or "YYYY-MM-DD HH:MM" (Android)
    const toTime = (m: string) => {
      const n = Number(m);
      return Number.isNaN(n) ? new Date(m).getTime() : n * 1000;
    };
    return (toTime(a.modified) - toTime(b.modified)) * mul;
  });

  const setSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey],
  );

  const selectedFiles = files.filter((f) => selected.has(f.name));

  return {
    files: sortedFiles,
    currentPath,
    selected,
    selectedFiles,
    loading,
    error,
    sortKey,
    sortDir,
    fetchFiles,
    navigate,
    navigateUp,
    navigateTo,
    toggleSelect,
    selectRange,
    selectAll,
    clearSelection,
    setSort,
  };
}
