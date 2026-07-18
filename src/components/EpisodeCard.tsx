import { Link } from "react-router-dom";

import type { Episode } from "../domain/catalog";
import { useProfile } from "../contexts/ProfileContext";
import { de } from "../i18n/de";
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
      <div className="episode-card-body">
        <h3>
          <Link to={`/folge/${episode.id}`}>{episode.title}</Link>
        </h3>
        <div className="episode-meta">
          <StatusBadge>{episode.checker}</StatusBadge>
          {seen ? <StatusBadge tone="good">{de.actions.seen}</StatusBadge> : null}
          {bookmarked ? <StatusBadge tone="warning">{de.actions.saved}</StatusBadge> : null}
        </div>
        <ul className="tag-list" aria-label={de.common.topics}>
          {episode.topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      </div>
      <Link
        className="thumbnail-link"
        to={`/folge/${episode.id}`}
        aria-label={de.actions.openEpisode(episode.title)}
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
          <span className="thumbnail-placeholder">{de.common.thumbnailUnavailable}</span>
        )}
      </Link>
      {showActions ? (
        <div className="episode-card-actions">
          <EpisodeActions episode={episode} compact />
        </div>
      ) : null}
    </article>
  );
}
