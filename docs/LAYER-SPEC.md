# Content layers

The site renders from data files. Page code (`index.html`, `assets/`) never changes to add content.

## How layers load

`data/layers.js` lists layer names in order:

```js
window.PORTFOLIO_LAYERS = ['public'];             // public repo
window.PORTFOLIO_LAYERS = ['public', 'corporate']; // a private build
```

Each name loads `data/layer-<name>.js`. A missing file is skipped with a console warning, so the page still renders.

Each layer file calls `PORTFOLIO.register({...})` once. Later layers add to or override earlier ones:

| Key | Merge rule |
|---|---|
| `profile` | Fields shallow-merged. A later `headline` replaces the earlier one. |
| `tools` | Object merge by tool id. |
| `attributes`, `sections`, `projects` | Matched by `id`. Same id updates the item; a new id is appended, or inserted using `after: '<id>'` or `before: '<id>'`. |
| Any other array (e.g. `community`, `roles`, `questions`) | Becomes a named collection, merged by `id`. Sections read collections through `items: '<name>'`. |

## Screens and navigation

The site is one page with hash routes. Sections become screens:

- A section with a `nav` label starts a screen and adds a top-menu item. The `hero` section is the home screen.
- Sections without `nav` join the screen before them (for example `about` joins Beyond work).
- Use `after: '<id>'` in another layer to place a section.

| type | Reads | Use for |
|---|---|---|
| `hero` | `profile.name`, `attributes` | Home: name and the four attributes |
| `portfolio` | all `projects` | Horizontal rail, one marquee screenshot (`cover`) per project |
| `prose` | `body: [paragraphs]` | Free text. Hidden publicly when empty |
| `cards` | `items: '<collection>'` | Beyond work, programs |
| `timeline` | `items: '<collection>'` with `{ id, period, title, text, points? }` | Career history |
| `qa` | `items: '<collection>'` with `{ id, question, answer: [paragraphs], points?, evidence?: [project ids] }` | Prepared answers |

Routes:

- `#/` home, `#/<section-id>` a menu screen
- `#/portfolio/<project>` suite overview (or straight into the deck when there is one product)
- `#/portfolio/<project>/<product>/why|how/<slide>` a product deck. Arrow keys, the arrows, the dots, or a swipe move between slides.

## Project shape

```js
{
  id: 'example',
  title: 'Example',
  cover: { src: 'assets/work/example/cover.webp', tall: false }, // marquee on the portfolio rail
  page: 'example',                // optional: data/work/example.js gives it Why/How decks
  short: 'Ex',                    // optional label for the tools matrix
  context: 'work',                // optional; shows an "At work" tag
  kind: ['app', 'agent', 'product'],
  attributes: ['innovator'],      // ids from `attributes`; drives the hero filter
  summary: 'One sentence.',
  why: { problem: '', decisions: [''], outcome: '' },   // product lens
  how: {                                                  // engineering lens
    flow: [{ label: '', detail: '' }],  // drawn as a pipeline diagram
    stack: ['tool-id'],
    practices: ['']
  },
  components: [{ title: '', kind: 'app', text: '' }],
  links: [{ label: '', href: '' }],
  confirm: ['note to self']       // shown only with ?review
}
```

## Review mode

Add `?review` to the URL. Shows every `confirm` note in yellow and underlines text marked `draft: true` (or `headlineDraft` / `introDraft` on the profile). The public URL without `?review` hides all of it.

## Project pages (Why I built this / How I built this)

`data/work/<id>.js` calls `PORTFOLIO_WORK.register({...})` with a suite of one or more products. Products appear in the order listed. Each product gets two slide decks:

- **Why I built this**: why (problem and insight, with the product's `hero` screenshot), who I built this for (personas), what it does, the case for it.
- **How I built this**: architecture, decisions, one slide per screenshot, an artifact table if present, vibe-coded vs agentic with the tool list.

A suite with more than one product also gets an overview screen and a suite-level deck (`#/portfolio/<id>/suite/how`) for the build loop, shared stack and numbers.

To add one:

1. Copy `data/work/volleyball.js` to `data/work/<id>.js` and replace the content.
2. Put screenshots in `assets/work/<id>/` (WebP; phone shots about 720px wide, desktop about 1600px). Mark phone shots `tall: true` and TV/desktop shots `wide: true`.
3. In `data/layer-public.js`, add `page: '<id>'` and a `cover` to the project.

Projects without a `page` file get a short two-slide deck from their entry in the layer file.

Never use screenshots that show real players' names or faces. Capture demo builds instead.
