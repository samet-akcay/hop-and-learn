import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const adjacentDist = join(here, "dist");
const projectDist = join(here, "../dist");
const defaultRoot = existsSync(join(adjacentDist, "index.html")) ? adjacentDist : projectDist;
const root = resolve(process.env.SPACE_BASE_ROOT ?? defaultRoot);
const host = "127.0.0.1";
const port = Number(process.env.PORT ?? 4317);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".woff2": "font/woff2", ".mp4": "audio/mp4", ".webm": "audio/webm",
};
const csp = "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self'; media-src 'self' blob:; worker-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'";

function sendFile(res, file) {
  res.writeHead(200, {
    "Content-Type": types[extname(file)] ?? "application/octet-stream",
    "Content-Security-Policy": csp,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": file.includes(`${sep}assets${sep}`) ? "public, max-age=31536000, immutable" : "no-cache",
  });
  createReadStream(file).pipe(res);
}

const server = createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405).end(); return; }
  const path = decodeURIComponent(new URL(req.url ?? "/", `http://${host}:${port}`).pathname);
  const relative = normalize(path).replace(/^([/\\]|\.\.(?:[/\\]|$))+/, "");
  let file = resolve(root, relative || "index.html");
  if (!file.startsWith(root + sep) && file !== join(root, "index.html")) { res.writeHead(403).end(); return; }
  if (!existsSync(file) || !statSync(file).isFile()) file = join(root, "index.html");
  if (req.method === "HEAD") {
    res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream", "Content-Security-Policy": csp, "X-Content-Type-Options": "nosniff" }).end();
  } else sendFile(res, file);
});
let retryTimer;
server.on("error", error => {
  if (error.code === "EADDRINUSE") {
    // A second macOS account can use the first account's local server. Keep
    // this LaunchAgent alive and take over if the other account logs out.
    retryTimer ??= setTimeout(() => {
      retryTimer = undefined;
      server.listen(port, host);
    }, 30_000);
    return;
  }
  console.error(error);
  process.exit(1);
});
server.listen(port, host, () => console.log(`Maths Mission Control: http://${host}:${port} (serving ${root})`));
