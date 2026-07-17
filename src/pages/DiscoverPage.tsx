import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { EmptyState } from "../components/EmptyState";
import { EpisodeActions } from "../components/EpisodeActions";
import { StatusBadge } from "../components/StatusBadge";
import { useCatalog } from "../contexts/CatalogContext";
import { useProfile } from "../contexts/ProfileContext";
import { youtubeWatchUrl } from "../domain/catalog";
import { getStableDiscoverOrder } from "../domain/discover";
import { setDiscoverOrder } from "../domain/profile";
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

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setIndex((current) => Math.min(current + 1, orderResult.order.length - 1));
      }
      if (event.key === "ArrowLeft") {
        setIndex((current) => Math.max(current - 1, 0));
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [orderResult.order.length]);

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

  if (availableEpisodes.length === 0) {
    return <EmptyState title="Katalog ist noch nicht eingerichtet" body={de.emptyCatalog} />;
  }

  if (orderResult.order.length === 0) {
    return (
      <EmptyState
        title="Keine ungesehenen Folgen"
        body="Alle verfügbaren Folgen sind als gesehen markiert."
      />
    );
  }

  const episodeId = orderResult.order[index];
  const episode =
    availableEpisodes.find((entry) => entry.id === episodeId) ?? availableEpisodes[0]!;

  const openYoutube = () => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    recordOpened(episode.id);
    window.open(youtubeWatchUrl(episode.youtubeId), "_blank", "noopener,noreferrer");
  };

  const moveNext = () => setIndex((current) => Math.min(current + 1, orderResult.order.length - 1));
  const moveBack = () => setIndex((current) => Math.max(current - 1, 0));

  return (
    <div className="page-stack">
      <section className="discover-stage">
        <div
          className="discover-card"
          role="button"
          tabIndex={0}
          onClick={openYoutube}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openYoutube();
            }
          }}
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
          aria-label={`${episode.title} auf YouTube ansehen`}
        >
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
            <span className="thumbnail-placeholder">Thumbnail nicht verfügbar</span>
          )}
          <div className="discover-copy">
            <StatusBadge>{episode.checker}</StatusBadge>
            <h2>{episode.title}</h2>
            <ul className="tag-list">
              {episode.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
            <span className="inline-link">
              <ExternalLink aria-hidden="true" size={18} />
              Auf YouTube ansehen
            </span>
          </div>
        </div>
        <div className="discover-controls">
          <button
            className="button secondary"
            type="button"
            onClick={moveBack}
            disabled={index === 0}
          >
            <ArrowLeft aria-hidden="true" size={18} />
            Zurück
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={moveNext}
            disabled={index >= orderResult.order.length - 1}
          >
            Weiter
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        </div>
        <div className="actions">
          <EpisodeActions episode={episode} compact />
          <button className="button secondary" type="button" onClick={() => markSeen(episode.id)}>
            Gesehen
          </button>
        </div>
      </section>
    </div>
  );
}
