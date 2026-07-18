import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EmptyState } from "../components/EmptyState";
import { EpisodeActions } from "../components/EpisodeActions";
import { StatusBadge } from "../components/StatusBadge";
import { useCatalog } from "../contexts/CatalogContext";
import { useProfile } from "../contexts/ProfileContext";
import { youtubeWatchUrl } from "../domain/catalog";
import { getStableDiscoverOrder } from "../domain/discover";
import { setDiscoverOrder } from "../domain/profile";
import { useArrowKeyNavigation } from "../hooks/useArrowKeyNavigation";
import { openExternalUrl } from "../infrastructure/browser";
import { de } from "../i18n/de";

export default function DiscoverPage() {
  const { availableEpisodes, catalog, error, loading, reload } = useCatalog();
  const { markSeen, profile, recordOpened, updateProfile } = useProfile();
  const [index, setIndex] = useState(0);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const orderResult = useMemo(
    () => getStableDiscoverOrder(availableEpisodes, profile, catalog?.catalogVersion ?? "unknown"),
    [availableEpisodes, catalog?.catalogVersion, profile],
  );
  const moveNext = useCallback(
    () => setIndex((current) => Math.min(current + 1, orderResult.order.length - 1)),
    [orderResult.order.length],
  );
  const moveBack = useCallback(() => setIndex((current) => Math.max(current - 1, 0)), []);

  useEffect(() => {
    const current = profile.discoverOrder;
    if (
      current?.catalogVersion !== orderResult.state.catalogVersion ||
      current.episodeIds.join("|") !== orderResult.state.episodeIds.join("|")
    ) {
      updateProfile((profileToUpdate) => setDiscoverOrder(profileToUpdate, orderResult.state));
    }
  }, [orderResult.state, profile.discoverOrder, updateProfile]);

  useEffect(() => {
    setIndex((current) => Math.min(current, Math.max(orderResult.order.length - 1, 0)));
  }, [orderResult.order.length]);

  useArrowKeyNavigation({
    enabled: orderResult.order.length > 0,
    onBack: moveBack,
    onNext: moveNext,
  });

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

  if (availableEpisodes.length === 0) {
    return <EmptyState title={de.emptyCatalogTitle} body={de.emptyCatalog} />;
  }

  if (orderResult.order.length === 0) {
    return <EmptyState title={de.discover.noUnseenTitle} body={de.discover.allSeenBody} />;
  }

  const episodeId = orderResult.order[index];
  const episode =
    availableEpisodes.find((entry) => entry.id === episodeId) ?? availableEpisodes[0]!;
  const bookmarked = profile.bookmarkedEpisodeIds.includes(episode.id);

  const openYoutube = () => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    recordOpened(episode.id);
    openExternalUrl(youtubeWatchUrl(episode.youtubeId));
  };

  return (
    <div className="page-stack">
      <section className="discover-stage">
        <h2>{de.discover.title}</h2>
        <button
          className="discover-card"
          type="button"
          onClick={openYoutube}
          onPointerDown={(event) => {
            dragStart.current = { x: event.clientX, y: event.clientY };
            dragged.current = false;
          }}
          onPointerMove={(event) => {
            if (!dragStart.current) {
              return;
            }
            const deltaX = event.clientX - dragStart.current.x;
            const deltaY = event.clientY - dragStart.current.y;
            if (Math.hypot(deltaX, deltaY) > 28) {
              dragged.current = true;
            }
          }}
          onPointerUp={(event) => {
            if (!dragStart.current) {
              return;
            }
            const deltaX = event.clientX - dragStart.current.x;
            if (Math.abs(deltaX) > 80) {
              event.preventDefault();
              if (deltaX < 0) {
                moveNext();
              } else {
                moveBack();
              }
            }
            dragStart.current = null;
          }}
          aria-label={de.actions.viewTitleOnYoutube(episode.title)}
        >
          <div className="discover-copy">
            <h3>{episode.title}</h3>
            <div className="episode-meta">
              <StatusBadge>{episode.checker}</StatusBadge>
              {bookmarked ? <StatusBadge tone="warning">{de.actions.saved}</StatusBadge> : null}
            </div>
            <ul className="tag-list" aria-label={de.common.topics}>
              {episode.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>
          {episode.thumbnail ? (
            <img
              alt=""
              src={episode.thumbnail.url}
              width={episode.thumbnail.width}
              height={episode.thumbnail.height}
              loading="eager"
              decoding="async"
            />
          ) : (
            <span className="thumbnail-placeholder">{de.common.thumbnailUnavailable}</span>
          )}
          <div className="discover-copy">
            <span className="inline-link">
              <ExternalLink aria-hidden="true" size={18} />
              {de.actions.viewOnYoutube}
            </span>
          </div>
        </button>
        <div className="discover-controls">
          <button
            className="button secondary"
            type="button"
            onClick={moveBack}
            disabled={index === 0}
          >
            <ArrowLeft aria-hidden="true" size={18} />
            {de.actions.back}
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={moveNext}
            disabled={index >= orderResult.order.length - 1}
          >
            {de.discover.next}
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        </div>
        <div className="actions">
          <EpisodeActions episode={episode} compact />
          <button className="button secondary" type="button" onClick={() => markSeen(episode.id)}>
            {de.actions.seen}
          </button>
        </div>
      </section>
    </div>
  );
}
