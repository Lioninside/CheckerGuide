import { describe, expect, it } from "vitest";

import { sampleCatalog, sampleEpisodes } from "../test/fixtures";
import { parseCatalog, validateCatalog } from "./catalog";
import { getStableDiscoverOrder } from "./discover";
import { createProfile, markEpisodeSeen } from "./profile";
import { classifyYoutubeVideo, inferTopics, parseYoutubeDuration } from "./youtube";
import { ALL_SEEN_MESSAGE, getWheelPool, pickWheelEpisode } from "./wheel";

describe("wheel", () => {
  it("verwendet nur ungesehene Kandidaten", () => {
    const profile = markEpisodeSeen(createProfile(), "episode-kaese");

    expect(getWheelPool(sampleEpisodes, profile).map((episode) => episode.id)).not.toContain(
      "episode-kaese",
    );
  });

  it("meldet den All-seen-Zustand exakt", () => {
    let profile = createProfile();
    for (const episode of sampleEpisodes) {
      profile = markEpisodeSeen(profile, episode.id);
    }

    expect(pickWheelEpisode(sampleEpisodes, profile).message).toBe(ALL_SEEN_MESSAGE);
  });

  it("vermeidet unmittelbare Wiederholung, wenn genug Folgen vorhanden sind", () => {
    const profile = { ...createProfile(), wheelHistory: ["episode-kaese"] };
    const result = pickWheelEpisode(sampleEpisodes, profile, () => 0);

    expect(result.episode?.id).not.toBe("episode-kaese");
  });
});

describe("discover", () => {
  it("erzeugt eine stabile Swipe-Reihenfolge", () => {
    const profile = createProfile(new Date("2026-01-01T00:00:00Z"));

    const first = getStableDiscoverOrder(sampleEpisodes, profile, "v1");
    const second = getStableDiscoverOrder(sampleEpisodes, profile, "v1");

    expect(first.order).toEqual(second.order);
  });

  it("integriert neue Katalogeinträge ohne Chaos", () => {
    const profile = {
      ...createProfile(new Date("2026-01-01T00:00:00Z")),
      discoverOrder: { catalogVersion: "v1", episodeIds: ["episode-wald"] },
    };

    const order = getStableDiscoverOrder(sampleEpisodes, profile, "v1").order;

    expect(order[0]).toBe("episode-wald");
    expect(order).toHaveLength(sampleEpisodes.length);
  });
});

describe("catalog and youtube helpers", () => {
  it("validiert das Katalogschema und Duplikate", () => {
    expect(validateCatalog(sampleCatalog).ok).toBe(true);
    expect(
      validateCatalog({ ...sampleCatalog, episodes: [sampleEpisodes[0]!, sampleEpisodes[0]!] }).ok,
    ).toBe(false);
  });

  it("blockiert Folgen ohne Themen und fehlerhafte Thumbnails", () => {
    const withoutTopics = { ...sampleEpisodes[0]!, topics: [] };
    const withBrokenThumbnail = {
      ...sampleEpisodes[1]!,
      thumbnail: { url: "", width: 0, height: 270 },
    };

    const result = validateCatalog({
      ...sampleCatalog,
      episodes: [withoutTopics, withBrokenThumbnail],
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Folge episode-kaese hat keine Themen.");
    expect(result.errors).toContain("Folge episode-wald hat kein gültiges Thumbnail.");
    expect(result.errors).toContain("Folge episode-wald hat ungültige Thumbnail-Abmessungen.");
  });

  it("warnt bei ungültigen Veröffentlichungsdaten", () => {
    const result = validateCatalog({
      ...sampleCatalog,
      episodes: [{ ...sampleEpisodes[0]!, publishedAt: "kein-datum" }],
    });

    expect(result.ok).toBe(true);
    expect(result.warnings).toContain(
      "Folge episode-kaese hat ein ungültiges Veröffentlichungsdatum.",
    );
  });

  it("blockiert leere Produktionskataloge", () => {
    expect(validateCatalog({ ...sampleCatalog, episodes: [] }, true).ok).toBe(false);
  });

  it("parsed den Katalog robust", () => {
    expect(parseCatalog(sampleCatalog).episodes).toHaveLength(sampleEpisodes.length);
  });

  it("parsed YouTube-Dauern", () => {
    expect(parseYoutubeDuration("PT25M30S")).toBe(1530);
  });

  it("klassifiziert kurze Clips und reguläre Folgen", () => {
    expect(
      classifyYoutubeVideo({
        id: "short",
        title: "Checker Tobi: Trailer",
        duration: "PT1M",
      }).include,
    ).toBe(false);
    expect(
      classifyYoutubeVideo({
        id: "full",
        title: "Checker Tobi: Der Wald-Check",
        duration: "PT25M",
      }).include,
    ).toBe(true);
  });

  it("weist Themen datengetrieben zu", () => {
    expect(
      inferTopics("Der Roboter-Check", "Im Labor steht ein Roboter.", ["Technik", "Tiere"]),
    ).toEqual(["Technik"]);
  });
});
