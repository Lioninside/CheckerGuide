import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const windowsBrowserCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
  (process.platform === "win32" && !process.env.CI
    ? windowsBrowserCandidates.find((candidate) => existsSync(candidate))
    : undefined);
const webServer =
  process.env.PLAYWRIGHT_SKIP_WEB_SERVER === "1"
    ? undefined
    : {
        command: "node scripts/e2e-server.mjs",
        reuseExistingServer: false,
        timeout: 120_000,
        url: "http://127.0.0.1:5198",
      };

export default defineConfig({
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:5198",
    trace: "on-first-retry",
  },
  webServer,
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: executablePath ? { executablePath } : undefined,
      },
    },
  ],
});
