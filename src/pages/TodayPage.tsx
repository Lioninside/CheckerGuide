import { Compass, Dices, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { EmptyState } from "../components/EmptyState";
import { EpisodeCard } from "../components/EpisodeCard";
import { LocalProfileNotice } from "../components/LocalProfileNotice";
import { useCatalog } from "../contexts/CatalogContext";
import { useProfile } from "../contexts/ProfileContext";
import { getDailyRecommendation, getRecommendationGroup } from "../domain/recommendations";
import { de } from "../i18n/de";

export default function TodayPage() {
  const { availableEpisodes, catalog, error, loading, reload } = useCatalog();
  const { profile } = useProfile();

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
    return (
      <div className="page-stack">
        <EmptyState title="Katalog ist noch nicht eingerichtet" body={de.emptyCatalog} />
        <LocalProfileNotice />
      </div>
    );
  }

  const daily = getDailyRecommendation(catalog);
  const recommendationGroup = getRecommendationGroup(availableEpisodes, profile);

  return (
    <div className="page-stack">
      <section>
        <h2>Tägliche Empfehlung</h2>
        {daily ? (
          <EpisodeCard episode={daily} />
        ) : (
          <EmptyState title="Keine Empfehlung" body={de.emptyCatalog} />
        )}
      </section>

      <section>
        <div className="section-heading">
          <h2>{recommendationGroup.title}</h2>
          <span>
            {recommendationGroup.reason === "personalized"
              ? "lokal berechnet"
              : "abwechslungsreich"}
          </span>
        </div>
        {recommendationGroup.episodes.length > 0 ? (
          <div className="episode-grid">
            {recommendationGroup.episodes.map((episode) => (
              <EpisodeCard key={episode.id} episode={episode} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Keine ungesehenen Folgen"
            body="Du hast aktuell keine ungesehenen Folgen im Katalog."
          />
        )}
      </section>

      <section className="quick-links" aria-label="Direkte Einstiege">
        <Link to="/gluecksrad">
          <Dices aria-hidden="true" size={22} />
          Glücksrad
        </Link>
        <Link to="/entdecken">
          <Compass aria-hidden="true" size={22} />
          Entdecken
        </Link>
        <Link to="/suche">
          <Search aria-hidden="true" size={22} />
          Suche
        </Link>
      </section>

      <LocalProfileNotice />
    </div>
  );
}
