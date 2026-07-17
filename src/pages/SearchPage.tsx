import { useMemo, useState } from "react";

import { EmptyState } from "../components/EmptyState";
import { EpisodeCard } from "../components/EpisodeCard";
import { FilterBar } from "../components/FilterBar";
import { useCatalog } from "../contexts/CatalogContext";
import { getCheckerOptions, getTopicOptions } from "../domain/catalog";
import { searchEpisodes, type EpisodeSearchFilters } from "../domain/search";
import { de } from "../i18n/de";

const initialFilters: EpisodeSearchFilters = { query: "", checker: "", topic: "" };

export default function SearchPage() {
  const { availableEpisodes, catalog, error, loading, reload } = useCatalog();
  const [filters, setFilters] = useState(initialFilters);

  const result = useMemo(
    () => searchEpisodes(availableEpisodes, filters),
    [availableEpisodes, filters],
  );

  if (loading) {
    return <p className="loading">Katalog wird geladen...</p>;
  }

  if (error) {
    return (
      <EmptyState
        title={de.catalogLoadError}
        body={error}
        actionLabel="Erneut versuchen"
        onAction={reload}
      />
    );
  }

  if (!catalog || availableEpisodes.length === 0) {
    return <EmptyState title="Katalog ist noch nicht eingerichtet" body={de.emptyCatalog} />;
  }

  return (
    <div className="page-stack">
      <section>
        <h2>Suche</h2>
        <FilterBar
          filters={filters}
          checkers={getCheckerOptions(catalog)}
          topics={getTopicOptions(catalog)}
          onChange={setFilters}
        />
        <p className="result-count" aria-live="polite">
          {result.total} Treffer
        </p>
      </section>
      {result.episodes.length > 0 ? (
        <div className="episode-grid">
          {result.episodes.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} />
          ))}
        </div>
      ) : (
        <EmptyState title="Keine Suchtreffer" body="Passe Suche oder Filter an." />
      )}
    </div>
  );
}
