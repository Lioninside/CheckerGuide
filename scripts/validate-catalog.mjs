import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const production = process.argv.includes("--production");
const catalogPath = resolve("public/catalog/episodes.json");

try {
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const result = validateCatalog(catalog, production);

  for (const warning of result.warnings) {
    console.warn(`WARN ${warning}`);
  }

  if (!result.ok) {
    for (const error of result.errors) {
      console.error(`ERROR ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `Catalog ok: ${catalog.episodes.length} Folgen, ${availableEpisodes(catalog).length} verfügbar.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function validateCatalog(catalog, isProduction) {
  const errors = [];
  const warnings = [];
  if (!catalog || typeof catalog !== "object" || Array.isArray(catalog)) {
    errors.push("Katalog muss ein Objekt sein.");
    return { ok: false, errors, warnings };
  }

  const ids = new Set();
  const youtubeIds = new Set();
  const topics = new Set(catalog.topics ?? []);

  if (catalog.schemaVersion !== 1) {
    errors.push("catalog.schemaVersion muss 1 sein.");
  }

  if (typeof catalog.catalogVersion !== "string" || catalog.catalogVersion.trim() === "") {
    errors.push("catalog.catalogVersion fehlt.");
  }

  if (!Array.isArray(catalog.episodes)) {
    errors.push("catalog.episodes muss ein Array sein.");
    return { ok: false, errors, warnings };
  }

  if (isProduction && availableEpisodes(catalog).length === 0) {
    errors.push("Production-Deployment mit leerem Katalog ist blockiert.");
  }

  for (const episode of catalog.episodes) {
    if (!episode || typeof episode !== "object") {
      errors.push("Eine Folge ist kein Objekt.");
      continue;
    }

    if (typeof episode.id !== "string" || episode.id.trim() === "") {
      errors.push("Eine Folge hat keine id.");
    } else if (ids.has(episode.id)) {
      errors.push(`Doppelte Folgen-id: ${episode.id}`);
    } else {
      ids.add(episode.id);
    }

    if (typeof episode.youtubeId !== "string" || !/^[A-Za-z0-9_-]{11}$/.test(episode.youtubeId)) {
      errors.push(`Ungültige YouTube-ID für ${episode.id ?? "unbekannt"}: ${episode.youtubeId}`);
    } else if (youtubeIds.has(episode.youtubeId)) {
      errors.push(`Doppelte YouTube-ID: ${episode.youtubeId}`);
    } else {
      youtubeIds.add(episode.youtubeId);
    }

    if (typeof episode.title !== "string" || episode.title.trim() === "") {
      errors.push(`Folge ${episode.id ?? "unbekannt"} hat keinen Titel.`);
    }

    if (typeof episode.checker !== "string" || episode.checker.trim() === "") {
      errors.push(`Folge ${episode.id ?? "unbekannt"} hat keinen Checker.`);
    }

    if (!Array.isArray(episode.topics) || episode.topics.length === 0) {
      errors.push(`Folge ${episode.id ?? "unbekannt"} hat keine Themen.`);
    } else {
      for (const topic of episode.topics) {
        if (!topics.has(topic)) {
          warnings.push(`Folge ${episode.id} verwendet ein nicht registriertes Thema: ${topic}`);
        }
      }
    }

    if (episode.thumbnail !== undefined) {
      if (!episode.thumbnail || typeof episode.thumbnail !== "object") {
        errors.push(`Folge ${episode.id ?? "unbekannt"} hat kein gueltiges Thumbnail.`);
      } else {
        if (typeof episode.thumbnail.url !== "string" || episode.thumbnail.url.trim() === "") {
          errors.push(`Folge ${episode.id ?? "unbekannt"} hat kein gueltiges Thumbnail.`);
        }
        if (
          typeof episode.thumbnail.width !== "number" ||
          typeof episode.thumbnail.height !== "number" ||
          episode.thumbnail.width <= 0 ||
          episode.thumbnail.height <= 0
        ) {
          errors.push(`Folge ${episode.id ?? "unbekannt"} hat ungültige Thumbnail-Abmessungen.`);
        }
      }
    }

    if (typeof episode.publishedAt === "string" && Number.isNaN(Date.parse(episode.publishedAt))) {
      warnings.push(
        `Folge ${episode.id ?? "unbekannt"} hat ein ungültiges Veröffentlichungsdatum.`,
      );
    }

    if (
      episode.durationSeconds !== undefined &&
      (typeof episode.durationSeconds !== "number" || episode.durationSeconds <= 0)
    ) {
      errors.push(`Folge ${episode.id ?? "unbekannt"} hat eine ungültige Dauer.`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

function availableEpisodes(catalog) {
  return (catalog.episodes ?? []).filter((episode) => episode.available && !episode.needsReview);
}
