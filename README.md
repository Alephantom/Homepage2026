# Anna-Lena website — Jekyll and Markdown edition

This version is ready for a growing Markdown blog. The homepage, FAQ, blog, contact page, legal pages, privacy controls, shared layouts, styling, AL logo, social card, and three starter posts are included.

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

The contact page first shows a privacy notice. Calendly&apos;s script and embedded calendar are loaded only after the visitor selects **Load Calendly**. Keep this consent gate in place and do not add Calendly&apos;s `hide_gdpr_banner=1` parameter.

## Complete the legal pages before publishing

The Imprint and Privacy Policy intentionally display a draft warning until the legally required address is complete.

1. Open `_config.yml`.
2. Complete `legal.street`, `legal.postal_code`, and `legal.city`.
3. Add a telephone number, VAT ID, or register information if it applies to the business.
4. Confirm that `hosting_provider` matches the production host: `cloudflare` or `github`.
5. Set `legal_details_complete: true` only after every detail has been checked.

The relevant pages are:

- `/imprint/`
- `/privacy/`
- `/cookies/`

The pages are a practical technical draft, not a substitute for legal advice. Recheck them whenever hosting, scheduling, analytics, or other third-party services change.

## Enable Google Analytics later

Analytics is disabled while `google_analytics_id` is empty. In that state, no Google tag is requested, no analytics banner is displayed, and no Google Analytics cookie is set.

When the GA4 property is ready:

1. Copy its measurement ID, for example `G-ABC1234567`.
2. Add it to `_config.yml`:

```yml
google_analytics_id: "G-ABC1234567"
google_analytics_retention_months: 2
```

3. In Google Analytics, set event-data retention to the same number of months.
4. Keep Google Signals and advertising personalisation disabled unless the privacy setup is reviewed again.
5. Accept the applicable Google data-processing terms for the account.
6. Rebuild the site and test in a private browser window: before accepting, there must be no request to `googletagmanager.com` and no `_ga` cookie. After accepting, analytics may load. “Essential only” must keep it blocked.

The implementation uses Basic Consent Mode: the Google script is dynamically added only after consent. The footer&apos;s **Cookie settings** button allows visitors to revisit the choice. The preference expires after `consent_storage_days` (currently 180 days).

## Improve the Google Search result

The site includes a descriptive search title, unique page descriptions, canonical URLs, AL favicon metadata, social-sharing metadata, `WebSite` and `Person` structured data, article structured data, `robots.txt`, and an automatically generated `/sitemap.xml`.

After publishing these changes:

1. Add `https://annalenabirkner.com` as a domain property in Google Search Console.
2. If Google gives you an HTML meta-tag verification token, paste only its `content` value into `_config.yml`:

```yml
google_site_verification: "YOUR_VERIFICATION_TOKEN"
```

3. Submit `https://annalenabirkner.com/sitemap.xml` in Search Console.
4. Use **URL inspection** for the homepage and select **Request indexing**.
5. Confirm that these URLs are publicly reachable:
   - `https://annalenabirkner.com/assets/al-logo.png`
   - `https://annalenabirkner.com/robots.txt`
   - `https://annalenabirkner.com/sitemap.xml`

Google chooses search snippets automatically and may use on-page text instead of the supplied description for some searches. Recrawling and visible changes can take several days or weeks.

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
