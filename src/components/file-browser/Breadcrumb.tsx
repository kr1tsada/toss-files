import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const parts = path.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-0.5 overflow-x-auto px-3 py-1.5 text-xs text-neutral-400">
      <button
        onClick={() => onNavigate("/")}
        className="shrink-0 rounded px-1 py-0.5 hover:bg-neutral-800 hover:text-white"
      >
        /
      </button>
      {parts.map((part, i) => {
        const fullPath = "/" + parts.slice(0, i + 1).join("/") + "/";
        return (
          <span key={fullPath} className="flex items-center">
            <ChevronRight size={12} className="shrink-0 text-neutral-600" />
            <button
              onClick={() => onNavigate(fullPath)}
              className="shrink-0 rounded px-1 py-0.5 hover:bg-neutral-800 hover:text-white"
            >
              {part}
            </button>
          </span>
        );
      })}
    </div>
  );
}
