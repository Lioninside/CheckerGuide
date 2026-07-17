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
  webServer: {
    command: "npm run dev -- --port 5198 --strictPort",
    reuseExistingServer: false,
    timeout: 120_000,
    url: "http://127.0.0.1:5198",
  },
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
