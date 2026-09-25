import react from "@vitejs/plugin-react";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [...coverageConfigDefaults.exclude, "src/index.tsx"],
      reporter: ["text", "html", "lcov"],
      thresholds: { perFile: true, branches: 100, functions: 100, lines: 100, statements: 100 },
    },
  },
});
