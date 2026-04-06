export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-1 items-center justify-center text-sm text-neutral-500">
      {message}
    </div>
  );
}
