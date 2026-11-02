import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4318",
    headless: true,
    viewport: { width: 1440, height: 1000 },
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium", launchOptions: { executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--no-first-run", "--no-default-browser-check"] } } },
    { name: "webkit", use: { browserName: "webkit" } },
    { name: "firefox", use: { browserName: "firefox" } },
  ],
  webServer: {
    command: "npx vite preview --host 127.0.0.1 --port 4318 --strictPort",
    url: "http://localhost:4318",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
