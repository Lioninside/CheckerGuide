export const FALLBACK_TOPICS = [
  "Abenteuer",
  "Alltag",
  "Berufe",
  "Essen",
  "Fahrzeuge",
  "Geschichte",
  "Gesellschaft",
  "Gesundheit",
  "Klima",
  "Koerper",
  "Kultur",
  "Medien",
  "Natur",
  "Reisen",
  "Sport",
  "Technik",
  "Tiere",
  "Umwelt",
  "Weltraum",
  "Wissenschaft",
] as const;

export type CatalogSourceKind = "empty" | "youtube-data-api";

export interface CatalogSource {
  kind: CatalogSourceKind;
  channelHandle: string;
  channelId?: string;
}

export interface EpisodeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface Episode {
  id: string;
  youtubeId: string;
  title: string;
  checker: string;
  topics: string[];
  description?: string;
  publishedAt?: string;
  durationSeconds?: number;
  thumbnail?: EpisodeThumbnail;
  available: boolean;
  needsReview?: boolean;
}

export interface Catalog {
  schemaVersion: 1;
  catalogVersion: string;
  generatedAt: string | null;
  source: CatalogSource;
  topics: string[];
  checkers: string[];
  dailyRecommendations: Record<string, string>;
  episodes: Episode[];
}

export interface CatalogValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export function getAvailableEpisodes(catalog: Catalog): Episode[] {
  return catalog.episodes.filter((episode) => episode.available && !episode.needsReview);
}

export function getEpisodeById(catalog: Catalog, episodeId: string): Episode | undefined {
  return catalog.episodes.find((episode) => episode.id === episodeId);
}

export function getCheckerOptions(catalog: Catalog): string[] {
  const fromEpisodes = catalog.episodes.map((episode) => episode.checker).filter(Boolean);
  return uniqueSorted([...catalog.checkers, ...fromEpisodes]);
}

export function getTopicOptions(catalog: Catalog): string[] {
  const fromEpisodes = catalog.episodes.flatMap((episode) => episode.topics);
  return uniqueSorted([...catalog.topics, ...fromEpisodes]);
}

export function validateCatalog(catalog: Catalog, production = false): CatalogValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  const youtubeIds = new Set<string>();
  const topics = new Set(catalog.topics);

  if (catalog.schemaVersion !== 1) {
    errors.push("catalog.schemaVersion muss 1 sein.");
  }

  if (!catalog.catalogVersion.trim()) {
    errors.push("catalog.catalogVersion fehlt.");
  }

  if (production && getAvailableEpisodes(catalog).length === 0) {
    errors.push("Production-Deployment mit leerem Katalog ist blockiert.");
  }

  for (const episode of catalog.episodes) {
    if (!episode.id.trim()) {
      errors.push("Eine Folge hat keine id.");
    }

    if (ids.has(episode.id)) {
      errors.push(`Doppelte Folgen-id: ${episode.id}`);
    }
    ids.add(episode.id);

    if (!isValidYoutubeId(episode.youtubeId)) {
      errors.push(`Ungueltige YouTube-ID fuer ${episode.id}: ${episode.youtubeId}`);
    }

    if (youtubeIds.has(episode.youtubeId)) {
      errors.push(`Doppelte YouTube-ID: ${episode.youtubeId}`);
    }
    youtubeIds.add(episode.youtubeId);

    if (!episode.title.trim()) {
      errors.push(`Folge ${episode.id} hat keinen Titel.`);
    }

    if (!episode.checker.trim()) {
      errors.push(`Folge ${episode.id} hat keinen Checker.`);
    }

    for (const topic of episode.topics) {
      if (!topics.has(topic)) {
        warnings.push(`Folge ${episode.id} verwendet ein nicht registriertes Thema: ${topic}`);
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function parseCatalog(value: unknown): Catalog {
  if (!isRecord(value)) {
    throw new Error("Katalog ist kein Objekt.");
  }

  const episodes = Array.isArray(value.episodes)
    ? value.episodes.map((episode) => parseEpisode(episode))
    : [];
  const topics = Array.isArray(value.topics) ? value.topics.filter(isString) : [...FALLBACK_TOPICS];
  const checkers = Array.isArray(value.checkers) ? value.checkers.filter(isString) : [];
  const sourceValue = isRecord(value.source) ? value.source : {};

  return {
    schemaVersion: 1,
    catalogVersion: isString(value.catalogVersion) ? value.catalogVersion : "unknown",
    generatedAt: isString(value.generatedAt) ? value.generatedAt : null,
    source: {
      kind: sourceValue.kind === "youtube-data-api" ? "youtube-data-api" : "empty",
      channelHandle: isString(sourceValue.channelHandle)
        ? sourceValue.channelHandle
        : "@CHECKERWELT",
      channelId: isString(sourceValue.channelId) ? sourceValue.channelId : undefined,
    },
    topics: uniqueSorted(topics),
    checkers: uniqueSorted(checkers),
    dailyRecommendations: isStringRecord(value.dailyRecommendations)
      ? value.dailyRecommendations
      : {},
    episodes,
  };
}

export function isValidYoutubeId(id: string): boolean {
  return /^[A-Za-z0-9_-]{11}$/.test(id);
}

export function youtubeWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

function parseEpisode(value: unknown): Episode {
  if (!isRecord(value)) {
    throw new Error("Folge ist kein Objekt.");
  }

  const thumbnail = isRecord(value.thumbnail)
    ? {
        url: isString(value.thumbnail.url) ? value.thumbnail.url : "",
        width: typeof value.thumbnail.width === "number" ? value.thumbnail.width : 480,
        height: typeof value.thumbnail.height === "number" ? value.thumbnail.height : 360,
      }
    : undefined;

  return {
    id: isString(value.id) ? value.id : "",
    youtubeId: isString(value.youtubeId) ? value.youtubeId : "",
    title: isString(value.title) ? value.title : "",
    checker: isString(value.checker) ? value.checker : "",
    topics: Array.isArray(value.topics) ? uniqueSorted(value.topics.filter(isString)) : [],
    description: isString(value.description) ? value.description : undefined,
    publishedAt: isString(value.publishedAt) ? value.publishedAt : undefined,
    durationSeconds: typeof value.durationSeconds === "number" ? value.durationSeconds : undefined,
    thumbnail,
    available: value.available !== false,
    needsReview: value.needsReview === true,
  };
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "de"),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((entry) => typeof entry === "string") &&
    Object.keys(value).every((entry) => typeof entry === "string")
  );
}
