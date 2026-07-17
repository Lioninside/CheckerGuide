import { Dices, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "../components/EmptyState";
import { EpisodeCard } from "../components/EpisodeCard";
import { useCatalog } from "../contexts/CatalogContext";
import { useProfile } from "../contexts/ProfileContext";
import { ALL_SEEN_MESSAGE, pickWheelEpisode } from "../domain/wheel";
import { setWheelHistory, type Profile } from "../domain/profile";
import { de } from "../i18n/de";

export default function WheelPage() {
  const { availableEpisodes, error, loading, reload } = useCatalog();
  const { profile, updateProfile } = useProfile();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [spinning, setSpinning] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const selectedEpisode = useMemo(
    () => availableEpisodes.find((episode) => episode.id === selectedId) ?? null,
    [availableEpisodes, selectedId],
  );

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

  const spin = () => {
    const result = pickWheelEpisode(availableEpisodes, profile);
    if (!result.episode) {
      setSelectedId(null);
      setAnnouncement(result.message ?? ALL_SEEN_MESSAGE);
      return;
    }

    setSpinning(!reducedMotion);
    window.setTimeout(
      () => {
        setSelectedId(result.episode?.id ?? null);
        setAnnouncement(`Ausgewählt: ${result.episode?.title ?? ""}`);
        updateProfile((current: Profile) =>
          setWheelHistory(current, [result.episode!.id, ...current.wheelHistory]),
        );
        setSpinning(false);
      },
      reducedMotion ? 0 : 520,
    );
  };

  return (
    <div className="page-stack">
      <section className="wheel-layout">
        <div className={`wheel ${spinning ? "spinning" : ""}`} aria-hidden="true">
          <span>Checker Guide</span>
        </div>
        <div className="wheel-panel">
          <h2>Glücksrad</h2>
          <p className="muted">
            Das Rad wählt fair aus allen noch nicht gesehenen vollständigen Folgen im Katalog.
          </p>
          <button className="button primary big" type="button" onClick={spin}>
            <Dices aria-hidden="true" size={20} />
            Drehen
          </button>
          <p className="sr-only" aria-live="polite">
            {announcement}
          </p>
        </div>
      </section>

      {announcement === ALL_SEEN_MESSAGE ? (
        <EmptyState
          title={ALL_SEEN_MESSAGE}
          body="Du kannst im Profil einzelne Folgen wieder als ungesehen markieren."
        />
      ) : null}

      {selectedEpisode ? (
        <section>
          <div className="section-heading">
            <h2>Ergebnis</h2>
            <button className="button secondary" type="button" onClick={spin}>
              <RotateCcw aria-hidden="true" size={18} />
              Noch einmal drehen
            </button>
          </div>
          <EpisodeCard episode={selectedEpisode} />
        </section>
      ) : null}
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mediaQuery.matches);
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return reduced;
}
