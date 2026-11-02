import { configDefaults, defineConfig } from "vitest/config";

const developmentCsp = "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' ws://127.0.0.1:4317; font-src 'self'; media-src 'self' blob:; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'self'";

export default defineConfig({
  appType: "spa",
  // Relative paths, so the same build runs at localhost:4317 and on GitHub Pages under /hop-and-learn/.
  base: "./",
  server: {
    host: "127.0.0.1",
    port: 4317,
    strictPort: true,
    headers: { "Content-Security-Policy": developmentCsp },
  },
  preview: {
    host: "127.0.0.1",
    port: 4317,
    strictPort: true,
  },
  build: { target: "es2022", sourcemap: false },
  test: {
    environment: "jsdom",
    restoreMocks: true,
    clearMocks: true,
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
  },
});
