# Project memory

Last reviewed: 2026-08-11 (Europe/Berlin)

## What this project is

Anna-Lena's personal portfolio and “Human in the Loop” journal. It is a small,
static Jekyll site intended for GitHub Pages.

## Stack and structure

- Jekyll with the GitHub Pages gem bundle.
- Liquid templates and includes in `_layouts/` and `_includes/`.
- Markdown articles in `_posts/`.
- Plain HTML, CSS, and JavaScript; there is no Node build step.
- `_site/` is generated output. Make source changes outside `_site/`, then rebuild.

Important source files:

- `index.html`: homepage and the latest-post preview.
- `blog/index.html`: journal index at `/blog/`.
- `contact.html`: booking card and Formspree-backed enquiry form.
- `index.html#partner`: DevOpWeb technology-partner feature as the final
  homepage section, after the contact invitation and before the shared footer.
- `_layouts/default.html`: shared document shell and asset loading.
- `_layouts/post.html`: journal article layout.
- `_config.yml`: site URL, base path, permalinks, and integration URLs.
- `styles.css`, `blog.css`, `post.css`, `contact.css`: page styling.
- `script.js`: loads one portrait into the homepage frame and runs the
  homepage headline's
  reduced-motion-aware typing effect.
- `assets/devopweb-logo.png`: official transparent DevOpWeb partner logo.
- `assets/portrait-friendly.png`: subtly warmer portrait used by the homepage.
  Its subtle treatment is hover-only; there is no click interaction or second
  portrait.

## Routes and content behavior

- Homepage: `/`
- Journal index: `/blog/`
- Contact page: `/contact.html`
- Post permalink pattern: `/journal/:title/`
- Jekyll sorts posts newest first; the homepage shows the two newest available
  posts in one shared journal-preview card.
- The journal index presents every post with the same responsive row layout;
  the newest post is not styled as a separate featured card.
- Future-dated posts are not emitted by a normal Jekyll build until their date arrives.

## Local workflow

Intended setup and preview commands:

```bash
bundle install
bundle exec jekyll serve --baseurl=""
```

Production-style validation:

```bash
bundle exec jekyll build --trace
```

The Jekyll server was verified on 2026-08-11 with Ruby 3.3.5 and Bundler
4.0.18. On this machine those executables are under
`/Users/anna-lena/.rubies/ruby-3.3.5/bin/`. The default shell currently selects
rbenv Ruby 3.0.0, so the bare `bundle` command fails until the shell is switched
to the compatible Ruby. The verified explicit command is:

```bash
/Users/anna-lena/.rubies/ruby-3.3.5/bin/bundle exec jekyll serve --baseurl ''
```

## Deployment assumptions

- `_config.yml` currently targets `https://alephantom.github.io/Homepage2026`.
- The README describes deployment from the root of a GitHub Pages repository
  named `Homepage2026`.
- For the custom domain, set `url` to `https://annalenabirkner.com` and
  `baseurl` to an empty string after GitHub Pages is configured.

## Current content state

- `2026-08-11-keep-a-human-in-the-loop.md` is available as of this review.
- The posts dated 2026-08-12 and 2026-08-13 remain scheduled/future-dated.
- The homepage uses the colourful reusable section as the contact eye-catcher,
  followed by an extensible, circle-free portfolio section. Its first case
  study presents Anna-Lena's People & Culture and founder-partner work at
  Mindfulife in a single paper case card. Its three concrete contribution areas
  sit directly below the introduction. The additional rotating case-study and
  testimonial sides are intentionally removed for now.
- A real portrait exists at `assets/portrait.jpg`.
- The homepage about section uses three oversized, low-opacity CSS circles in
  acid, lavender, and coral, mostly cropped by the section edges.
- The collaboration section leads with a "Clarity & Systems Review" and six
  practical service areas: positioning and digital presence, operations,
  people systems, responsible AI, small-business web systems, and hands-on
  implementation.

## Open items and known risks

1. Replace the placeholder Google Calendar and Formspree URLs in `_config.yml`.
   Until then, booking and form submission are not production-ready.
2. `_layouts/post.html` links “Journal” and “Back to the Journal” to `/journal/`,
   but the journal index is `/blog/`. Those links currently target a route that
   is not generated.
3. Align the shell's default Ruby with the installed Ruby 3.3.5 toolchain so
   the shorter documented `bundle exec ...` commands work without an explicit
   executable path.
4. This folder had no `.git` metadata when reviewed, so change history and a
   clean/dirty working-tree check were unavailable.

## Maintenance notes

- Do not hand-edit `_site/`; it may be stale and will be replaced by a build.
- When adding a post, use `YYYY-MM-DD-title.md` and include `title`, `date`,
  `category`, `read_time`, and `excerpt_text` in its front matter.
- Keep this file updated when architecture, routes, deployment settings, or
  unresolved launch items change.
