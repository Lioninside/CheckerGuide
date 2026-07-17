import type { Episode } from "./catalog";

export const PROFILE_VERSION = 1;

export interface ProfileActivityEntry {
  episodeId: string;
  action: "seen" | "unseen" | "opened" | "bookmarked" | "unbookmarked";
  at: string;
}

export interface DiscoverOrderState {
  catalogVersion: string;
  episodeIds: string[];
}

export interface Profile {
  version: typeof PROFILE_VERSION;
  createdAt: string;
  updatedAt: string;
  seenEpisodeIds: string[];
  bookmarkedEpisodeIds: string[];
  lastOpenedEpisodeId?: string;
  lastSeenEpisodeId?: string;
  localNoticeAcknowledged: boolean;
  wheelHistory: string[];
  discoverOrder: DiscoverOrderState | null;
  activity: ProfileActivityEntry[];
}

export interface ProfileImportPreview {
  seenCount: number;
  bookmarkedCount: number;
  unknownEpisodeIds: string[];
  version: number;
}

export type ProfileLoadStatus = "created" | "loaded" | "migrated" | "corrupted";

export interface ProfileLoadResult {
  profile: Profile;
  status: ProfileLoadStatus;
  error?: string;
}

export interface ProfileStats {
  seenCount: number;
  bookmarkedCount: number;
  progressPercent: number;
  favoriteChecker: FavoriteStat | null;
  favoriteTopic: FavoriteStat | null;
  lastEpisode: Episode | null;
  currentSeries: CurrentSeriesStat | null;
  perCheckerProgress: Array<{ checker: string; seen: number; total: number }>;
}

export interface FavoriteStat {
  value: string;
  count: number;
  tied: boolean;
}

export interface CurrentSeriesStat {
  checker: string;
  count: number;
  interrupted: boolean;
}

export function createProfile(now = new Date()): Profile {
  const timestamp = now.toISOString();
  return {
    version: PROFILE_VERSION,
    createdAt: timestamp,
    updatedAt: timestamp,
    seenEpisodeIds: [],
    bookmarkedEpisodeIds: [],
    localNoticeAcknowledged: false,
    wheelHistory: [],
    discoverOrder: null,
    activity: [],
  };
}

export function parseStoredProfile(raw: string | null, now = new Date()): ProfileLoadResult {
  if (raw === null) {
    return { profile: createProfile(now), status: "created" };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const migrated = migrateProfile(parsed, now);
    const originalVersion =
      isRecord(parsed) && typeof parsed.version === "number" ? parsed.version : 0;
    return {
      profile: migrated,
      status: originalVersion === PROFILE_VERSION ? "loaded" : "migrated",
    };
  } catch (error) {
    return {
      profile: createProfile(now),
      status: "corrupted",
      error: error instanceof Error ? error.message : "Profil konnte nicht gelesen werden.",
    };
  }
}

export function migrateProfile(value: unknown, now = new Date()): Profile {
  if (!isRecord(value)) {
    throw new Error("Profil ist kein Objekt.");
  }

  if (value.version === PROFILE_VERSION) {
    return normalizeProfile(value, now);
  }

  if (value.version === 0 || value.version === undefined) {
    const migrated = createProfile(now);
    migrated.createdAt = readString(value.createdAt) ?? migrated.createdAt;
    migrated.seenEpisodeIds = uniqueStrings(readStringArray(value.seenEpisodeIds ?? value.seen));
    migrated.bookmarkedEpisodeIds = uniqueStrings(
      readStringArray(value.bookmarkedEpisodeIds ?? value.bookmarks),
    ).filter((episodeId) => !migrated.seenEpisodeIds.includes(episodeId));
    migrated.localNoticeAcknowledged = value.localNoticeAcknowledged === true;
    migrated.updatedAt = now.toISOString();
    return migrated;
  }

  throw new Error("Importversion nicht unterstuetzt.");
}

export function serializeProfile(profile: Profile): string {
  return JSON.stringify(profile, null, 2);
}

export function markEpisodeSeen(profile: Profile, episodeId: string, now = new Date()): Profile {
  const timestamp = now.toISOString();
  const seenEpisodeIds = uniqueStrings([...profile.seenEpisodeIds, episodeId]);
  const bookmarkedEpisodeIds = profile.bookmarkedEpisodeIds.filter((id) => id !== episodeId);
  return withActivity(
    {
      ...profile,
      seenEpisodeIds,
      bookmarkedEpisodeIds,
      lastSeenEpisodeId: episodeId,
      updatedAt: timestamp,
    },
    { episodeId, action: "seen", at: timestamp },
  );
}

