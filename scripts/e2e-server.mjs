import process from "node:process";
import { createServer } from "vite";

const server = await createServer({
  server: {
    host: "127.0.0.1",
    port: 5198,
    strictPort: true,
  },
});

await server.listen();
server.printUrls();

let closing = false;
async function closeServer() {
  if (closing) {
    return;
  }
  closing = true;
  await server.close();
  process.exit(0);
}

process.on("SIGINT", () => {
  void closeServer();
});
process.on("SIGTERM", () => {
  void closeServer();
});
