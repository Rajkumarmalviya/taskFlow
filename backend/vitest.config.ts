import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"],
    // Ensure NODE_ENV is set before imports so the config/db modules pick it up
    env: {
      NODE_ENV: "test",
    },
  },
});
