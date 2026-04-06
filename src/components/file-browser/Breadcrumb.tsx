export function Breadcrumb({ path }: { path: string }) {
  const parts = path.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1 px-3 py-2 text-sm text-neutral-400">
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1 text-neutral-600">/</span>}
          <span className="hover:text-white cursor-pointer">{part}</span>
        </span>
      ))}
    </div>
  );
}
