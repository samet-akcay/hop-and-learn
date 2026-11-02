import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, copyFileSync, chmodSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync("npm", ["run", "build"], { cwd: project, stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);
const shared = "/Users/Shared/spacebase";
mkdirSync(shared, { recursive: true, mode: 0o755 });
rmSync(resolve(shared, "dist"), { recursive: true, force: true });
mkdirSync(resolve(shared, "dist"), { recursive: true, mode: 0o755 });
cpSync(resolve(project, "dist"), resolve(shared, "dist"), { recursive: true, force: true });
copyFileSync(resolve(project, "scripts/serve.mjs"), resolve(shared, "serve.mjs"));
chmodSync(resolve(shared, "serve.mjs"), 0o755);
copyFileSync(resolve(project, "scripts/com.spacebase.server.plist"), resolve(shared, "com.spacebase.server.plist"));
console.log(`Built app copied to ${shared}.`);
console.log("Install the shared LaunchAgent in each macOS account; see PLAN.md §13.");
