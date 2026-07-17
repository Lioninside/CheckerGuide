import type { Catalog, Episode } from "../domain/catalog";
import type { Profile } from "../domain/profile";
import { createProfile, markEpisodeSeen, toggleBookmark } from "../domain/profile";

export const sampleEpisodes: Episode[] = [
  {
    id: "episode-kaese",
    youtubeId: "AAAAAAAAAAA",
    title: "Checker Tobi: Der Käse-Check",
    checker: "Tobi",
    topics: ["Essen", "Wissenschaft"],
    description: "Tobi findet heraus, wie Käse entsteht.",
    publishedAt: "2026-01-10T09:00:00Z",
    durationSeconds: 1500,
    thumbnail: {
      url: "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
      width: 480,
      height: 270,
    },
    available: true,
  },
  {
    id: "episode-wald",
    youtubeId: "BBBBBBBBBBB",
    title: "Checker Julian: Der Wald-Check",
    checker: "Julian",
    topics: ["Natur", "Tiere"],
    description: "Julian schaut sich den Wald und seine Tiere an.",
    publishedAt: "2026-02-10T09:00:00Z",
    durationSeconds: 1540,
    thumbnail: {
      url: "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
      width: 480,
      height: 270,
    },
    available: true,
  },
  {
    id: "episode-roboter",
    youtubeId: "CCCCCCCCCCC",
    title: "Checker Marina: Der Roboter-Check",
    checker: "Marina",
    topics: ["Technik", "Wissenschaft"],
    description: "Marina trifft Roboter im Labor.",
    publishedAt: "2026-03-10T09:00:00Z",
    durationSeconds: 1600,
    thumbnail: {
      url: "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
      width: 480,
      height: 270,
    },
    available: true,
  },
  {
    id: "episode-zug",
    youtubeId: "DDDDDDDDDDD",
    title: "Checker Can: Der Zug-Check",
    checker: "Can",
    topics: ["Fahrzeuge", "Technik"],
    description: "Can fährt mit der Bahn.",
    publishedAt: "2026-04-10T09:00:00Z",
    durationSeconds: 1700,
    thumbnail: {
      url: "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
      width: 480,
      height: 270,
    },
    available: true,
  },
];

export const sampleCatalog: Catalog = {
  schemaVersion: 1,
  catalogVersion: "test-catalog",
  generatedAt: "2026-05-01T00:00:00Z",
  source: {
    kind: "youtube-data-api",
    channelHandle: "@CHECKERWELT",
    channelId: "channel-test",
  },
  topics: ["Essen", "Fahrzeuge", "Natur", "Technik", "Tiere", "Wissenschaft"],
  checkers: ["Can", "Julian", "Marina", "Tobi"],
  dailyRecommendations: {
    "2026-05-01": "episode-kaese",
  },
  episodes: sampleEpisodes,
};

export function profileWithActivity(): Profile {
  let profile = createProfile(new Date("2026-05-01T08:00:00Z"));
  profile = markEpisodeSeen(profile, "episode-kaese", new Date("2026-05-01T09:00:00Z"));
  profile = markEpisodeSeen(profile, "episode-roboter", new Date("2026-05-01T10:00:00Z"));
  profile = toggleBookmark(profile, "episode-wald", new Date("2026-05-01T11:00:00Z"));
  return profile;
}
