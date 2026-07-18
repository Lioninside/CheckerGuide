import { Bookmark, BookmarkCheck, Check, ExternalLink, RotateCcw } from "lucide-react";

import { youtubeWatchUrl, type Episode } from "../domain/catalog";
import { useProfile } from "../contexts/ProfileContext";
import { de } from "../i18n/de";

interface EpisodeActionsProps {
  episode: Episode;
  compact?: boolean;
}

export function EpisodeActions({ episode, compact = false }: EpisodeActionsProps) {
  const { profile, markSeen, recordOpened, toggleSaved, unmarkSeen } = useProfile();
  const seen = profile.seenEpisodeIds.includes(episode.id);
  const bookmarked = profile.bookmarkedEpisodeIds.includes(episode.id);

  return (
    <div className={compact ? "actions compact" : "actions"}>
      <a
        className="button primary"
        href={youtubeWatchUrl(episode.youtubeId)}
        target="_blank"
        rel="noreferrer"
        onClick={() => recordOpened(episode.id)}
      >
        <ExternalLink aria-hidden="true" size={18} />
        {de.actions.viewOnYoutube}
      </a>
      <button className="button secondary" type="button" onClick={() => toggleSaved(episode.id)}>
        {bookmarked ? (
          <BookmarkCheck aria-hidden="true" size={18} />
        ) : (
          <Bookmark aria-hidden="true" size={18} />
        )}
        {bookmarked ? de.actions.saved : de.actions.save}
      </button>
      <button
        className="button secondary"
        type="button"
        onClick={() => (seen ? unmarkSeen(episode.id) : markSeen(episode.id))}
      >
        {seen ? <RotateCcw aria-hidden="true" size={18} /> : <Check aria-hidden="true" size={18} />}
        {seen ? de.actions.unmarkSeen : de.actions.markSeen}
      </button>
    </div>
  );
}
