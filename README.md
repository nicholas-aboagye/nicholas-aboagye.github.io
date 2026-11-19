# Nicholas Aboagye — academic website

Personal and portfolio site for Nicholas Aboagye, PhD candidate in Geospatial Information
Sciences at The University of Texas at Dallas.

**Live at:** https://nicholasaboagye.github.io (update once the repository is published)

## What this is

Five hand-written static pages. No framework, no build step, no dependencies to install —
the files in this repository are exactly what the browser receives.

| File | Page |
|---|---|
| `index.html` | About — identity card, news, research threads, methods |
| `publications.html` | Publications and conference presentations |
| `projects.html` | Interactive maps, applications and research projects |
| `field.html` | Field and outreach photographs, engagement, service |
| `record.html` | Education, teaching, awards and grants |
| `style.css` | Every style for every page |
| `site.js` | Theme toggle, photo lightbox, copy-to-clipboard, contour canvas |
| `apps/heart-disease.html` | Custom ArcGIS Maps SDK application (US heart disease rates) |
| `img/` | Photographs, web-sized, metadata stripped |

## Editing it

Open the file and edit the HTML. There is nothing to compile.

To preview locally, serve the folder over HTTP rather than opening the files directly —
`fetch` and relative paths behave differently from `file://`:

```
python -m http.server 8731
```

Then visit http://127.0.0.1:8731.

### Adding a publication

Copy an existing `<li class="pub">` block in `publications.html` and edit it. Entries are
grouped by year inside a `.yeargroup`; the big faint year in the margin is the `.yearmark`.
Chips mark status — `chip-pub` for peer reviewed, `chip-rev` for under review, `chip-award`
for a prize.

### Adding news

Copy an existing `<li>` in the `.news` list in `index.html`. Newest first.

### Adding a photograph

Put a web-sized JPEG in `img/`, then copy a `<figure class="shot">` block in `field.html`.
Add `class="shot tall"` for a portrait-orientation image. **Strip EXIF before committing** —
phone photographs carry GPS coordinates of wherever they were taken.

## Conventions worth keeping

- Every colour is a CSS custom property defined in `:root`, redefined for dark mode in two
  places: a `prefers-color-scheme` block and a `[data-theme="dark"]` block. Never hard-code a
  colour in a component rule, or it will be unreadable in one of the two themes.
- Placeholder links carry `aria-disabled="true"`; `site.js` makes them inert.
- Before putting any ArcGIS link on the site, open it in a private browser window. An app can
  be shared publicly while its data is not, and premium Esri layers never load for visitors.

## Credits

Typeset in Archivo, Newsreader and IBM Plex Mono via Google Fonts. The contour field behind
each page header is generated in `site.js` with marching squares over a synthetic elevation
surface.
