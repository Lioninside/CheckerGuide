import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const dryRun = process.argv.includes("--dry-run");
const key = process.env.YOUTUBE_API_KEY;
const channelIdFromEnv = process.env.YOUTUBE_CHANNEL_ID;
const channelHandle = process.env.YOUTUBE_CHANNEL_HANDLE ?? "@CHECKERWELT";
const catalogPath = resolve("public/catalog/episodes.json");
const overridesPath = resolve("public/catalog/review-overrides.json");
const needsReviewPath = resolve("public/catalog/needs-review.json");

if (!key) {
  const message = "YOUTUBE_API_KEY fehlt. Es wurden keine YouTube-Daten abgerufen.";
  if (dryRun) {
    console.log(message);
    process.exit(0);
  }
  console.error(message);
  process.exit(1);
}

const currentCatalog = JSON.parse(await readFile(catalogPath, "utf8"));
const overrides = JSON.parse(await readFile(overridesPath, "utf8"));
const taxonomy = currentCatalog.topics ?? [];

const channel = channelIdFromEnv
  ? await getChannelById(channelIdFromEnv)
  : await getChannelByHandle(channelHandle);

if (!channel) {
  console.error("YouTube-Kanal konnte nicht gefunden werden.");
  process.exit(1);
}

const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;
const playlistItems = await getAllPlaylistItems(uploadsPlaylistId);
const videoIds = playlistItems.map((item) => item.contentDetails.videoId);
const videos = await getVideos(videoIds);

const forcedInclude = new Set(overrides.forcedInclude ?? []);
const forcedExclude = new Set(overrides.forcedExclude ?? []);
const titleCorrections = overrides.titleCorrections ?? {};
const topicCorrections = overrides.topicCorrections ?? {};
const checkerCorrections = overrides.checkerCorrections ?? {};

const included = [];
const needsReview = [];

for (const video of videos) {
  const id = video.id;
  if (forcedExclude.has(id)) {
    continue;
  }

  const title = titleCorrections[id] ?? video.snippet.title;
  const description = cleanDescription(video.snippet.description ?? "");
  const classification = classifyVideo({
    id,
    title,
    duration: video.contentDetails.duration,
  });
  const checker = checkerCorrections[id] ?? extractChecker(title);
  const topics = topicCorrections[id] ?? inferTopics(title, description, taxonomy);
  const include = forcedInclude.has(id) || (classification.include && checker && topics.length > 0);

  const episode = {
    id: `youtube-${id}`,
    youtubeId: id,
    title,
    checker: checker ?? "",
    topics,
    description,
    publishedAt: video.snippet.publishedAt,
    durationSeconds: classification.durationSeconds,
    thumbnail: chooseThumbnail(video.snippet.thumbnails),
    available: video.status.privacyStatus === "public",
    needsReview: !include,
  };

  if (include) {
    included.push({ ...episode, needsReview: false });
  } else if (classification.needsReview || forcedInclude.has(id)) {
    needsReview.push({ ...episode, reviewReasons: classification.reasons });
  }
}

included.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id));
needsReview.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id));

const now = new Date();
const dailyRecommendations = {
  ...(currentCatalog.dailyRecommendations ?? {}),
};
const todayKey = formatDateKey(now);
if (
  !dailyRecommendations[todayKey] ||
  !included.some((episode) => episode.id === dailyRecommendations[todayKey])
) {
  dailyRecommendations[todayKey] = pickDaily(included, todayKey);
}

const nextCatalog = {
  schemaVersion: 1,
  catalogVersion: `youtube-${now.toISOString()}`,
  generatedAt: now.toISOString(),
  source: {
    kind: "youtube-data-api",
    channelHandle,
    channelId: channel.id,
  },
  topics: taxonomy,
  checkers: [...new Set(included.map((episode) => episode.checker).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "de"),
  ),
  dailyRecommendations,
  episodes: included,
};

if (dryRun) {
  console.log(
    `Dry run: ${included.length} Folgen würden übernommen, ${needsReview.length} Videos brauchen Review.`,
  );
} else {
  await writeFile(catalogPath, `${JSON.stringify(nextCatalog, null, 2)}\n`, "utf8");
  await writeFile(needsReviewPath, `${JSON.stringify(needsReview, null, 2)}\n`, "utf8");
  console.log(
    `${included.length} Folgen geschrieben. ${needsReview.length} Videos brauchen Review.`,
  );
}

async function getChannelById(channelId) {
  const response = await youtube("channels", {
    part: "contentDetails,snippet",
    id: channelId,
  });
  return response.items?.[0] ?? null;
}

async function getChannelByHandle(handle) {
  const response = await youtube("channels", {
    part: "contentDetails,snippet",
    forHandle: handle.replace(/^@/, ""),
  });
  return response.items?.[0] ?? null;
}

async function getAllPlaylistItems(playlistId) {
  const items = [];
  let pageToken = undefined;
  do {
    const response = await youtube("playlistItems", {
      part: "contentDetails",
      playlistId,
      maxResults: "50",
      pageToken,
    });
    items.push(...(response.items ?? []));
    pageToken = response.nextPageToken;
  } while (pageToken);
  return items;
}

