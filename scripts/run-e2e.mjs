import { spawn } from "node:child_process";
import process from "node:process";

const serverUrl = "http://127.0.0.1:5198";
const server = spawn(process.execPath, ["scripts/e2e-server.mjs"], {
  env: process.env,
  stdio: ["ignore", "pipe", "pipe"],
});

server.stdout.on("data", (chunk) => process.stdout.write(`[E2E server] ${chunk}`));
server.stderr.on("data", (chunk) => process.stderr.write(`[E2E server] ${chunk}`));

try {
  await waitForServer(serverUrl, 120_000);
  const exitCode = await runPlaywright();
  await stopServer();
  process.exit(exitCode);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  await stopServer();
  process.exit(1);
}

async function runPlaywright() {
  const child = spawn(
    process.execPath,
    ["./node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)],
    {
      env: { ...process.env, PLAYWRIGHT_SKIP_WEB_SERVER: "1" },
      stdio: "inherit",
    },
  );
  return waitForExitCode(child);
}

async function waitForServer(url, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (server.exitCode !== null) {
      throw new Error(`E2E-Server wurde unerwartet beendet: ${server.exitCode}`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until Vite is ready.
    }

    await delay(250);
  }

  throw new Error(`E2E-Server war nach ${timeoutMs} ms nicht erreichbar.`);
}

async function stopServer() {
  if (server.exitCode !== null) {
    return;
  }

  server.kill("SIGTERM");
  const exited = await Promise.race([waitForExitCode(server).then(() => true), timeout(5_000)]);
  if (!exited && server.exitCode === null) {
    server.kill("SIGKILL");
  }
}

function waitForExitCode(child) {
  return new Promise((resolve) => {
    child.once("exit", (code) => resolve(code ?? 1));
  });
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function timeout(ms) {
  await delay(ms);
  return false;
}
