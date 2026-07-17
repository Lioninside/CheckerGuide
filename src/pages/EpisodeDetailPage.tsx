import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { EmptyState } from "../components/EmptyState";
import { EpisodeActions } from "../components/EpisodeActions";
import { EpisodeCard } from "../components/EpisodeCard";
import { StatusBadge } from "../components/StatusBadge";
import { useCatalog } from "../contexts/CatalogContext";
import { useProfile } from "../contexts/ProfileContext";
import { getSimilarEpisodes } from "../domain/recommendations";

export default function EpisodeDetailPage() {
  const { episodeId } = useParams();
  const { availableEpisodes, catalog, loading } = useCatalog();
  const { profile } = useProfile();

  if (loading) {
    return <p className="loading">Katalog wird geladen...</p>;
  }

  const episode = catalog?.episodes.find((entry) => entry.id === episodeId);
  if (!episode) {
    return (
      <EmptyState
        title="Folge nicht gefunden"
        body="Diese Folge ist im aktuellen Katalog nicht verfügbar."
      />
    );
  }

  const similar = getSimilarEpisodes(episode, availableEpisodes, profile);
  const seen = profile.seenEpisodeIds.includes(episode.id);
  const bookmarked = profile.bookmarkedEpisodeIds.includes(episode.id);

  return (
    <div className="page-stack">
      <Link className="back-link" to="/suche">
        <ArrowLeft aria-hidden="true" size={18} />
        Zurück zur Suche
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
            <span className="thumbnail-placeholder">Thumbnail nicht verfügbar</span>
          )}
        </div>
        <div className="detail-copy">
          <div className="episode-meta">
            <StatusBadge>{episode.checker}</StatusBadge>
            {seen ? <StatusBadge tone="good">Gesehen</StatusBadge> : null}
            {bookmarked ? <StatusBadge tone="warning">Gemerkt</StatusBadge> : null}
          </div>
          <h2>{episode.title}</h2>
          <p>{episode.description || "Keine bereinigte Beschreibung im Katalog vorhanden."}</p>
          <ul className="tag-list">
            {episode.topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
          <EpisodeActions episode={episode} />
        </div>
      </article>

      <section>
        <h2>Ähnliche Folgen</h2>
        {similar.length > 0 ? (
          <div className="episode-grid">
            {similar.map((entry) => (
              <EpisodeCard key={entry.id} episode={entry} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Keine ähnlichen Folgen"
            body="Im aktuellen Katalog gibt es keine passende ungesehene Folge."
          />
        )}
      </section>
    </div>
  );
}
