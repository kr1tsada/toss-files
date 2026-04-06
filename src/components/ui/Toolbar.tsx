export function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-neutral-800 px-3 py-2">
      {children}
    </div>
  );
}
