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
import { deleteFiles, createFolder } from "./lib/commands";
import { joinAndroidPath } from "./lib/fileUtils";
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
    onConfirm: () => void;
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
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
    (message: string, type: "success" | "error" | "info" = "info") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  const activeFs = activePanel === "android" ? android : macos;

  // Toolbar handlers
  const handlePull = useCallback(async () => {
    if (!deviceId || android.selectedFiles.length === 0) return;
    const paths = android.selectedFiles.map((f) =>
      joinAndroidPath(android.currentPath, f.name),
    );
    const results = await transfer.pull(deviceId, paths, macos.currentPath, () => {
      macos.fetchFiles(macos.currentPath);
    });
    const failed = results.filter((r) => !r.success);
    if (failed.length === 0) {
      showToast(`Pulled ${results.length} file(s)`, "success");
    } else {
      showToast(`${failed.length} file(s) failed to pull`, "error");
    }
  }, [deviceId, android, macos, transfer, showToast]);

  const handlePush = useCallback(async () => {
    if (!deviceId || macos.selectedFiles.length === 0) return;
    const paths = macos.selectedFiles.map((f) =>
      `${macos.currentPath.replace(/\/$/, "")}/${f.name}`,
    );
    const results = await transfer.push(deviceId, paths, android.currentPath, () => {
      android.fetchFiles(android.currentPath);
    });
    const failed = results.filter((r) => !r.success);
    if (failed.length === 0) {
      showToast(`Pushed ${results.length} file(s)`, "success");
    } else {
      showToast(`${failed.length} file(s) failed to push`, "error");
    }
  }, [deviceId, android, macos, transfer, showToast]);

  const handleDelete = useCallback(() => {
    if (activeFs.selectedFiles.length === 0) return;
    const names = activeFs.selectedFiles.map((f) => f.name);
    setConfirmDialog({
      title: "Delete files",
      message: `Delete ${names.length} item(s)?\n${names.slice(0, 5).join(", ")}${names.length > 5 ? "..." : ""}`,
      onConfirm: async () => {
        setConfirmDialog(null);
        if (activePanel === "android" && deviceId) {
          for (const file of activeFs.selectedFiles) {
            await deleteFiles(deviceId, joinAndroidPath(android.currentPath, file.name));
          }
          android.fetchFiles(android.currentPath);
        }
        showToast(`Deleted ${names.length} item(s)`, "success");
      },
    });
  }, [activeFs, activePanel, deviceId, android, showToast]);

  const handleNewFolder = useCallback(() => {
    const name = prompt("Folder name:");
    if (!name || !deviceId) return;
    createFolder(deviceId, joinAndroidPath(android.currentPath, name)).then(() => {
      android.fetchFiles(android.currentPath);
      showToast(`Created folder: ${name}`, "success");
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
            />
          ) : (
            <DeviceGuide />
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
          />
        </div>
      </div>

      {/* Transfer bar */}
      <TransferBar activeTransfer={transfer.activeTransfer} />

      {/* Transfer queue */}
      <TransferQueue queue={transfer.queue} onClear={transfer.clearQueue} />

      {/* Confirm dialog */}
      {confirmDialog && (
        <ConfirmDialog
          open
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
