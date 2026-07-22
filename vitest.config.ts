import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    // RLS tests share seeded fixtures; run files sequentially.
    fileParallelism: false,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
