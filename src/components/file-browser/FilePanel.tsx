export function FilePanel({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col border border-neutral-800 rounded-lg">
      <div className="border-b border-neutral-800 px-3 py-2 text-sm font-medium text-neutral-300">
        {title}
      </div>
      <div className="flex-1 p-4 text-sm text-neutral-500">
        No files
      </div>
    </div>
  );
}
