import type { Episode } from "./catalog";
import type { Profile } from "./profile";

export const ALL_SEEN_MESSAGE = "Du hast alle Checker-Folgen entdeckt.";

export interface WheelPickResult {
  episode: Episode | null;
  poolSize: number;
  message?: typeof ALL_SEEN_MESSAGE;
}

export type RandomInt = (maxExclusive: number) => number;

export function getWheelPool(episodes: Episode[], profile: Profile): Episode[] {
  const seen = new Set(profile.seenEpisodeIds);
  return episodes.filter(
    (episode) => episode.available && !episode.needsReview && !seen.has(episode.id),
  );
}

export function pickWheelEpisode(
  episodes: Episode[],
  profile: Profile,
  randomInt: RandomInt = cryptoRandomInt,
): WheelPickResult {
  const pool = getWheelPool(episodes, profile);
  if (pool.length === 0) {
    return { episode: null, poolSize: 0, message: ALL_SEEN_MESSAGE };
  }

  const recent = new Set(profile.wheelHistory.slice(0, Math.min(3, pool.length - 1)));
  const eligible = pool.length > 3 ? pool.filter((episode) => !recent.has(episode.id)) : pool;
  const selected = eligible[randomInt(eligible.length)] ?? eligible[0] ?? pool[0] ?? null;
  return { episode: selected, poolSize: pool.length };
}

export function cryptoRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) {
    return 0;
  }

  const cryptoSource = globalThis.crypto;
  if (!cryptoSource?.getRandomValues) {
    return Math.floor(Math.random() * maxExclusive);
  }

  const array = new Uint32Array(1);
  cryptoSource.getRandomValues(array);
  return (array[0] ?? 0) % maxExclusive;
}
