import { describe, expect, it } from "vitest";

import { sampleCatalog, sampleEpisodes } from "../test/fixtures";
import { createProfile, markEpisodeSeen, toggleBookmark } from "./profile";
import {
  getDailyRecommendation,
  getRecommendationGroup,
  getSimilarEpisodes,
} from "./recommendations";

describe("recommendations", () => {
  it("nutzt gepinnte tägliche Empfehlungen", () => {
    const daily = getDailyRecommendation(sampleCatalog, new Date("2026-05-01T12:00:00"));

    expect(daily?.id).toBe("episode-kaese");
  });

  it("bleibt deterministisch, wenn keine Pin-Datei vorhanden ist", () => {
    const catalog = { ...sampleCatalog, dailyRecommendations: {} };
    const first = getDailyRecommendation(catalog, new Date("2026-05-02T12:00:00"));
    const second = getDailyRecommendation(catalog, new Date("2026-05-02T18:00:00"));

    expect(first?.id).toBe(second?.id);
  });

  it("faellt bei nicht verfügbarer gepinnter Folge zurück", () => {
    const catalog = {
      ...sampleCatalog,
      dailyRecommendations: { "2026-05-01": "missing" },
    };

    expect(getDailyRecommendation(catalog, new Date("2026-05-01T12:00:00"))?.id).toBeTruthy();
  });

  it("liefert diverse Empfehlungen bei wenig Daten", () => {
    const group = getRecommendationGroup(sampleEpisodes, createProfile(), 3);

    expect(group.title).toBe("Zum Entdecken");
    expect(group.episodes).toHaveLength(3);
  });

  it("personalisiert lokal und schliesst gesehene Folgen aus", () => {
    let profile = createProfile();
    profile = markEpisodeSeen(profile, "episode-kaese");
    profile = markEpisodeSeen(profile, "episode-roboter");
    profile = toggleBookmark(profile, "episode-zug");

    const group = getRecommendationGroup(sampleEpisodes, profile, 4);

    expect(group.title).toBe("Fuer dich");
    expect(group.episodes.map((episode) => episode.id)).not.toContain("episode-kaese");
  });

  it("findet ähnliche Folgen über Themen und Checker", () => {
    const similar = getSimilarEpisodes(sampleEpisodes[0]!, sampleEpisodes, createProfile());

    expect(similar[0]?.id).toBe("episode-roboter");
  });
});
