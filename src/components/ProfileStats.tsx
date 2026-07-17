import type { Episode } from "../domain/catalog";
import { computeProfileStats, type Profile } from "../domain/profile";

interface ProfileStatsProps {
  profile: Profile;
  episodes: Episode[];
}

export function ProfileStats({ profile, episodes }: ProfileStatsProps) {
  const stats = computeProfileStats(profile, episodes);

  return (
    <section className="stats-grid" aria-label="Profilkennzahlen">
      <div>
        <strong>{stats.seenCount}</strong>
        <span>gesehen</span>
      </div>
      <div>
        <strong>{stats.bookmarkedCount}</strong>
        <span>gemerkt</span>
      </div>
      <div>
        <strong>{stats.progressPercent}%</strong>
        <span>Fortschritt</span>
      </div>
      <div>
        <strong>{stats.favoriteChecker?.value ?? "Noch keiner"}</strong>
        <span>Lieblingschecker</span>
      </div>
      <div>
        <strong>{stats.favoriteTopic?.value ?? "Noch keines"}</strong>
        <span>Lieblingsthema</span>
      </div>
      <div>
        <strong>
          {stats.currentSeries
            ? `${stats.currentSeries.count}x ${stats.currentSeries.checker}`
            : "Keine"}
        </strong>
        <span>aktuelle Serie</span>
      </div>
    </section>
  );
}
