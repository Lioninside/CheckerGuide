import { RotateCcw, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "../components/EmptyState";
import { EpisodeCard } from "../components/EpisodeCard";
import { useCatalog } from "../contexts/CatalogContext";
import { useProfile } from "../contexts/ProfileContext";
import { setWheelHistory, type Profile } from "../domain/profile";
import { ALL_SEEN_MESSAGE, pickWheelEpisode } from "../domain/wheel";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { de } from "../i18n/de";

export default function WheelPage() {
  const { availableEpisodes, error, loading, reload } = useCatalog();
  const { profile, updateProfile } = useProfile();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [drawing, setDrawing] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const selectedEpisode = useMemo(
    () => availableEpisodes.find((episode) => episode.id === selectedId) ?? null,
    [availableEpisodes, selectedId],
  );

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

  const drawCard = () => {
    const result = pickWheelEpisode(availableEpisodes, profile);
    if (!result.episode) {
      setSelectedId(null);
      setAnnouncement(result.message ?? ALL_SEEN_MESSAGE);
      return;
    }

    setDrawing(!reducedMotion);
    setTimeout(
      () => {
        setSelectedId(result.episode?.id ?? null);
        setAnnouncement(de.random.selected(result.episode?.title ?? ""));
        updateProfile((current: Profile) =>
          setWheelHistory(current, [result.episode!.id, ...current.wheelHistory]),
        );
        setDrawing(false);
      },
      reducedMotion ? 0 : 360,
    );
  };

  return (
    <div className="page-stack">
      <section className="random-layout">
        <div className={`card-stack ${drawing ? "drawing" : ""}`} aria-hidden="true">
          <span className="stack-card back" />
          <span className="stack-card middle" />
          <span className="stack-card front">
            <Shuffle aria-hidden="true" size={28} />
          </span>
        </div>
        <div className="random-panel">
          <h2>{de.random.title}</h2>
          <p className="muted">{de.random.description}</p>
          <button className="button primary big" type="button" onClick={drawCard}>
            <Shuffle aria-hidden="true" size={20} />
            {de.actions.drawCard}
          </button>
          <p className="sr-only" aria-live="polite">
            {announcement}
          </p>
        </div>
      </section>

      {announcement === ALL_SEEN_MESSAGE ? (
        <EmptyState title={ALL_SEEN_MESSAGE} body={de.random.allSeenBody} />
      ) : null}

      {selectedEpisode ? (
        <section>
          <div className="section-heading">
            <h2>{de.random.result}</h2>
            <button className="button secondary" type="button" onClick={drawCard}>
              <RotateCcw aria-hidden="true" size={18} />
              {de.actions.drawAgain}
            </button>
          </div>
          <EpisodeCard episode={selectedEpisode} />
        </section>
      ) : null}
    </div>
  );
}
