import { Search } from "lucide-react";
import { Link } from "react-router-dom";

import { EmptyState } from "../components/EmptyState";
import { EpisodeCard } from "../components/EpisodeCard";
import { LocalProfileNotice } from "../components/LocalProfileNotice";
import { useCatalog } from "../contexts/CatalogContext";
import { useProfile } from "../contexts/ProfileContext";
import { getDailyRecommendation, getRecommendationGroup } from "../domain/recommendations";
import { de } from "../i18n/de";

const recommendationLimit = 10;

export default function TodayPage() {
  const { availableEpisodes, catalog, error, loading, reload } = useCatalog();
  const { profile } = useProfile();

  if (loading) {
    return <p className="loading">{de.loading.catalog}</p>;
  }

  if (error) {
    return (
      <EmptyState
        title={de.catalogLoadError}
        body={error}
        actionLabel={de.actions.retry}
        onAction={reload}
      />
    );
  }

  if (!catalog || availableEpisodes.length === 0) {
    return (
      <div className="page-stack">
        <EmptyState title={de.emptyCatalogTitle} body={de.emptyCatalog} />
        <LocalProfileNotice />
      </div>
    );
  }

  const daily = getDailyRecommendation(catalog);
  const recommendationGroup = getRecommendationGroup(
    availableEpisodes,
    profile,
    recommendationLimit,
  );

  return (
    <div className="page-stack">
      <section>
        <h2>{de.today.dailyRecommendation}</h2>
        {daily ? (
          <EpisodeCard episode={daily} />
        ) : (
          <EmptyState title={de.today.noRecommendation} body={de.emptyCatalog} />
        )}
      </section>

      <section>
        <div className="section-heading">
          <div>
            <h2>{de.today.recommendedForYou}</h2>
            <span>
              {recommendationGroup.reason === "personalized"
                ? de.today.recommendationPersonalized
                : de.today.recommendationVaried}
            </span>
          </div>
          <Link className="button secondary" to="/suche">
            <Search aria-hidden="true" size={18} />
            {de.actions.allEpisodes}
          </Link>
        </div>
        {recommendationGroup.episodes.length > 0 ? (
          <div className="episode-rail" aria-label={de.today.recommendedForYou}>
            {recommendationGroup.episodes.map((episode) => (
              <EpisodeCard key={episode.id} episode={episode} />
            ))}
          </div>
        ) : (
          <EmptyState title={de.today.noUnseenTitle} body={de.today.noUnseenBody} />
        )}
      </section>

      <LocalProfileNotice />
    </div>
  );
}
