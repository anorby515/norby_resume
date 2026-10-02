# Andy Norby — portfolio

A static site with no build step, designed for desktop. Content lives in `data/`; the page code reads it.

## View locally

Open `index.html` in a browser. Add `?review` to the URL to see draft markers and notes to confirm.

## Publish on GitHub Pages

1. Create a repository and push this folder to the `main` branch.
2. In the repository: **Settings → Pages → Build and deployment**, set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site appears at `https://<username>.github.io/<repo>/` within a minute or two.

`.nojekyll` is included so GitHub serves the files as-is.

## Edit content

- Public content: `data/layer-public.js`.
- Add a project: copy an entry in `projects` and change the `id`.
- Add a tool: add it to `tools`, then reference its id in a project's `how.stack`.
- Schema and section types: `docs/LAYER-SPEC.md`.
- Product decks (Why I built this / How I built this): `data/work/<id>.js` and `assets/work/<id>/`. See `docs/LAYER-SPEC.md`.

## Layers

`data/layers.js` controls which content files load. This repository only ever contains the public layer. Do not commit any other `data/layer-*.js` file here.
