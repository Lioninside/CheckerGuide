import type { Episode } from "../domain/catalog";
import { computeProfileStats, type Profile } from "../domain/profile";
import { de } from "../i18n/de";

interface ProfileStatsProps {
  profile: Profile;
  episodes: Episode[];
}

export function ProfileStats({ profile, episodes }: ProfileStatsProps) {
  const stats = computeProfileStats(profile, episodes);

  return (
    <section className="stats-grid" aria-label={de.profile.statsAriaLabel}>
      <div>
        <strong>{stats.seenCount}</strong>
        <span>{de.profile.seenMetric}</span>
      </div>
      <div>
        <strong>{stats.bookmarkedCount}</strong>
        <span>{de.profile.bookmarks}</span>
      </div>
      <div>
        <strong>{stats.progressPercent}%</strong>
        <span>{de.profile.progress}</span>
      </div>
      <div>
        <strong>{stats.favoriteChecker?.value ?? de.profile.noFavoriteChecker}</strong>
        <span>{de.profile.favoriteChecker}</span>
      </div>
      <div>
        <strong>{stats.favoriteTopic?.value ?? de.profile.noFavoriteTopic}</strong>
        <span>{de.profile.favoriteTopic}</span>
      </div>
      <div>
        <strong>
          {stats.currentSeries
            ? `${stats.currentSeries.count}x ${stats.currentSeries.checker}`
            : de.profile.none}
        </strong>
        <span>{de.profile.activitySeries}</span>
      </div>
    </section>
  );
}
