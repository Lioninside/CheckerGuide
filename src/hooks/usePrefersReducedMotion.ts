import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mediaQuery) {
      return undefined;
    }

    setReduced(mediaQuery.matches);
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return reduced;
}
