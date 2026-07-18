import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const testCatalog = {
  schemaVersion: 1,
  catalogVersion: "e2e-catalog",
  generatedAt: "2026-05-01T00:00:00Z",
  source: { kind: "youtube-data-api", channelHandle: "@CHECKERWELT", channelId: "channel-test" },
  topics: ["Essen", "Fahrzeuge", "Natur", "Technik", "Tiere", "Wissenschaft"],
  checkers: ["Can", "Julian", "Marina", "Tobi"],
  dailyRecommendations: { "2026-05-01": "episode-kaese" },
  episodes: [
    episode("episode-kaese", "AAAAAAAAAAA", "Checker Tobi: Der Käse-Check", "Tobi", [
      "Essen",
      "Wissenschaft",
    ]),
    episode("episode-wald", "BBBBBBBBBBB", "Checker Julian: Der Wald-Check", "Julian", [
      "Natur",
      "Tiere",
    ]),
    episode("episode-roboter", "CCCCCCCCCCC", "Checker Marina: Der Roboter-Check", "Marina", [
      "Technik",
      "Wissenschaft",
    ]),
    episode("episode-zug", "DDDDDDDDDDD", "Checker Can: Der Zug-Check", "Can", [
      "Fahrzeuge",
      "Technik",
    ]),
  ],
};

test.beforeEach(async ({ context, page }) => {
  await context.route("https://www.youtube.com/watch?**", async (route) => {
    await route.fulfill({
      contentType: "text/html",
      body: "<title>YouTube Stub</title><h1>YouTube Stub</h1>",
    });
  });

  await page.route("**/catalog/episodes.json", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(testCatalog),
    });
  });
  await page.addInitScript(() => window.localStorage.clear());
});

test("erster Besuch initialisiert Profil und Hinweis", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Heute empfohlen" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Das könnte dir gefallen" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Alle Folgen anzeigen/ })).toBeVisible();
  await expect(page.getByText(/Profil bleibt nur in diesem Browser/)).toBeVisible();
  await page.getByRole("button", { name: "Verstanden" }).click();
  await expect(page.getByText(/Profil bleibt nur in diesem Browser/)).toBeHidden();
});

test("gesehen aktualisiert Profil und entfernt aus Zufallsauswahl", async ({ page }) => {
  await page.goto("/#/folge/episode-kaese");
  await page
    .getByRole("button", { name: /Als gesehen markieren/ })
    .first()
    .click();
  await expect(page.locator(".status-badge.good", { hasText: "Gesehen" })).toBeVisible();

  await page.goto("/#/profil");
  await expect(page.getByText("25%")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gesehene Folgen" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Checker Tobi: Der Käse-Check" })).toBeVisible();

  await page.goto("/#/zufallsauswahl");
  for (let index = 0; index < 4; index += 1) {
    await page.getByRole("button", { name: "Karte ziehen", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Gezogene Folge" })).toBeVisible();
    await expect(page.getByText("Checker Tobi: Der Käse-Check")).toHaveCount(0);
  }

  await page.goto("/#/folge/episode-kaese");
  await page
    .getByRole("button", { name: /Nicht mehr gesehen/ })
    .first()
    .click();
  await expect(page.locator(".detail-copy .status-badge.good", { hasText: "Gesehen" })).toHaveCount(
    0,
  );
});

test("merkliste und gesehen-gewinnt-regel", async ({ page }) => {
  await page.goto("/#/folge/episode-wald");
  await page.getByRole("button", { name: "Merken" }).first().click();
  await page.goto("/#/profil");
  await expect(page.getByRole("heading", { name: "Checker Julian: Der Wald-Check" })).toBeVisible();

  await page.goto("/#/folge/episode-wald");
  await page
    .getByRole("button", { name: /Als gesehen markieren/ })
    .first()
    .click();
  await page.goto("/#/profil");
  await expect(page.getByText("Keine gemerkten Folgen")).toBeVisible();
});