export function unmarkEpisodeSeen(profile: Profile, episodeId: string, now = new Date()): Profile {
  const timestamp = now.toISOString();
  return withActivity(
    {
      ...profile,
      seenEpisodeIds: profile.seenEpisodeIds.filter((id) => id !== episodeId),
      lastSeenEpisodeId:
        profile.lastSeenEpisodeId === episodeId ? undefined : profile.lastSeenEpisodeId,
      updatedAt: timestamp,
    },
    { episodeId, action: "unseen", at: timestamp },
  );
}

export function toggleBookmark(profile: Profile, episodeId: string, now = new Date()): Profile {
  const timestamp = now.toISOString();
  if (profile.seenEpisodeIds.includes(episodeId)) {
    return {
      ...profile,
      bookmarkedEpisodeIds: profile.bookmarkedEpisodeIds.filter((id) => id !== episodeId),
      updatedAt: timestamp,
    };
  }

  const bookmarked = profile.bookmarkedEpisodeIds.includes(episodeId);
  return withActivity(
    {
      ...profile,
      bookmarkedEpisodeIds: bookmarked
        ? profile.bookmarkedEpisodeIds.filter((id) => id !== episodeId)
        : uniqueStrings([...profile.bookmarkedEpisodeIds, episodeId]),
      updatedAt: timestamp,
    },
    { episodeId, action: bookmarked ? "unbookmarked" : "bookmarked", at: timestamp },
  );
}

export function recordEpisodeOpened(
  profile: Profile,
  episodeId: string,
  now = new Date(),
): Profile {
  const timestamp = now.toISOString();
  return withActivity(
    {
      ...profile,
      lastOpenedEpisodeId: episodeId,
      updatedAt: timestamp,
    },
    { episodeId, action: "opened", at: timestamp },
  );
}

export function acknowledgeLocalNotice(profile: Profile, now = new Date()): Profile {
  return { ...profile, localNoticeAcknowledged: true, updatedAt: now.toISOString() };
}

export function resetProfile(now = new Date()): Profile {
  return { ...createProfile(now), localNoticeAcknowledged: true };
}

export function setWheelHistory(profile: Profile, episodeIds: string[], now = new Date()): Profile {
  return {
    ...profile,
    wheelHistory: uniqueStrings(episodeIds).slice(0, 8),
    updatedAt: now.toISOString(),
  };
}

export function setDiscoverOrder(
  profile: Profile,
  discoverOrder: DiscoverOrderState,
  now = new Date(),
): Profile {
  return {
    ...profile,
    discoverOrder,
    updatedAt: now.toISOString(),
  };
}

export function validateProfileImport(
  value: unknown,
  knownEpisodeIds: string[],
): ProfileImportPreview {
  const profile = migrateProfile(value);
  const known = new Set(knownEpisodeIds);
  const importedEpisodeIds = uniqueStrings([
    ...profile.seenEpisodeIds,
    ...profile.bookmarkedEpisodeIds,
  ]);
  return {
    seenCount: profile.seenEpisodeIds.length,
    bookmarkedCount: profile.bookmarkedEpisodeIds.length,
    unknownEpisodeIds: importedEpisodeIds.filter((episodeId) => !known.has(episodeId)),
    version: profile.version,
  };
}

export function mergeProfiles(current: Profile, importedValue: unknown, now = new Date()): Profile {
  const imported = migrateProfile(importedValue, now);
  const seenEpisodeIds = uniqueStrings([...current.seenEpisodeIds, ...imported.seenEpisodeIds]);
  const bookmarkedEpisodeIds = uniqueStrings([
    ...current.bookmarkedEpisodeIds,
    ...imported.bookmarkedEpisodeIds,
  ]).filter((episodeId) => !seenEpisodeIds.includes(episodeId));
  return {
    ...current,
    seenEpisodeIds,
    bookmarkedEpisodeIds,
    lastOpenedEpisodeId: imported.lastOpenedEpisodeId ?? current.lastOpenedEpisodeId,
    lastSeenEpisodeId: imported.lastSeenEpisodeId ?? current.lastSeenEpisodeId,
    wheelHistory: uniqueStrings([...imported.wheelHistory, ...current.wheelHistory]).slice(0, 8),
    activity: [...current.activity, ...imported.activity]
      .sort((a, b) => a.at.localeCompare(b.at))
      .slice(-200),
    updatedAt: now.toISOString(),
  };
}

export function replaceProfile(importedValue: unknown, now = new Date()): Profile {
  const imported = migrateProfile(importedValue, now);
  return {
    ...imported,
    updatedAt: now.toISOString(),
    bookmarkedEpisodeIds: imported.bookmarkedEpisodeIds.filter(
      (episodeId) => !imported.seenEpisodeIds.includes(episodeId),
    ),
  };
}

