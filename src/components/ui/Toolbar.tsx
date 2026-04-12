import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Trash2,
  FolderPlus,
  RefreshCw,
} from "lucide-react";

interface ToolbarProps {
  onPull: () => void;
  onPush: () => void;
  onDelete: () => void;
  onNewFolder: () => void;
  onRefresh: () => void;
  hasDevice: boolean;
  hasSelection: boolean;
  isTransferring: boolean;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

function ToolbarButton({ icon, label, onClick, disabled, danger }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        danger
          ? "text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
          : "text-fg-3 hover:bg-surface-2 hover:text-fg"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function Toolbar({
  onPull,
  onPush,
  onDelete,
  onNewFolder,
  onRefresh,
  hasDevice,
  hasSelection,
  isTransferring,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 border-b border-edge px-3 py-1.5">
      <ToolbarButton
        icon={<ArrowDownToLine size={14} />}
        label="Pull to Mac"
        onClick={onPull}
        disabled={!hasDevice || !hasSelection || isTransferring}
      />
      <ToolbarButton
        icon={<ArrowUpFromLine size={14} />}
        label="Push to Android"
        onClick={onPush}
        disabled={!hasDevice || !hasSelection || isTransferring}
      />
      <div className="mx-1 h-4 w-px bg-edge" />
      <ToolbarButton
        icon={<Trash2 size={14} />}
        label="Delete"
        onClick={onDelete}
        disabled={!hasSelection || isTransferring}
        danger
      />
      <ToolbarButton
        icon={<FolderPlus size={14} />}
        label="New Folder"
        onClick={onNewFolder}
        disabled={!hasDevice}
      />
      <div className="flex-1" />
      <ToolbarButton
        icon={<RefreshCw size={14} />}
        label="Refresh"
        onClick={onRefresh}
      />
    </div>
  );
}
