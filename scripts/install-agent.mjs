import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const sharedPlist = "/Users/Shared/spacebase/com.spacebase.server.plist";
if (!existsSync(sharedPlist)) {
  console.error("The app is not deployed yet. Run `npm run deploy` first.");
  process.exit(1);
}
const launchAgents = join(homedir(), "Library", "LaunchAgents");
const destination = join(launchAgents, "com.spacebase.server.plist");
mkdirSync(launchAgents, { recursive: true });
copyFileSync(sharedPlist, destination);
const uid = process.getuid?.();
if (uid === undefined) {
  console.log(`LaunchAgent installed at ${destination}. Load it with launchctl in this macOS account.`);
  process.exit(0);
}
try {
  execFileSync("launchctl", ["bootstrap", `gui/${uid}`, resolve(destination)], { stdio: "ignore" });
} catch {
  try { execFileSync("launchctl", ["kickstart", "-k", `gui/${uid}/com.spacebase.server`], { stdio: "ignore" }); }
  catch { console.log("Agent installed. Log out and back in, or load it using the instructions in PLAN.md §13."); }
}
console.log("Local server is set to start at login in this macOS account.");
console.log("Open http://localhost:4317 in Safari, then choose File → Add to Dock.");
