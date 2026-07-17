export interface VideoClassificationInput {
  id: string;
  title: string;
  description?: string;
  duration: string;
}

export interface VideoClassification {
  include: boolean;
  needsReview: boolean;
  reasons: string[];
  durationSeconds: number;
}

const EXCLUDED_TITLE_PATTERNS = [
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

export function parseYoutubeDuration(duration: string): number {
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(duration);
  if (!match) {
    throw new Error(`Ungueltige YouTube-Dauer: ${duration}`);
  }

  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  const seconds = Number(match[4] ?? 0);
  return days * 86_400 + hours * 3_600 + minutes * 60 + seconds;
}

export function classifyYoutubeVideo(input: VideoClassificationInput): VideoClassification {
  const reasons: string[] = [];
  const durationSeconds = parseYoutubeDuration(input.duration);
  const title = input.title.trim();

  if (durationSeconds < 15 * 60) {
    reasons.push("zu kurz fuer eine regulaere vollstaendige Folge");
  }

  if (durationSeconds > 35 * 60) {
    reasons.push("ungewoehnlich lang und reviewpflichtig");
  }

  for (const pattern of EXCLUDED_TITLE_PATTERNS) {
    if (pattern.test(title)) {
      reasons.push(`Titelmuster ausgeschlossen: ${pattern.source}`);
    }
  }

  const looksLikeCheckerEpisode = /\bChecker(in)?\s+(Tobi|Julian|Marina|Can)\b/i.test(title);
  if (!looksLikeCheckerEpisode) {
    reasons.push("Checker konnte nicht sicher aus dem Titel erkannt werden");
  }

  return {
    include: reasons.length === 0,
    needsReview: reasons.length > 0 && durationSeconds >= 15 * 60 && durationSeconds <= 35 * 60,
    reasons,
    durationSeconds,
  };
}

export function extractChecker(title: string): string | null {
  const match = /\bChecker(?:in)?\s+(Tobi|Julian|Marina|Can)\b/i.exec(title);
  return match?.[1] ?? null;
}

export function cleanYoutubeDescription(description: string): string {
  return description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !/^https?:\/\//i.test(line))
    .slice(0, 3)
    .join(" ")
    .replace(/\s+/g, " ")
    .slice(0, 280);
}

export function inferTopics(title: string, description: string, taxonomy: string[]): string[] {
  const source = `${title} ${description}`.toLocaleLowerCase("de");
  const matches = taxonomy.filter((topic) => {
    const normalized = topic.toLocaleLowerCase("de");
    if (source.includes(normalized)) {
      return true;
    }
    return topicKeywordMap[topic]?.some((keyword) => source.includes(keyword)) ?? false;
  });
  return matches.slice(0, 5);
}

const topicKeywordMap: Record<string, string[]> = {
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
