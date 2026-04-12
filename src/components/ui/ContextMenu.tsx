import { useEffect, useLayoutEffect, useRef, useState } from "react";

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separator?: false;
}

export interface ContextMenuSeparator {
  separator: true;
}

export type ContextMenuEntry = ContextMenuItem | ContextMenuSeparator;

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuEntry[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  // Reposition if menu would overflow viewport
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let nx = x;
    let ny = y;
    if (x + rect.width > window.innerWidth) nx = window.innerWidth - rect.width - 4;
    if (y + rect.height > window.innerHeight) ny = window.innerHeight - rect.height - 4;
    setPos({ x: nx, y: ny });
  }, [x, y]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[11rem] rounded-md border border-edge-2 bg-surface-1 py-1 text-sm shadow-2xl"
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) => {
        if ("separator" in item && item.separator) {
          return <div key={i} className="my-1 h-px bg-edge" />;
        }
        const entry = item as ContextMenuItem;
        const textClass = entry.disabled
          ? "text-fg-5 cursor-default"
          : entry.destructive
            ? "text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300"
            : "text-fg-2 hover:bg-surface-2 hover:text-fg";
        return (
          <button
            key={i}
            disabled={entry.disabled}
            onClick={() => {
              if (entry.disabled) return;
              entry.onClick();
              onClose();
            }}
            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left ${textClass}`}
          >
            {entry.icon && <span className="shrink-0">{entry.icon}</span>}
            <span className="flex-1">{entry.label}</span>
            {entry.shortcut && (
              <span className="shrink-0 text-xs text-fg-4">{entry.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
