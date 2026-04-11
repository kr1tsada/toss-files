import { useEffect, useCallback, useState, useRef } from "react";
import type { FileEntry, FileSource } from "./types/file";
import { useDevice } from "./hooks/useDevice";
import { useFileSystem } from "./hooks/useFileSystem";
import { useTransfer } from "./hooks/useTransfer";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { DeviceStatus } from "./components/device/DeviceStatus";
import { DeviceGuide } from "./components/device/DeviceGuide";
import { FilePanel } from "./components/file-browser/FilePanel";
import { Toolbar } from "./components/ui/Toolbar";
import { TransferBar } from "./components/transfer/TransferBar";
import { TransferQueue } from "./components/transfer/TransferQueue";
import { ConfirmDialog } from "./components/ui/ConfirmDialog";
import { Toast } from "./components/ui/Toast";
import { ContextMenu, type ContextMenuEntry } from "./components/ui/ContextMenu";
import {
  Download,
  Upload,
  Trash2,
  FolderPlus,
  RefreshCw,
} from "lucide-react";
import { deleteFiles, createFolder } from "./lib/commands";
import { joinAndroidPath } from "./lib/fileUtils";
import { humanizeError } from "./types/transfer";
import { APP_NAME } from "./constants";

export function App() {
  const device = useDevice();
  const deviceId = device.selectedDevice?.id ?? null;
  const isConnected = device.selectedDevice?.state === "Connected";

  const android = useFileSystem("android", deviceId);
  const macos = useFileSystem("macos", null);
  const transfer = useTransfer();

  const [activePanel, setActivePanel] = useState<FileSource>("android");
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    destructive?: boolean;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    action?: { label: string; onClick: () => void };
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuEntry[];
  } | null>(null);

  // Drag state
  const dragDataRef = useRef<{
    files: FileEntry[];
    source: FileSource;
  } | null>(null);

  // Auto-fetch on device connect
  useEffect(() => {
    if (isConnected && deviceId) {
      android.fetchFiles(android.currentPath);
    }
  }, [isConnected, deviceId]);

  // Fetch macOS files on mount
  useEffect(() => {
    macos.fetchFiles(macos.currentPath);
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "info" = "info",
      action?: { label: string; onClick: () => void },
    ) => {
      setToast({ message, type, action });
    },
    [],
  );

  const dismissToast = useCallback(() => setToast(null), []);

  // Detect device disconnect mid-transfer
  const wasConnectedRef = useRef(isConnected);
  useEffect(() => {
    if (wasConnectedRef.current && !isConnected && transfer.isTransferring) {
      showToast("Device disconnected during transfer", "error");
      transfer.cancel();
    }
    wasConnectedRef.current = isConnected;
  }, [isConnected, transfer, showToast]);

  const activeFs = activePanel === "android" ? android : macos;

  const reportTransferResults = useCallback(
    (direction: "pull" | "push", results: { success: boolean; error_kind: string | null; error: string | null }[]) => {
      const failed = results.filter((r) => !r.success);
      if (failed.length === 0) {
        showToast(
          `${direction === "pull" ? "Pulled" : "Pushed"} ${results.length} file(s)`,
          "success",
        );
        return;
      }
      const firstKind = (failed[0].error_kind ?? null) as
        | null
        | "device_offline"
        | "unauthorized"
        | "permission_denied"
        | "file_not_found"
        | "no_space"
        | "cancelled"
        | "unknown";
      const msg =
        failed.length === 1
          ? humanizeError(firstKind, failed[0].error)
          : `${failed.length} file(s) failed — ${humanizeError(firstKind, failed[0].error)}`;
      showToast(msg, "error");
    },
    [showToast],
  );

  // Primitive actions — accept explicit files to avoid stale selection state
  const doPull = useCallback(
    async (files: FileEntry[]) => {
      if (!deviceId || files.length === 0) return;
      const paths = files.map((f) => joinAndroidPath(android.currentPath, f.name));
      const results = await transfer.pull(deviceId, paths, macos.currentPath, () => {
        macos.fetchFiles(macos.currentPath);
      });
      reportTransferResults("pull", results);
    },
    [deviceId, android.currentPath, macos, transfer, reportTransferResults],
  );

  const doPush = useCallback(
    async (files: FileEntry[]) => {
      if (!deviceId || files.length === 0) return;
      const paths = files.map(
        (f) => `${macos.currentPath.replace(/\/$/, "")}/${f.name}`,
      );
      const results = await transfer.push(deviceId, paths, android.currentPath, () => {
        android.fetchFiles(android.currentPath);
      });
      reportTransferResults("push", results);
    },
    [deviceId, macos.currentPath, android, transfer, reportTransferResults],
  );

  // Toolbar handlers — use current selection
  const handlePull = useCallback(
    () => doPull(android.selectedFiles),
    [doPull, android.selectedFiles],
  );

  const handlePush = useCallback(
    () => doPush(macos.selectedFiles),
    [doPush, macos.selectedFiles],
  );

  const handleRetry = useCallback(
    (itemId: string) => {
      transfer.retry(itemId, () => {
        android.fetchFiles(android.currentPath);
        macos.fetchFiles(macos.currentPath);
      });
    },
    [transfer, android, macos],
  );

  const doDelete = useCallback(
    (files: FileEntry[], panelSource: FileSource) => {
      if (files.length === 0) return;
      const names = files.map((f) => f.name);
      setConfirmDialog({
        title: "Delete files",
        message: `Delete ${names.length} item(s)?\n${names.slice(0, 5).join(", ")}${names.length > 5 ? "..." : ""}`,
        destructive: true,
        confirmLabel: "Delete",
        onConfirm: async () => {
          setConfirmDialog(null);
          if (panelSource !== "android" || !deviceId) {
            showToast("Delete is only supported on Android side", "info");
            return;
          }
          const failed: string[] = [];
          for (const file of files) {
            try {
              await deleteFiles(deviceId, joinAndroidPath(android.currentPath, file.name));
            } catch (e) {
              failed.push(`${file.name}: ${String(e)}`);
            }
          }
          android.fetchFiles(android.currentPath);
          if (failed.length === 0) {
            showToast(`Deleted ${names.length} item(s)`, "success");
          } else {
            showToast(
              `${failed.length}/${names.length} failed to delete`,
              "error",
            );
          }
        },
      });
    },
    [deviceId, android, showToast],
  );

  const handleDelete = useCallback(
    () => doDelete(activeFs.selectedFiles, activePanel),
    [doDelete, activeFs.selectedFiles, activePanel],
  );

  const handleNewFolder = useCallback(() => {
    const name = prompt("Folder name:");
    if (!name || !deviceId) return;
    createFolder(deviceId, joinAndroidPath(android.currentPath, name))
      .then(() => {
        android.fetchFiles(android.currentPath);
        showToast(`Created folder: ${name}`, "success");
      })
      .catch((e) => {
        showToast(`Failed to create folder: ${String(e)}`, "error");
      });
  }, [deviceId, android, showToast]);

  const handleRefresh = useCallback(() => {
    android.fetchFiles(android.currentPath);
    macos.fetchFiles(macos.currentPath);
    device.refresh();
  }, [android, macos, device]);

  // Drag & drop between panels
  const handleDragStart = useCallback((files: FileEntry[], source: FileSource) => {
    dragDataRef.current = { files, source };
  }, []);

  const handleDrop = useCallback(
    (targetPath: string) => {
      const data = dragDataRef.current;
      if (!data || !deviceId) return;
      dragDataRef.current = null;

      if (data.source === "android") {
        // Dragged from Android → macOS (pull)
        const paths = data.files.map((f) =>
          joinAndroidPath(android.currentPath, f.name),
        );
        transfer.pull(deviceId, paths, targetPath, () => {
          macos.fetchFiles(macos.currentPath);
        });
      } else {
        // Dragged from macOS → Android (push)
        const paths = data.files.map((f) =>
          `${macos.currentPath.replace(/\/$/, "")}/${f.name}`,
        );
        transfer.push(deviceId, paths, targetPath, () => {
          android.fetchFiles(android.currentPath);
        });
      }
    },
    [deviceId, android, macos, transfer],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, panelSource: FileSource, target: FileEntry | null) => {
      e.preventDefault();
      setActivePanel(panelSource);

      const panel = panelSource === "android" ? android : macos;

      // Determine which files this menu should act on.
      // If right-clicked a file that's part of the existing selection → use whole selection.
      // If right-clicked a file that's NOT in selection → act only on that file.
      // If right-clicked empty area → act on current selection.
      const contextFiles: FileEntry[] = target
        ? panel.selected.has(target.name) && panel.selectedFiles.length > 0
          ? panel.selectedFiles
          : [target]
        : panel.selectedFiles;

      const hasFiles = contextFiles.length > 0;
      const isAndroid = panelSource === "android";
      const canTransfer = isConnected && hasFiles;

      const items: ContextMenuEntry[] = [];

      if (isAndroid) {
        items.push({
          label: `Pull to Mac${hasFiles ? ` (${contextFiles.length})` : ""}`,
          icon: <Download size={14} />,
          disabled: !canTransfer,
          onClick: () => doPull(contextFiles),
        });
      } else {
        items.push({
          label: `Push to Android${hasFiles ? ` (${contextFiles.length})` : ""}`,
          icon: <Upload size={14} />,
          disabled: !canTransfer,
          onClick: () => doPush(contextFiles),
        });
      }

      if (isAndroid) {
        items.push(
          { separator: true },
          {
            label: "New Folder",
            icon: <FolderPlus size={14} />,
            disabled: !isConnected,
            onClick: handleNewFolder,
          },
          {
            label: "Delete",
            icon: <Trash2 size={14} />,
            shortcut: "⌫",
            disabled: !hasFiles || !isConnected,
            destructive: true,
            onClick: () => doDelete(contextFiles, panelSource),
          },
        );
      }

      items.push(
        { separator: true },
        {
          label: "Refresh",
          icon: <RefreshCw size={14} />,
          shortcut: "⌘R",
          onClick: handleRefresh,
        },
      );

      setContextMenu({ x: e.clientX, y: e.clientY, items });
    },
    [
      android,
      macos,
      isConnected,
      doPull,
      doPush,
      doDelete,
      handleNewFolder,
      handleRefresh,
    ],
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSelectAll: activeFs.selectAll,
    onDelete: handleDelete,
    onRefresh: handleRefresh,
    onNavigateUp: activeFs.navigateUp,
    onEscape: activeFs.clearSelection,
  });

  // Resizable panels
  const [dividerX, setDividerX] = useState(50); // percentage
  const isDraggingDivider = useRef(false);

  const handleDividerMouseDown = useCallback(() => {
    isDraggingDivider.current = true;
    const onMove = (e: MouseEvent) => {
      if (!isDraggingDivider.current) return;
      const pct = (e.clientX / window.innerWidth) * 100;
      setDividerX(Math.max(25, Math.min(75, pct)));
    };
    const onUp = () => {
      isDraggingDivider.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-neutral-950 text-white">
      {/* Title bar area */}
      <div className="flex items-center justify-center border-b border-neutral-800 py-1.5" data-tauri-drag-region>
        <span className="text-xs font-medium text-neutral-500">{APP_NAME}</span>
      </div>

      {/* Device status */}
      <DeviceStatus
        devices={device.devices}
        selectedDevice={device.selectedDevice}
        onSelect={device.setSelectedDevice}
        onRefresh={device.refresh}
        loading={device.loading}
      />

      {/* Toolbar */}
      <Toolbar
        onPull={handlePull}
        onPush={handlePush}
        onDelete={handleDelete}
        onNewFolder={handleNewFolder}
        onRefresh={handleRefresh}
        hasDevice={isConnected}
        hasSelection={activeFs.selectedFiles.length > 0}
        isTransferring={transfer.isTransferring}
      />

      {/* Two-panel file browser */}
      <div className="flex min-h-0 flex-1">
        {/* Android panel */}
        <div
          className="relative flex flex-col overflow-hidden"
          style={{ width: `${dividerX}%` }}
          onClick={() => setActivePanel("android")}
        >
          {isConnected ? (
            <FilePanel
              title="Android"
              source="android"
              files={android.files}
              currentPath={android.currentPath}
              selected={android.selected}
              loading={android.loading}
              error={android.error}
              sortKey={android.sortKey}
              sortDir={android.sortDir}
              onNavigate={android.navigate}
              onNavigateUp={android.navigateUp}
              onNavigateTo={android.navigateTo}
              onToggleSelect={android.toggleSelect}
              onSelectRange={android.selectRange}
              onSort={android.setSort}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              dragOver={false}
              onContextMenu={handleContextMenu}
            />
          ) : (
            <DeviceGuide
              reason={
                device.selectedDevice?.state === "Unauthorized"
                  ? "unauthorized"
                  : "no_device"
              }
            />
          )}
        </div>

        {/* Resizable divider */}
        <div
          className="w-1 cursor-col-resize bg-neutral-800 hover:bg-blue-600 active:bg-blue-500"
          onMouseDown={handleDividerMouseDown}
        />

        {/* macOS panel */}
        <div
          className="relative flex flex-1 flex-col overflow-hidden"
          onClick={() => setActivePanel("macos")}
        >
          <FilePanel
            title="macOS"
            source="macos"
            files={macos.files}
            currentPath={macos.currentPath}
            selected={macos.selected}
            loading={macos.loading}
            error={macos.error}
            sortKey={macos.sortKey}
            sortDir={macos.sortDir}
            onNavigate={macos.navigate}
            onNavigateUp={macos.navigateUp}
            onNavigateTo={macos.navigateTo}
            onToggleSelect={macos.toggleSelect}
            onSelectRange={macos.selectRange}
            onSort={macos.setSort}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            dragOver={false}
            onContextMenu={handleContextMenu}
          />
        </div>
      </div>

      {/* Transfer bar */}
      <TransferBar activeTransfer={transfer.activeTransfer} onCancel={transfer.cancel} />

      {/* Transfer queue */}
      <TransferQueue
        queue={transfer.queue}
        onClear={transfer.clearQueue}
        onRetry={handleRetry}
      />

      {/* Confirm dialog */}
      {confirmDialog && (
        <ConfirmDialog
          open
          title={confirmDialog.title}
          message={confirmDialog.message}
          destructive={confirmDialog.destructive}
          confirmLabel={confirmDialog.confirmLabel}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          action={toast.action}
          onClose={dismissToast}
        />
      )}
    </div>
  );
}
