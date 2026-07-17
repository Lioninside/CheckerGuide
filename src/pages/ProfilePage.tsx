import { Download, FileUp, RotateCcw } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "../components/EmptyState";
import { EpisodeCard } from "../components/EpisodeCard";
import { ImportDialog } from "../components/ImportDialog";
import { ProfileStats } from "../components/ProfileStats";
import { ResetDialog } from "../components/ResetDialog";
import { useCatalog } from "../contexts/CatalogContext";
import { useProfile } from "../contexts/ProfileContext";

export default function ProfilePage() {
  const { availableEpisodes } = useCatalog();
  const { error, exportJson, profile, status } = useProfile();
  const [importOpen, setImportOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const bookmarked = availableEpisodes.filter((episode) =>
    profile.bookmarkedEpisodeIds.includes(episode.id),
  );

  const downloadExport = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `checker-guide-profil-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-stack">
      <section>
        <div className="section-heading">
          <h2>Profil</h2>
          <span>
            {status === "corrupted" ? "Profil beschädigt, neu angelegt" : "lokal im Browser"}
          </span>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <ProfileStats profile={profile} episodes={availableEpisodes} />
        <div className="actions">
          <button className="button secondary" type="button" onClick={downloadExport}>
            <Download aria-hidden="true" size={18} />
            Exportieren
          </button>
          <button className="button secondary" type="button" onClick={() => setImportOpen(true)}>
            <FileUp aria-hidden="true" size={18} />
            Importieren
          </button>
          <button className="button danger" type="button" onClick={() => setResetOpen(true)}>
            <RotateCcw aria-hidden="true" size={18} />
            Zurücksetzen
          </button>
        </div>
      </section>

      <section>
        <h2>Merkliste</h2>
        {bookmarked.length > 0 ? (
          <div className="episode-grid">
            {bookmarked.map((episode) => (
              <EpisodeCard key={episode.id} episode={episode} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Keine gemerkten Folgen"
            body="Gemerkte, ungesehene Folgen erscheinen hier."
          />
        )}
      </section>

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
      <ResetDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </div>
  );
}