test("zufallsauswahl Ergebnis, externer Link und All-seen-Zustand", async ({ page }) => {
  await page.goto("/#/zufallsauswahl");
  await page.getByRole("button", { name: "Karte ziehen", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Gezogene Folge" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Auf YouTube ansehen/ })).toHaveAttribute(
    "href",
    /youtube\.com\/watch\?v=/,
  );

  for (const entry of testCatalog.episodes) {
    await page.goto(`/#/folge/${entry.id}`);
    await page
      .getByRole("button", { name: /Als gesehen markieren/ })
      .first()
      .click();
  }

  await page.goto("/#/zufallsauswahl");
  await page.getByRole("button", { name: "Karte ziehen", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Du hast alle Checker-Folgen entdeckt." }),
  ).toBeVisible();
});

test("swipen unterstützt Buttons, Pfeiltasten, Swipe und Klick", async ({ page, context }) => {
  await page.goto("/#/swipen");
  await expect(page.getByRole("heading", { name: "Swipen" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Weiter/ })).toBeVisible();
  await page.getByRole("button", { name: /Weiter/ }).click();
  await page.keyboard.press("ArrowLeft");

  const card = page.locator(".discover-card");
  const box = await card.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 10, box.y + box.height / 2);
    await page.mouse.up();
  }

  const popupPromise = context.waitForEvent("page");
  await card.click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/youtube\.com\/watch\?v=/);
  await popup.close();
});

test("suche findet Titel, Tags, Checker und Leerzustand", async ({ page }) => {
  await page.goto("/#/suche");
  await page.getByPlaceholder("Titel oder Thema").fill("kaese");
  await expect(page.getByText("Checker Tobi: Der Käse-Check")).toBeVisible();

  await page.getByPlaceholder("Titel oder Thema").fill("");
  await page.getByRole("combobox", { name: /Thema/ }).selectOption("Technik");
  await expect(page.getByText("Checker Can: Der Zug-Check")).toBeVisible();
  await page.getByRole("combobox", { name: /Checker/ }).selectOption("Tobi");
  await expect(page.getByText("Keine Suchtreffer")).toBeVisible();
});

test("export, importvorschau, ersetzen und ungültige Datei", async ({ page }) => {
  await page.goto("/#/profil");
  await expect(
    page.getByText(/Deine Daten werden nur in diesem Browser gespeichert/),
  ).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Exportieren/ }).click();
  expect((await download).suggestedFilename()).toContain("checker-guide-profil");

  await page.getByRole("button", { name: /Importieren/ }).click();
  await page.setInputFiles('input[type="file"]', {
    name: "profil.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, seenEpisodeIds: ["episode-zug"], bookmarkedEpisodeIds: [] }),
    ),
  });
  await expect(page.getByText(/1 gesehene Folgen/)).toBeVisible();
  await page.getByRole("button", { name: /Ersetzen/ }).click();
  await expect(page.getByText("25%")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Checker Can: Der Zug-Check" })).toBeVisible();

  await page.getByRole("button", { name: /Importieren/ }).click();
  await page.setInputFiles('input[type="file"]', {
    name: "kaputt.json",
    mimeType: "application/json",
    buffer: Buffer.from("{kaputt"),
  });
  await expect(page.getByText("Importdatei ungültig.")).toBeVisible();
});

test("responsive, accessibility, eckiges Design und Datenschutz-Smoke", async ({ page }) => {
  const blockedHosts: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (/analytics|doubleclick|googletagmanager|youtube\.com\/embed/.test(url)) {
      blockedHosts.push(url);
    }
  });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Checker Guide" })).toBeVisible();
  }

  await page.goto("/#/zufallsauswahl");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(
    accessibilityScanResults.violations.filter((violation) => violation.impact === "critical"),
  ).toEqual([]);

  const buttonRadius = await page
    .getByRole("button", { name: "Karte ziehen" })
    .evaluate((element) => {
      return getComputedStyle(element).borderRadius;
    });
  const stackRadius = await page.locator(".stack-card.front").evaluate((element) => {
    return getComputedStyle(element).borderRadius;
  });
  expect(buttonRadius).toBe("0px");
  expect(stackRadius).toBe("0px");
  expect(await page.locator("iframe").count()).toBe(0);
  expect(blockedHosts).toEqual([]);
});

function episode(id: string, youtubeId: string, title: string, checker: string, topics: string[]) {
  return {
    id,
    youtubeId,
    title,
    checker,
    topics,
    description: `${title} Beschreibung`,
    publishedAt: "2026-01-01T00:00:00Z",
    durationSeconds: 1500,
    thumbnail: {
      url: "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
      width: 480,
      height: 270,
    },
    available: true,
  };
}
