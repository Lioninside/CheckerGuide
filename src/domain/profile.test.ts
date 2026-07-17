import { describe, expect, it } from "vitest";

import {
  computeProfileStats,
  createProfile,
  markEpisodeSeen,
  mergeProfiles,
  parseStoredProfile,
  replaceProfile,
  resetProfile,
  toggleBookmark,
  unmarkEpisodeSeen,
  validateProfileImport,
} from "./profile";
import { sampleEpisodes } from "../test/fixtures";

describe("profile domain", () => {
  it("initialisiert ein lokales Profil", () => {
    const profile = createProfile(new Date("2026-01-01T00:00:00Z"));

    expect(profile.version).toBe(1);
    expect(profile.seenEpisodeIds).toEqual([]);
    expect(profile.localNoticeAcknowledged).toBe(false);
  });

  it("migriert alte Profilfelder", () => {
    const result = parseStoredProfile(
      JSON.stringify({
        version: 0,
        seen: ["episode-kaese"],
        bookmarks: ["episode-kaese", "episode-wald"],
      }),
      new Date("2026-01-02T00:00:00Z"),
    );

    expect(result.status).toBe("migrated");
    expect(result.profile.seenEpisodeIds).toEqual(["episode-kaese"]);
    expect(result.profile.bookmarkedEpisodeIds).toEqual(["episode-wald"]);
  });

  it("faengt beschädigtes localStorage ab", () => {
    const result = parseStoredProfile("{nope", new Date("2026-01-01T00:00:00Z"));

    expect(result.status).toBe("corrupted");
    expect(result.profile.seenEpisodeIds).toEqual([]);
  });

  it("validiert Importe inklusive unbekannter Folgen", () => {
    const preview = validateProfileImport(
      {
        version: 1,
        seenEpisodeIds: ["episode-kaese", "missing"],
        bookmarkedEpisodeIds: ["episode-wald"],
      },
      ["episode-kaese", "episode-wald"],
    );

    expect(preview.seenCount).toBe(2);
    expect(preview.unknownEpisodeIds).toEqual(["missing"]);
  });

  it("führt Profile zusammen und gesehen gewinnt gegen Merkliste", () => {
    let current = createProfile();
    current = toggleBookmark(current, "episode-kaese");
    const imported = {
      version: 1,
      seenEpisodeIds: ["episode-kaese"],
      bookmarkedEpisodeIds: ["episode-wald"],
    };

    const merged = mergeProfiles(current, imported);

    expect(merged.seenEpisodeIds).toContain("episode-kaese");
    expect(merged.bookmarkedEpisodeIds).toEqual(["episode-wald"]);
  });

  it("ersetzt Profile sauber", () => {
    const replaced = replaceProfile({
      version: 1,
      seenEpisodeIds: ["episode-kaese"],
      bookmarkedEpisodeIds: ["episode-kaese", "episode-wald"],
    });

    expect(replaced.seenEpisodeIds).toEqual(["episode-kaese"]);
    expect(replaced.bookmarkedEpisodeIds).toEqual(["episode-wald"]);
  });

  it("entfernt Gesehen-Status und setzt zurück", () => {
    const seen = markEpisodeSeen(createProfile(), "episode-kaese");
    const unseen = unmarkEpisodeSeen(seen, "episode-kaese");
    const reset = resetProfile();

    expect(unseen.seenEpisodeIds).toEqual([]);
    expect(reset.localNoticeAcknowledged).toBe(true);
  });

  it("berechnet Lieblingschecker, Lieblingsthema, letzte Folge und Fortschritt", () => {
    let profile = createProfile();
    profile = markEpisodeSeen(profile, "episode-kaese", new Date("2026-01-01T09:00:00Z"));
    profile = markEpisodeSeen(profile, "episode-roboter", new Date("2026-01-01T10:00:00Z"));

    const stats = computeProfileStats(profile, sampleEpisodes);

    expect(stats.favoriteTopic?.value).toBe("Wissenschaft");
    expect(stats.favoriteChecker?.tied).toBe(true);
    expect(stats.lastEpisode?.id).toBe("episode-roboter");
    expect(stats.progressPercent).toBe(50);
  });

  it("erkennt aktuelle Serien und Unterbrechungen", () => {
    let profile = createProfile();
    profile = markEpisodeSeen(profile, "episode-kaese", new Date("2026-01-01T09:00:00Z"));
    profile = markEpisodeSeen(profile, "episode-wald", new Date("2026-01-01T10:00:00Z"));
    profile = markEpisodeSeen(profile, "episode-roboter", new Date("2026-01-01T11:00:00Z"));

    const stats = computeProfileStats(profile, sampleEpisodes);

    expect(stats.currentSeries).toEqual({ checker: "Marina", count: 1, interrupted: true });
    expect(stats.perCheckerProgress.find((entry) => entry.checker === "Tobi")?.seen).toBe(1);
  });
});
