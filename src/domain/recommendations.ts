import type { Catalog, Episode } from "./catalog";
import type { Profile } from "./profile";
import { computeProfileStats } from "./profile";

export interface RecommendationGroup {
  title: "Fuer dich" | "Zum Entdecken";
  episodes: Episode[];
  reason: "personalized" | "diverse";
}

export function getDailyRecommendation(catalog: Catalog, date = new Date()): Episode | null {
  const available = catalog.episodes.filter((episode) => episode.available && !episode.needsReview);
  if (available.length === 0) {
    return null;
  }

  const dateKey = formatDateKey(date);
  const pinnedId = catalog.dailyRecommendations[dateKey];
  const pinned = pinnedId ? available.find((episode) => episode.id === pinnedId) : undefined;
  if (pinned) {
    return pinned;
  }

  return (
    [...available].sort((a, b) => {
      const aScore = stableHash(`${dateKey}:${a.id}`);
      const bScore = stableHash(`${dateKey}:${b.id}`);
      return aScore - bScore || a.id.localeCompare(b.id);
    })[0] ?? null
  );
}

export function getRecommendationGroup(
  episodes: Episode[],
  profile: Profile,
  limit = 4,
): RecommendationGroup {
  const unseen = episodes.filter(
    (episode) => episode.available && !profile.seenEpisodeIds.includes(episode.id),
  );

  if (unseen.length === 0) {
    return { title: "Zum Entdecken", episodes: [], reason: "diverse" };
  }

  const stats = computeProfileStats(profile, episodes);
  const hasEnoughActivity =
    profile.seenEpisodeIds.length >= 2 || profile.bookmarkedEpisodeIds.length >= 2;

  if (!hasEnoughActivity) {
    return {
      title: "Zum Entdecken",
      episodes: diverseSelection(unseen, limit),
      reason: "diverse",
    };
  }

  const favoriteChecker = stats.favoriteChecker?.value;
  const favoriteTopic = stats.favoriteTopic?.value;
  const lastEpisodeId = profile.lastSeenEpisodeId ?? profile.lastOpenedEpisodeId;

  const ranked = [...unseen].sort((a, b) => {
    const aScore = recommendationScore(a, favoriteChecker, favoriteTopic, lastEpisodeId);
    const bScore = recommendationScore(b, favoriteChecker, favoriteTopic, lastEpisodeId);
    return bScore - aScore || a.title.localeCompare(b.title, "de");
  });

  return {
    title: "Fuer dich",
    episodes: diversifyRanked(ranked, limit),
    reason: "personalized",
  };
}

export function getSimilarEpisodes(
  baseEpisode: Episode,
  episodes: Episode[],
  profile: Profile,
  limit = 4,
): Episode[] {
  const seen = new Set(profile.seenEpisodeIds);
  return episodes
    .filter(
      (episode) => episode.id !== baseEpisode.id && episode.available && !seen.has(episode.id),
    )
    .sort(
      (a, b) =>
        similarScore(b, baseEpisode) - similarScore(a, baseEpisode) ||
        a.title.localeCompare(b.title, "de"),
    )
    .slice(0, limit);
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function recommendationScore(
  episode: Episode,
  favoriteChecker: string | undefined,
  favoriteTopic: string | undefined,
  lastEpisodeId: string | undefined,
): number {
  let score = 0;
  if (favoriteChecker && episode.checker === favoriteChecker) {
    score += 4;
  }
  if (favoriteTopic && episode.topics.includes(favoriteTopic)) {
    score += 5;
  }
  if (lastEpisodeId && episode.id !== lastEpisodeId) {
    score += stableHash(`${lastEpisodeId}:${episode.id}`) % 3;
  }
  score += episode.topics.length > 1 ? 1 : 0;
  return score;
}

function similarScore(episode: Episode, baseEpisode: Episode): number {
  const topicOverlap = episode.topics.filter((topic) => baseEpisode.topics.includes(topic)).length;
  return topicOverlap * 3 + (episode.checker === baseEpisode.checker ? 2 : 0);
}

function diverseSelection(episodes: Episode[], limit: number): Episode[] {
  return diversifyRanked(
    [...episodes].sort(
      (a, b) => stableHash(a.id) - stableHash(b.id) || a.title.localeCompare(b.title, "de"),
    ),
    limit,
  );
}

function diversifyRanked(episodes: Episode[], limit: number): Episode[] {
  const result: Episode[] = [];
  const usedCheckers = new Set<string>();
  const usedTopics = new Set<string>();

  for (const episode of episodes) {
    const hasNewChecker = !usedCheckers.has(episode.checker);
    const hasNewTopic = episode.topics.some((topic) => !usedTopics.has(topic));
    if (result.length < limit && (hasNewChecker || hasNewTopic || result.length === 0)) {
      result.push(episode);
      usedCheckers.add(episode.checker);
      episode.topics.forEach((topic) => usedTopics.add(topic));
    }
  }

  for (const episode of episodes) {
    if (result.length >= limit) {
      break;
    }
    if (!result.some((entry) => entry.id === episode.id)) {
      result.push(episode);
    }
  }

  return result;
}
