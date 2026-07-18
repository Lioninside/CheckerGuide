import { useEffect } from "react";

interface ArrowKeyNavigationOptions {
  enabled?: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function useArrowKeyNavigation({
  enabled = true,
  onBack,
  onNext,
}: ArrowKeyNavigationOptions): void {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const listener = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        onNext();
      }
      if (event.key === "ArrowLeft") {
        onBack();
      }
    };

    globalThis.addEventListener("keydown", listener);
    return () => globalThis.removeEventListener("keydown", listener);
  }, [enabled, onBack, onNext]);
}
