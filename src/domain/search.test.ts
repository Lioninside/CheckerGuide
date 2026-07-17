import { describe, expect, it } from "vitest";

import { sampleEpisodes } from "../test/fixtures";
import { normalizeSearchText, searchEpisodes } from "./search";

describe("search", () => {
  it("normalisiert Umlaute, Bindestriche und Gross-/Kleinschreibung", () => {
    expect(normalizeSearchText("KÄSE-Check")).toContain("kaese check");
  });

  it("findet Titel und Themen", () => {
    expect(
      searchEpisodes(sampleEpisodes, { query: "kaese", checker: "", topic: "" }).episodes[0]?.id,
    ).toBe("episode-kaese");
    expect(
      searchEpisodes(sampleEpisodes, { query: "Tiere", checker: "", topic: "" }).episodes[0]?.id,
    ).toBe("episode-wald");
  });

  it("filtert nach Checker, Thema und Kombinationen", () => {
    expect(
      searchEpisodes(sampleEpisodes, { query: "", checker: "Can", topic: "" }).episodes,
    ).toHaveLength(1);
    expect(
      searchEpisodes(sampleEpisodes, { query: "", checker: "", topic: "Technik" }).episodes,
    ).toHaveLength(2);
    expect(
      searchEpisodes(sampleEpisodes, { query: "zug", checker: "Can", topic: "Technik" }).episodes[0]
        ?.id,
    ).toBe("episode-zug");
  });

  it("liefert einen klaren Leerzustand", () => {
    expect(
      searchEpisodes(sampleEpisodes, { query: "Mond", checker: "Tobi", topic: "" }).total,
    ).toBe(0);
  });
});
