import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getAvailableEpisodes, type Catalog } from "../domain/catalog";
import { loadCatalog } from "../infrastructure/catalogRepository";

interface CatalogContextValue {
  catalog: Catalog | null;
  availableEpisodes: ReturnType<typeof getAvailableEpisodes>;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadCatalog()
      .then((loadedCatalog) => {
        if (!cancelled) {
          setCatalog(loadedCatalog);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Katalog konnte nicht geladen werden.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const value = useMemo<CatalogContextValue>(
    () => ({
      catalog,
      availableEpisodes: catalog ? getAvailableEpisodes(catalog) : [],
      loading,
      error,
      reload: () => setReloadToken((current) => current + 1),
    }),
    [catalog, error, loading],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) {
    throw new Error("useCatalog muss innerhalb von CatalogProvider verwendet werden.");
  }
  return value;
}
