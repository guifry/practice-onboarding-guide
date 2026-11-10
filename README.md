# Connecting your clients

A visual guide to connecting clients to the TAISK Practice Portal, with a separate route for Xero and FreeAgent.

Live page: https://onboarding-guide.taisk.com/

## The two routes

Steps 1 to 3 are shared. At step 3 you pick your accounting software and the deck swaps the remaining steps:

- **Xero** — one client at a time, four steps, seven in total.
- **FreeAgent** — one practice login brings every business across, three steps, six in total.

The choice lives in the header as a Xero / FreeAgent switch and is remembered in `localStorage`. Every step has its own URL hash, so `#fa-2` opens the FreeAgent sign-in step on the FreeAgent route.

## Editing

Everything is static: no build step, no dependencies.

- `index.html` — one `<section class="slide">` per screen. Each slide carries `data-key` (the URL hash), `data-track` (`shared`, `xero` or `fa`), `data-kind` (`cover`, `step` or `end`), `data-title` and `data-short`. Step numbers, dots, eyebrows, cover thumbnails and the closing recap are all generated from those attributes.
- `styles.css` — tokens at the top (colour, type, radii), then layout, controls, fork cards, lightbox and overview.
- `app.js` — route filtering, navigation, progress, deep links, keyboard, swipe, image zoom and the overview grid.
- `assets/` — screenshots and logos.

### Adding a step

Copy an existing `<section class="slide">`, set a new `data-key` and `data-track`, and put it in the DOM after the other slides of that track. Nothing else needs renumbering.

## Navigation

Left/right arrows, page up/down, `Home`/`End`, `O` for the overview, `Esc` to close an overlay, or the buttons and dots at the bottom.

## Deploying

Served by GitHub Pages from the `main` branch root. Push to `main` and the page rebuilds itself.
