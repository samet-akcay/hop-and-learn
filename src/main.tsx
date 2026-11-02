import { render } from "preact";
import { PlayApp } from "./play/PlayApp";
import { loadPlayData } from "./play/settings";
import "./styles.css";
import "./play/play.css";

const mount = document.getElementById("app");
if (!mount) throw new Error("Could not find the app mount point.");

render(<PlayApp initialData={loadPlayData()} />, mount);
if (import.meta.env.PROD && "serviceWorker" in navigator && location.protocol !== "file:") {
  void navigator.serviceWorker.register("sw.js").catch(() => undefined);
}
