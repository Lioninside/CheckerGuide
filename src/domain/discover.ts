import type { Episode } from "./catalog";
import type { DiscoverOrderState, Profile } from "./profile";
import { stableHash } from "./recommendations";

export interface DiscoverOrderResult {
  order: string[];
  state: DiscoverOrderState;
}

export function getStableDiscoverOrder(
  episodes: Episode[],
  profile: Profile,
  catalogVersion: string,
): DiscoverOrderResult {
  const seen = new Set(profile.seenEpisodeIds);
  const availableIds = episodes
    .filter((episode) => episode.available && !episode.needsReview && !seen.has(episode.id))
    .map((episode) => episode.id);
  const available = new Set(availableIds);
  const previous =
    profile.discoverOrder?.catalogVersion === catalogVersion
      ? profile.discoverOrder.episodeIds
      : [];
  const kept = previous.filter((episodeId) => available.has(episodeId));
  const newIds = availableIds.filter((episodeId) => !kept.includes(episodeId));
  const shuffledNew = stableShuffle(newIds, `${profile.createdAt}:${catalogVersion}`);
  const order = [...kept, ...shuffledNew];
  return {
    order,
    state: {
      catalogVersion,
      episodeIds: order,
    },
  };
}

export function stableShuffle(values: string[], seed: string): string[] {
  return [...values].sort((a, b) => {
    const aScore = stableHash(`${seed}:${a}`);
    const bScore = stableHash(`${seed}:${b}`);
    return aScore - bScore || a.localeCompare(b);
  });
}
