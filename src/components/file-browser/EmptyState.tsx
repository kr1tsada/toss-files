import { FolderOpen } from "lucide-react";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-fg-4">
      <FolderOpen size={32} className="text-fg-5" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
