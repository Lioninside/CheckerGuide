import type { Episode } from "./catalog";

export interface EpisodeSearchFilters {
  query: string;
  checker: string;
  topic: string;
}

export interface EpisodeSearchResult {
  episodes: Episode[];
  total: number;
}

export function searchEpisodes(
  episodes: Episode[],
  filters: EpisodeSearchFilters,
): EpisodeSearchResult {
  const query = normalizeSearchText(filters.query).trim();
  const queryTerms = query.length > 0 ? query.split(/\s+/) : [];
  const checker = filters.checker.trim();
  const topic = filters.topic.trim();

  const results = episodes.filter((episode) => {
    if (checker && episode.checker !== checker) {
      return false;
    }

    if (topic && !episode.topics.includes(topic)) {
      return false;
    }

    if (queryTerms.length === 0) {
      return true;
    }

    const haystack = normalizeSearchText(`${episode.title} ${episode.topics.join(" ")}`);
    return queryTerms.every((term) => haystack.includes(term));
  });

  return { episodes: results, total: results.length };
}

export function normalizeSearchText(value: string): string {
  const lower = value.toLocaleLowerCase("de");
  const germanFolded = lower
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss");
  const accentFolded = lower
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replaceAll("ß", "ss");

  return `${germanFolded} ${accentFolded}`
    .replace(/[-_/]+/g, " ")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