async function getVideos(videoIds) {
  const chunks = [];
  for (let index = 0; index < videoIds.length; index += 50) {
    chunks.push(videoIds.slice(index, index + 50));
  }
  const videos = [];
  for (const chunk of chunks) {
    const response = await youtube("videos", {
      part: "snippet,contentDetails,status",
      id: chunk.join(","),
      maxResults: "50",
    });
    videos.push(...(response.items ?? []));
  }
  return videos;
}

async function youtube(resource, params) {
  const url = new URL(`${API_BASE}/${resource}`);
  for (const [param, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(param, String(value));
    }
  }
  url.searchParams.set("key", key);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`YouTube API Fehler ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

function chooseThumbnail(thumbnails) {
  const thumbnail =
    thumbnails?.maxres ?? thumbnails?.standard ?? thumbnails?.high ?? thumbnails?.medium;
  if (!thumbnail?.url) {
    return undefined;
  }
  return {
    url: thumbnail.url,
    width: thumbnail.width ?? 480,
    height: thumbnail.height ?? 360,
  };
}

function parseDuration(duration) {
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(duration);
  if (!match) {
    throw new Error(`Ungültige YouTube-Dauer: ${duration}`);
  }
  return (
    Number(match[1] ?? 0) * 86400 +
    Number(match[2] ?? 0) * 3600 +
    Number(match[3] ?? 0) * 60 +
    Number(match[4] ?? 0)
  );
}

function classifyVideo(input) {
  const durationSeconds = parseDuration(input.duration);
  const reasons = [];
  const title = input.title;
  const excluded = [
    /\bshorts?\b/i,
    /\btrailer\b/i,
    /\bteaser\b/i,
    /\bquick\s*check\b/i,
    /\bchexperiment/i,
    /\bmaking[-\s]?of\b/i,
    /\bbest[-\s]?of\b/i,
    /\bmusikvideo\b/i,
    /\bclip\b/i,
    /\bausschnitt\b/i,
  ];

  if (durationSeconds < 15 * 60) {
    reasons.push("zu kurz");
  }
  if (durationSeconds > 35 * 60) {
    reasons.push("ungewoehnlich lang");
  }
  if (!/\bChecker(in)?\s+(Tobi|Julian|Marina|Can)\b/i.test(title)) {
    reasons.push("Checker nicht sicher erkannt");
  }
  for (const pattern of excluded) {
    if (pattern.test(title)) {
      reasons.push(`ausgeschlossenes Titelmuster ${pattern.source}`);
    }
  }

  return {
    include: reasons.length === 0,
    needsReview: durationSeconds >= 15 * 60 && durationSeconds <= 35 * 60,
    reasons,
    durationSeconds,
  };
}

function extractChecker(title) {
  return /\bChecker(?:in)?\s+(Tobi|Julian|Marina|Can)\b/i.exec(title)?.[1] ?? null;
}

function cleanDescription(description) {
  return description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !/^https?:\/\//i.test(line))
    .slice(0, 3)
    .join(" ")
    .replace(/\s+/g, " ")
    .slice(0, 280);
}

function inferTopics(title, description, taxonomy) {
  const source = `${title} ${description}`.toLocaleLowerCase("de");
  const keywords = {
    Abenteuer: ["abenteuer", "expedition"],
    Alltag: ["alltag", "schule", "wohnen"],
    Berufe: ["beruf", "arbeit", "feuerwehr", "polizei"],
    Essen: ["essen", "brot", "kaese", "schokolade", "obst"],
    Fahrzeuge: ["auto", "zug", "bahn", "flugzeug", "schiff", "fahrzeug"],
    Geschichte: ["geschichte", "ritter", "roemer", "museum"],
    Gesellschaft: ["gesellschaft", "demokratie", "rechte", "familie"],
    Gesundheit: ["gesundheit", "krank", "arzt", "medizin"],
    Klima: ["klima", "wetter", "erderwaermung"],
    Koerper: ["koerper", "herz", "haut", "zahn", "auge"],
    Kultur: ["kultur", "theater", "kunst", "musik"],
    Medien: ["medien", "internet", "fernsehen", "radio"],
    Natur: ["natur", "wald", "berge", "fluss", "pflanze"],
    Reisen: ["reise", "reisen", "land", "stadt"],
    Sport: ["sport", "fussball", "ski", "schwimmen"],
    Technik: ["technik", "computer", "roboter", "maschine"],
    Tiere: ["tier", "hund", "katze", "biene", "pferd", "hai"],
    Umwelt: ["umwelt", "muell", "recycling", "plastik"],
    Weltraum: ["weltraum", "mond", "sonne", "planet", "stern"],
    Wissenschaft: ["wissenschaft", "experiment", "forschen", "labor"],
  };
  return taxonomy
    .filter(
      (topic) =>
        source.includes(topic.toLocaleLowerCase("de")) ||
        keywords[topic]?.some((keyword) => source.includes(keyword)),
    )
    .slice(0, 5);
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
}

function pickDaily(episodes, dateKey) {
  return (
    [...episodes].sort(
      (a, b) => stableHash(`${dateKey}:${a.id}`) - stableHash(`${dateKey}:${b.id}`),
    )[0]?.id ?? ""
  );
}

function stableHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
