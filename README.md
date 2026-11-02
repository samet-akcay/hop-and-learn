# Hop & Learn

A simple, offline maths and learning game for a family Mac, built in the spirit of the original Math Play game (`legacy/index.html`).

## How it works

- **Menu:** pick a hero, then a game. Number Line, Number Bonds and Times Tables are the big cards at the top; the other 28 games (more maths, code and words) are below.
- **Play:** do the work on the picture (HOP, COUNT or GROUP), then choose one of three big answers. A wrong answer greys out with a calm "Uh oh. That's okay. Let's fix it."; every right answer earns a star, with a celebration every 10 stars. ⌂ goes back to the menu.
- **Grown-up corner:** hold the ⚙ on the menu for 2 seconds (or press Ctrl + Shift + G). Set *Numbers up to* 10 / 20 / 100, + / −, the most hops, bonds to 10 or 20, which times tables, Easy / Medium / Hard for the other games, which games show on the menu, sound and read-aloud, and reset stars.

Progress and settings are saved in the browser on this Mac only (`localStorage`). Nothing is sent anywhere.

## Run it

```sh
npm install
npm run dev        # http://localhost:4317
```

## Install as a Safari app

```sh
npm run deploy         # builds and copies the app to /Users/Shared/spacebase
npm run install:agent  # serves it at http://localhost:4317 on login
```

Then open `http://localhost:4317` in Safari and choose **File → Add to Dock**.

## Play it on another computer

The game is published at **https://samet-akcay.github.io/hop-and-learn/**. On any Mac:

1. Open that address in Safari.
2. Choose **File → Add to Dock**. It now opens like an app and works offline.

Every push to `main` rebuilds and publishes the site (`.github/workflows/pages.yml`); the next time the game is opened with internet, it loads the new version. Stars and settings stay on each computer separately.

## Checks

```sh
npm run check       # production build + unit/component tests
npm run test:e2e    # browser checks in Chromium and WebKit
```
