import { Download, FileUp, RotateCcw } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "../components/EmptyState";
import { EpisodeCard } from "../components/EpisodeCard";
import { ImportDialog } from "../components/ImportDialog";
import { ProfileStats } from "../components/ProfileStats";
import { ResetDialog } from "../components/ResetDialog";
import { useCatalog } from "../contexts/CatalogContext";
import { useProfile } from "../contexts/ProfileContext";
import { downloadJsonFile } from "../infrastructure/browser";
import { de } from "../i18n/de";

export default function ProfilePage() {
  const { availableEpisodes } = useCatalog();
  const { error, exportJson, profile, status } = useProfile();
  const [importOpen, setImportOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const bookmarked = availableEpisodes.filter((episode) =>
    profile.bookmarkedEpisodeIds.includes(episode.id),
  );
  const seenEpisodes = availableEpisodes.filter((episode) =>
    profile.seenEpisodeIds.includes(episode.id),
  );

  const downloadExport = () => {
    downloadJsonFile(exportJson(), de.profile.exportFileName(new Date()));
  };

  return (
    <div className="page-stack">
      <section>
        <div className="section-heading">
          <h2>{de.profile.title}</h2>
          <span>{status === "corrupted" ? de.profile.corrupted : de.profile.local}</span>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <aside className="notice-band profile-backup-note">
          <p>{de.profile.localBackupHint}</p>
        </aside>
        <ProfileStats profile={profile} episodes={availableEpisodes} />
        <div className="actions">
          <button className="button secondary" type="button" onClick={downloadExport}>
            <Download aria-hidden="true" size={18} />
            {de.actions.export}
          </button>
          <button className="button secondary" type="button" onClick={() => setImportOpen(true)}>
            <FileUp aria-hidden="true" size={18} />
            {de.actions.import}
          </button>
          <button className="button danger" type="button" onClick={() => setResetOpen(true)}>
            <RotateCcw aria-hidden="true" size={18} />
            {de.actions.reset}
          </button>
        </div>
      </section>

      <section>
        <h2>{de.profile.seenEpisodesTitle}</h2>
        {seenEpisodes.length > 0 ? (
          <div className="episode-grid">
            {seenEpisodes.map((episode) => (
              <EpisodeCard key={episode.id} episode={episode} />
            ))}
          </div>
        ) : (
          <EmptyState title={de.profile.seenEmptyTitle} body={de.profile.seenEmptyBody} />
        )}
      </section>

      <section>
        <h2>{de.profile.bookmarksTitle}</h2>
        {bookmarked.length > 0 ? (
          <div className="episode-grid">
            {bookmarked.map((episode) => (
              <EpisodeCard key={episode.id} episode={episode} />
            ))}
          </div>
        ) : (
          <EmptyState title={de.profile.bookmarkEmptyTitle} body={de.profile.bookmarkEmptyBody} />
        )}
      </section>

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
      <ResetDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </div>
  );
}
