import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { EmptyState } from "../components/EmptyState";
import { EpisodeActions } from "../components/EpisodeActions";
import { EpisodeCard } from "../components/EpisodeCard";
import { StatusBadge } from "../components/StatusBadge";
import { useCatalog } from "../contexts/CatalogContext";
import { useProfile } from "../contexts/ProfileContext";
import { getSimilarEpisodes } from "../domain/recommendations";
import { de } from "../i18n/de";

export default function EpisodeDetailPage() {
  const { episodeId } = useParams();
  const { availableEpisodes, catalog, loading } = useCatalog();
  const { profile } = useProfile();

  if (loading) {
    return <p className="loading">{de.loading.catalog}</p>;
  }

  const episode = catalog?.episodes.find((entry) => entry.id === episodeId);
  if (!episode) {
    return <EmptyState title={de.episode.notFoundTitle} body={de.episode.notFoundBody} />;
  }

  const similar = getSimilarEpisodes(episode, availableEpisodes, profile);
  const seen = profile.seenEpisodeIds.includes(episode.id);
  const bookmarked = profile.bookmarkedEpisodeIds.includes(episode.id);

  return (
    <div className="page-stack">
      <Link className="back-link" to="/suche">
        <ArrowLeft aria-hidden="true" size={18} />
        {de.actions.backToSearch}
      </Link>
      <article className="detail-layout">
        <div className="detail-media">
          {episode.thumbnail ? (
            <img
              alt=""
              src={episode.thumbnail.url}
              width={episode.thumbnail.width}
              height={episode.thumbnail.height}
              decoding="async"
            />
          ) : (
            <span className="thumbnail-placeholder">{de.common.thumbnailUnavailable}</span>
          )}
        </div>
        <div className="detail-copy">
          <div className="episode-meta">
            <StatusBadge>{episode.checker}</StatusBadge>
            {seen ? <StatusBadge tone="good">{de.actions.seen}</StatusBadge> : null}
            {bookmarked ? <StatusBadge tone="warning">{de.actions.saved}</StatusBadge> : null}
          </div>
          <h2>{episode.title}</h2>
          <p>{episode.description || de.episode.missingDescription}</p>
          <ul className="tag-list">
            {episode.topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
          <EpisodeActions episode={episode} />
        </div>
      </article>

      <section>
        <h2>{de.episode.similarTitle}</h2>
        {similar.length > 0 ? (
          <div className="episode-grid">
            {similar.map((entry) => (
              <EpisodeCard key={entry.id} episode={entry} />
            ))}
          </div>
        ) : (
          <EmptyState title={de.episode.similarEmptyTitle} body={de.episode.similarEmptyBody} />
        )}
      </section>
    </div>
  );
}
