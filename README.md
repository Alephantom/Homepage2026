# Anna-Lena website — Jekyll and Markdown edition

This version is ready for a growing Markdown blog and GitHub Pages. The homepage, blog, contact page, shared layouts, styling, AL logo, social card, and three starter posts are included.

## Folder structure

```text
Homepage2026/
├── _config.yml
├── _includes/
│   ├── colorful-section.html
│   ├── footer.html
│   └── nav.html
├── _layouts/
│   ├── default.html
│   └── post.html
├── _posts/
│   └── YYYY-MM-DD-title.md
├── assets/
│   ├── al-logo.png
│   ├── social-card.png
│   └── portrait.jpg (add later)
├── blog/index.html
├── blog.css
├── contact.html
├── contact.css
├── Gemfile
├── index.html
├── script.js
└── styles.css
```

## Preview locally in Visual Studio Code

You need Ruby and Bundler once. Then open the website folder in Visual Studio Code and run:

```bash
bundle install
bundle exec jekyll serve --baseurl=""
```

Open <http://localhost:4000>. Press `Ctrl+C` to stop the preview.

GitHub recommends Bundler for local Jekyll previews: <https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll>

## Add a blog post

Create a Markdown file in `_posts`. The filename must begin with its publication date:

```text
2026-09-01-my-new-post.md
```

Start the file with:

```markdown
---
title: "My New Post"
date: 2026-09-01 09:00:00 +0200
category: Human judgment
read_time: 4
excerpt_text: "A short introduction shown on the homepage."
---

Write the article here using Markdown.

## A section heading

Continue writing here.
```

Jekyll automatically adds the new article to the journal page. The three newest posts also appear on the homepage.

## Connect Calendly

1. In Calendly, create or open the event type for the free 20-minute orientation call.
2. Copy its public event link.
3. Open `_config.yml`.
4. Replace the placeholder in `calendly_url`:

```yml
calendly_url: "https://calendly.com/YOUR_NAME/YOUR_EVENT"
```

The contact page will load that event as an inline scheduler automatically.

## Email contact

The contact page opens the visitor&apos;s default email program with Anna-Lena&apos;s address, a suggested subject, and a few optional prompts already filled in. The `mailto:` link is maintained directly in `contact.html`.

## Add your portrait

Save a vertical 4:5 JPG as:

```text
assets/portrait.jpg
```

Refresh the site. The photo automatically replaces the AL portrait frame. Until then, the clean AL placeholder remains without instructional text.

## AL logo

The reusable logo is stored at `assets/al-logo.png`. It has a transparent outer background and can be used as a favicon, social avatar, or standalone brand mark.

## Reuse the colourful section

The template is `_includes/colorful-section.html`. Add it anywhere in a Jekyll page with:

```liquid
{% include colorful-section.html
  eyebrow="New section"
  heading="Your heading goes here."
  body="Replace this with your own text."
  link_text="Your link"
  link_url="/contact.html"
%}
```

The homepage includes one example. Remove that include from `index.html` when you no longer need the placeholder example.

## Publish on GitHub Pages

Upload the contents of this folder to the root of your `Homepage2026` repository. In GitHub, open **Settings → Pages** and use:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/(root)**

The current `_config.yml` assumes the repository is named `Homepage2026`.

## Connect annalenabirkner.com later

After configuring the custom domain in GitHub Pages, change these two lines in `_config.yml`:

```yml
url: "https://annalenabirkner.com"
baseurl: ""
```

Also configure `annalenabirkner.com` under **Settings → Pages → Custom domain** in GitHub.
