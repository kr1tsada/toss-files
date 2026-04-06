import { useEffect } from "react";

interface ShortcutHandlers {
  onSelectAll?: () => void;
  onDelete?: () => void;
  onRefresh?: () => void;
  onNavigateUp?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "a") {
        e.preventDefault();
        handlers.onSelectAll?.();
      } else if (e.key === "Delete" || e.key === "Backspace" && e.metaKey) {
        e.preventDefault();
        handlers.onDelete?.();
      } else if (e.metaKey && e.key === "r") {
        e.preventDefault();
        handlers.onRefresh?.();
      } else if (e.key === "Escape") {
        handlers.onEscape?.();
      } else if (e.metaKey && e.key === "ArrowUp") {
        e.preventDefault();
        handlers.onNavigateUp?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
