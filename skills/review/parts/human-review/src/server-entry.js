import { start } from "./server.js";

const port = Number(process.env.HUMAN_REVIEW_PORT || 0);
try {
  await start(port);
} catch {
  // start() already reported the cause (e.g. HUMAN_REVIEW_PORT in use).
  process.exit(1);
}

// The detached server exits on its own once idle (see IDLE_SHUTDOWN_MS).
process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
