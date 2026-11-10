# Connecting your first client

A seven-step visual guide for connecting a client to the TAISK Practice Portal through Xero.

Live page: https://guifry.github.io/practice-onboarding-guide/

## Editing

Everything is static: no build step, no dependencies.

- `index.html` — one `<section class="slide">` per screen. Add a slide by copying the pattern and giving it `data-key` (the URL hash), `data-title` and `data-step`.
- `styles.css` — tokens at the top (colour, type, radii) then layout, controls, lightbox and overview.
- `app.js` — navigation, progress, dots, deep links, keyboard, swipe, image zoom and the overview grid.
- `assets/` — screenshots, one per step, plus the wordmark.

## Navigation

Left/right arrows, page up/down, `Home`/`End`, `O` for the overview, `Esc` to close an overlay, or the buttons and dots at the bottom. Every step has its own URL hash, so a link can point straight at a step.

## Deploying

Served by GitHub Pages from the `main` branch root. Push to `main` and the page rebuilds itself.
