import { FolderOpen } from "lucide-react";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-neutral-500">
      <FolderOpen size={32} className="text-neutral-700" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