export function computeProfileStats(profile: Profile, episodes: Episode[]): ProfileStats {
  const availableEpisodes = episodes.filter((episode) => episode.available);
  const episodeMap = new Map(availableEpisodes.map((episode) => [episode.id, episode]));
  const seenEpisodes = profile.seenEpisodeIds
    .map((episodeId) => episodeMap.get(episodeId))
    .filter((episode): episode is Episode => Boolean(episode));

  const favoriteChecker = rankFavorite(seenEpisodes.map((episode) => episode.checker));
  const favoriteTopic = rankFavorite(seenEpisodes.flatMap((episode) => episode.topics));
  const lastEpisode = profile.lastSeenEpisodeId
    ? (episodeMap.get(profile.lastSeenEpisodeId) ?? null)
    : null;

  return {
    seenCount: seenEpisodes.length,
    bookmarkedCount: profile.bookmarkedEpisodeIds.length,
    progressPercent:
      availableEpisodes.length === 0
        ? 0
        : Math.round((seenEpisodes.length / availableEpisodes.length) * 100),
    favoriteChecker,
    favoriteTopic,
    lastEpisode,
    currentSeries: computeCurrentSeries(profile, episodeMap),
    perCheckerProgress: computePerCheckerProgress(profile, availableEpisodes),
  };
}

function normalizeProfile(value: Record<string, unknown>, now: Date): Profile {
  const profile = createProfile(now);
  profile.createdAt = readString(value.createdAt) ?? profile.createdAt;
  profile.updatedAt = readString(value.updatedAt) ?? profile.updatedAt;
  profile.seenEpisodeIds = uniqueStrings(readStringArray(value.seenEpisodeIds));
  profile.bookmarkedEpisodeIds = uniqueStrings(readStringArray(value.bookmarkedEpisodeIds)).filter(
    (episodeId) => !profile.seenEpisodeIds.includes(episodeId),
  );
  profile.lastOpenedEpisodeId = readString(value.lastOpenedEpisodeId);
  profile.lastSeenEpisodeId = readString(value.lastSeenEpisodeId);
  profile.localNoticeAcknowledged = value.localNoticeAcknowledged === true;
  profile.wheelHistory = uniqueStrings(readStringArray(value.wheelHistory)).slice(0, 8);
  profile.discoverOrder = readDiscoverOrder(value.discoverOrder);
  profile.activity = readActivity(value.activity);
  return profile;
}

function readDiscoverOrder(value: unknown): DiscoverOrderState | null {
  if (!isRecord(value)) {
    return null;
  }

  const catalogVersion = readString(value.catalogVersion);
  if (!catalogVersion) {
    return null;
  }

  return {
    catalogVersion,
    episodeIds: uniqueStrings(readStringArray(value.episodeIds)),
  };
}

function readActivity(value: unknown): ProfileActivityEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!isRecord(entry)) {
      return [];
    }
    const episodeId = readString(entry.episodeId);
    const action = readString(entry.action);
    const at = readString(entry.at);
    if (
      !episodeId ||
      !at ||
      !["seen", "unseen", "opened", "bookmarked", "unbookmarked"].includes(action ?? "")
    ) {
      return [];
    }
    return [{ episodeId, action: action as ProfileActivityEntry["action"], at }];
  });
}

function computePerCheckerProgress(
  profile: Profile,
  episodes: Episode[],
): Array<{ checker: string; seen: number; total: number }> {
  const seen = new Set(profile.seenEpisodeIds);
  const groups = new Map<string, { checker: string; seen: number; total: number }>();
  for (const episode of episodes) {
    const group = groups.get(episode.checker) ?? { checker: episode.checker, seen: 0, total: 0 };
    group.total += 1;
    if (seen.has(episode.id)) {
      group.seen += 1;
    }
    groups.set(episode.checker, group);
  }
  return [...groups.values()].sort((a, b) => a.checker.localeCompare(b.checker, "de"));
}

function computeCurrentSeries(
  profile: Profile,
  episodeMap: Map<string, Episode>,
): CurrentSeriesStat | null {
  const seenActions = [...profile.activity]
    .filter((entry) => entry.action === "seen")
    .sort((a, b) => b.at.localeCompare(a.at));

  let checker: string | null = null;
  let count = 0;
  for (const entry of seenActions) {
    const episode = episodeMap.get(entry.episodeId);
    if (!episode) {
      continue;
    }

    if (checker === null) {
      checker = episode.checker;
      count = 1;
      continue;
    }

    if (episode.checker !== checker) {
      return { checker, count, interrupted: true };
    }
    count += 1;
  }

  return checker ? { checker, count, interrupted: false } : null;
}

function rankFavorite(values: string[]): FavoriteStat | null {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const ranked = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "de"),
  );
  const winner = ranked[0];
  if (!winner) {
    return null;
  }

  return {
    value: winner[0],
    count: winner[1],
    tied: ranked.length > 1 && ranked[1]?.[1] === winner[1],
  };
}

function withActivity(profile: Profile, entry: ProfileActivityEntry): Profile {
  return { ...profile, activity: [...profile.activity, entry].slice(-200) };
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
