import { Link } from "react-router-dom";

import type { Episode } from "../domain/catalog";
import { useProfile } from "../contexts/ProfileContext";
import { EpisodeActions } from "./EpisodeActions";
import { StatusBadge } from "./StatusBadge";

interface EpisodeCardProps {
  episode: Episode;
  showActions?: boolean;
}

export function EpisodeCard({ episode, showActions = true }: EpisodeCardProps) {
  const { profile } = useProfile();
  const seen = profile.seenEpisodeIds.includes(episode.id);
  const bookmarked = profile.bookmarkedEpisodeIds.includes(episode.id);

  return (
    <article className="episode-card">
      <Link
        className="thumbnail-link"
        to={`/folge/${episode.id}`}
        aria-label={`${episode.title} oeffnen`}
      >
        {episode.thumbnail ? (
          <img
            alt=""
            src={episode.thumbnail.url}
            width={episode.thumbnail.width}
            height={episode.thumbnail.height}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="thumbnail-placeholder">Thumbnail nicht verfuegbar</span>
        )}
      </Link>
      <div className="episode-card-body">
        <div className="episode-meta">
          <StatusBadge>{episode.checker}</StatusBadge>
          {seen ? <StatusBadge tone="good">Gesehen</StatusBadge> : null}
          {bookmarked ? <StatusBadge tone="warning">Gemerkt</StatusBadge> : null}
        </div>
        <h3>
          <Link to={`/folge/${episode.id}`}>{episode.title}</Link>
        </h3>
        <ul className="tag-list" aria-label="Themen">
          {episode.topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
        {showActions ? <EpisodeActions episode={episode} compact /> : null}
      </div>
    </article>
  );
}
