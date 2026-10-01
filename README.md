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
│   ├── social-card.jpg
│   ├── portrait-friendly.jpg
│   └── portrait-friendly.webp
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

The `date` is the publication date shown on the post and used in its structured data. When you update a post later, add `last_modified_at: YYYY-MM-DD`. For a cover image in search and social previews, add `og_image`, `og_image_width`, `og_image_height` and `og_image_alt` (see the existing posts).

Images in a post go in `assets/blog/<post-slug>/`, at most 1440 px wide (twice the 720 px text column). For a large photo or graphic, add a WebP copy next to it and use a `<picture>`, as the existing posts do; browsers without WebP load the JPG or PNG:

```html
<figure>
  <picture>
    <source srcset="{{ '/assets/blog/my-post/photo.webp' | relative_url }}" type="image/webp">
    <img src="{{ '/assets/blog/my-post/photo.jpg' | relative_url }}" alt="What the image shows" width="1440" height="960" loading="lazy" decoding="async">
  </picture>
  <figcaption>Source or credit.</figcaption>
</figure>
```

## Connect Calendly

1. In Calendly, create or open the event type for the free 30-minute orientation call.
2. Copy its public event link.
3. Open `_config.yml`.
4. Replace the placeholder in `calendly_url`:

```yml
calendly_url: "https://calendly.com/YOUR_NAME/YOUR_EVENT"
```

The contact page first shows a privacy notice. Calendly&apos;s script and embedded calendar are loaded only after the visitor selects **Load Calendly**. Keep this consent gate in place and do not add Calendly&apos;s `hide_gdpr_banner=1` parameter.

## Contact form and newsletter setup

Two optional services are switched on in `_config.yml`. While a setting is empty, the site still works without that service:

- `contact_form_endpoint` (Formspree). Empty: `/contact` and `/de/kontakt/` show the email address with a **Copy address** button, and the `mailto:` link stays as a second option. Filled in: both pages show a contact form that sends messages through Formspree.
- `brevo_form_url` (Brevo). Empty: the newsletter sign-up in the Team Snapshot results is hidden on the live site. In the local preview it still appears, marked “Preview only”, and sends nothing. Filled in: visitors can sign up, and their email address, company name and Snapshot scores go to Brevo.

The privacy policy follows the same settings. Section 4 (Contact form) and section 6 (Quarterly newsletter) show their full text only once the matching setting is filled in; until then they say the feature is not active.

### 1. Connect the contact form (Formspree)

1. Create an account at <https://formspree.io> and choose **New form**. Give it a name such as “Website contact” and set the email address the messages should go to (normally the same as `legal.email` in `_config.yml`).
2. If Formspree asks you to confirm that email address, do so.
3. In the form’s **Settings**, turn **reCAPTCHA** off. The site already uses Formspree’s `_gotcha` honeypot against spam. reCAPTCHA would load Google’s service, which the privacy policy does not cover, and it can block messages sent from the page.
4. Copy the form endpoint. It looks like `https://formspree.io/f/abcdwxyz`.
5. Paste it into `_config.yml`:

```yml
contact_form_endpoint: "https://formspree.io/f/abcdwxyz"
```

You don’t need to set up fields in Formspree. The form sends `topic` (the “What’s it about?” choice, as a slug such as `clarity-check`), `name`, `email`, `company` and `message`, plus hidden helper fields: `_subject` for the email subject line and `_gotcha`, Formspree’s built-in spam trap. The subject names the topic, for example “New enquiry: Clarity Check”; for “Something else” it stays “New enquiry from annalenabirkner.com”. See [Contact topics and prefilled enquiries](#contact-topics-and-prefilled-enquiries) for how links choose the topic.

### 2. Connect the newsletter (Brevo)

1. In Brevo, open **Contacts → Settings → Contact attributes** and create three attributes:
   - `COMPANY`: Text
   - `SNAPSHOT_SCORE`: Number
   - `SNAPSHOT_AREAS`: Text
2. Under **Contacts → Lists**, create a list for the newsletter, for example “Quarterly newsletter”.
3. Under **Contacts → Forms**, create a subscription form:
   - Add the fields `EMAIL`, `COMPANY`, `SNAPSHOT_SCORE` and `SNAPSHOT_AREAS`.
   - Add the GDPR/opt-in checkbox. Its field name must be `OPT_IN`.
   - Choose the newsletter list from step 2.
   - In the confirmation settings, choose **double opt-in** (double confirmation), pick the confirmation email template and set the page people see after confirming.
   - Don’t add a CAPTCHA to this form (switch it off if Brevo added one). The website sends the form directly and can’t show a CAPTCHA, so with it on, sign-ups fail silently.
   - Save and activate the form. How the form looks in Brevo does not matter: the website only uses its address and field names.
4. Open the form’s share options, choose the **HTML code** (embed) version and find the line `<form … action="https://….sibforms.com/serve/…">`. Copy only the `action` URL into `_config.yml`:

```yml
brevo_form_url: "https://xxxxxxxx.sibforms.com/serve/MUIFA…"
```

The website sends these fields to Brevo: `EMAIL`, `COMPANY`, `SNAPSHOT_SCORE` (overall score, 0–100), `SNAPSHOT_AREAS` (a short summary such as “priorities:100; decisions:20; processes:60; founder:100; support:60; information:unsure”, where `unsure` means “not sure” and `skipped` means not answered; it stays well under Brevo’s 200-character limit), `OPT_IN`, plus Brevo’s hidden `email_address_check`, `locale` and `html_type`. If Brevo gives a field a different name, change it in the single field-name mapping in `team-snapshot.js`.

The browser cannot read Brevo’s reply (the request is sent in `no-cors` mode), so after sending the page always says “Almost done — please check your inbox and confirm your subscription.” A real test sign-up is the only way to know the connection works.

### 3. Restart the preview

`jekyll serve` does not reload `_config.yml` while it is running. After editing `_config.yml`, stop the preview with `Ctrl+C` and start it again:

```bash
bundle exec jekyll serve --baseurl=""
```

### 4. Test once for real

1. **Contact form:** send one test message from `/contact` and one from `/de/kontakt/`. Check that both reach your inbox and appear in the Formspree dashboard, then delete them there.
2. **Newsletter:** complete the Team Snapshot, sign up with your own email address and a test company name, and confirm the subscription from the Brevo email. In Brevo, check that the contact is on the newsletter list, the double opt-in is confirmed, and `COMPANY`, `SNAPSHOT_SCORE` and `SNAPSHOT_AREAS` are filled in. Then delete the test contact.
3. **Privacy policy:** open `/privacy/` and check that sections 4 and 6 now show the full text.

### 5. Before publishing

- Accept or sign the data-processing agreement (DPA) with Formspree and with Brevo.
- `privacy.html` contains `<!-- REVIEW: … -->` notes at the top of the contact-form and newsletter sections. Check each point against your actual Formspree and Brevo settings and their DPAs, adjust the text, then delete the notes. HTML comments are visible to anyone who views the page source.
- Brevo tracks email opens and link clicks for each recipient by default. Switch this off for the newsletter (recommended). If you want to keep it, it has to be covered by the consent: extend the checkbox text (for example “…by email. I agree that opens and clicks are measured to improve the newsletter.”) and describe the tracking in the newsletter section of the privacy policy.

## Complete the legal pages before publishing

The Imprint and Privacy Policy intentionally display a draft warning until the legally required address is complete.

1. Open `_config.yml`.
2. Complete `legal.street`, `legal.postal_code`, and `legal.city`.
3. Add a telephone number, VAT ID, or register information if it applies to the business.
4. Confirm that `hosting_provider` matches the production host: `cloudflare` or `github`.
5. If the contact form or newsletter is connected, work through the `REVIEW` notes in `privacy.html` (see [Contact form and newsletter setup](#contact-form-and-newsletter-setup)).
6. Set `legal_details_complete: true` only after every detail has been checked.

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

The site includes a descriptive search title, unique page descriptions, canonical URLs, AL favicon metadata, social-sharing metadata, Schema.org structured data, `robots.txt`, and an automatically generated `/sitemap.xml`.

### Structured data (Schema.org)

`_includes/structured-data.html` (included from `_includes/seo.html`) writes one JSON-LD `@graph` per page. It describes only what the page shows, and must stay that way: no address, phone number, social profiles, credentials, ratings or reviews. Noindex pages (404, newsletter confirmation) get none.

- Every indexable page has a `WebPage` (`ContactPage` on the contact pages, `CollectionPage` on `/blog/`, set with `schema_page_type` in the front matter) and, except on the homepages, a `BreadcrumbList`: Home → page, posts Home → Journal → post, German pages Startseite → page. The breadcrumb uses `breadcrumb_title` (otherwise `title`); `breadcrumb_parent` adds a level in between (`/workshops` sits under `/team-workshops/`).
- The homepages (`/`, `/de/`) add the `WebSite` and the full `Person` (`https://annalenabirkner.com/#person`: name, portrait, job title, email, working languages, and the “Areas I can help with” list from `_data/service_areas.yml`). Other pages only point to it.
- Services with their prices: the keys listed in `schema_services` in a page’s front matter (homepages and `/strategic-support/`), described in `_data/schema_services.yml`. The numbers are read from the English prices in `_data/offer_prices.yml`, so a price change there updates the structured data too. When you change what an offer card says, update its short description in `_data/schema_services.yml`.
- The homepage FAQ lives in `_data/faq_en.yml` and `_data/faq_de.yml`. Both the visible FAQ and the `FAQPage` structured data are built from these files, so edit questions there, not in `index.html`.
- Posts get a `BlogPosting` (headline, description, `og_image` with its size, the `date` shown on the post, `last_modified_at`, category, word count), written by and published by `#person`, part of the Journal (`Blog`).

To check a page, paste its address into Google’s [Rich Results Test](https://search.google.com/test/rich-results) or the [Schema Markup Validator](https://validator.schema.org/) after publishing.

`robots.txt` follows the policy “AI search yes, AI training no”: search engines and AI search tools (such as OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User and PerplexityBot) may crawl every public page, while known AI-training crawlers (such as GPTBot, ClaudeBot, Google-Extended, Applebot-Extended and CCBot) are asked to stay out. Well-behaved crawlers follow these rules; they are a request, not a technical block. `llms.txt` is a plain-text summary of the site for AI tools (a convention, not an official standard). Its prices and journal list update automatically; update its text by hand when offers, case studies or contact routes change.

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

## Offers and Team Snapshot

The homepage offers are maintained in `_includes/home-offers.html` (English) and `_includes/home-offers-de.html` (German). Both are styled by `home-offers.css`. There are three offer cards: the Clarity Check comes first, the Focused Build follows it as the next step, and the Interim HR Business Partner card (`#interim-hr-business-partner`) is priced on request. Below the offers, a workshops section (`#workshops`) lists the topic workshops from `/team-workshops/`: two to four hours, bookable on their own, from the `workshops` price. The free Team Snapshot is the starting point for visitors who are not yet sure what is getting in the way; the free 30-minute call remains a secondary option.

All prices live in `_data/offer_prices.yml`, with an `en` and a `de` value for `clarity_check`, `focused_build` and `workshops` (the starting price for the topic workshops). Prices are shown as they are, with no VAT note. The Interim HR Business Partner has no price key; its card says "On request" / "Auf Anfrage". Pages read these values, for example `site.data.offer_prices.clarity_check.en`, so never hard-code a price in a page. In the FAQ data files, write `{price.workshops}` (or `{price.clarity_check}`, `{price.focused_build}`) instead of a price. The structured data reads the number from the English value, so keep it in the form `€1,234`.

The free Team Snapshot lives at `/team-snapshot/`, with links from the homepage offers, the strategic support page and the shared footer. It is an instant, scored self-analysis and the free first step before the paid Clarity Check. The page and styles are in `team-snapshot.html` and `team-snapshot.css`; `team-snapshot.js` scores the answers in the browser and shows the results straight away: a score for each area, practical tips for the weaker areas, and a PDF download. “Download PDF” (at the top and the bottom of the results) builds the PDF in the browser with the vendored jsPDF 4.2.1 at `assets/lib/jspdf.umd.min.js` (MIT licence, header comment kept), which is loaded only when one of those buttons is pressed; if it can’t load, the browser’s print window opens instead, using the `@media print` styles in `team-snapshot.css`. Edit the questions, interpretations and tips in `_data/team_snapshot.yml`, and the levels, labels and scores in `_data/team_snapshot_results.yml`.

Scoring: Clear = 100, Needs attention = 60, Stuck = 20. “I’m not sure” answers get no score and, like skipped questions, don’t count towards the average; the area is still shown (“Worth a closer look · no score”) with its interpretation and tips. When no answer has a score, no overall number is shown.

The German version lives at `/de/team-snapshot/` (`de/team-snapshot.html`) with `_data/team_snapshot_de.yml` and `_data/team_snapshot_results_de.yml`, which use the same ids, keys and scores as the English files. `team-snapshot.js` is shared and contains no page wording: all results, booking, newsletter and PDF texts come from the `snapshot_ui` front matter of each page, so change a text there (in both pages) rather than in the script.

There is no email gate and no personal reply: the full results are shown to everyone. The answers stay in the visitor’s browser and nothing is stored. Nothing is sent unless the visitor chooses to sign up for the quarterly newsletter shown with the results; only then are their email address, company name and Snapshot scores sent to Brevo (see [Contact form and newsletter setup](#contact-form-and-newsletter-setup)). The newsletter block does not appear in the printed or PDF summary. After the results, "Book your Clarity Check" opens the contact page with the Clarity Check already selected and a short plain-text summary of the scores in the message, which the visitor can edit before sending (see [Contact topics and prefilled enquiries](#contact-topics-and-prefilled-enquiries)). The secondary link, "Prefer to talk? Book a free 30-minute call", goes to `/contact?topic=general` (German page: `/de/kontakt/?topic=general`).

## Contact topics and prefilled enquiries

Every button that books or asks about something opens the contact form with the right topic already chosen in its “What’s it about?” (“Worum geht es?”) select. Links follow one pattern:

```liquid
{{ '/contact' | relative_url }}?topic=clarity-check#write
{{ '/de/kontakt/' | relative_url }}?topic=clarity-check#schreiben
```

`#write` and `#schreiben` scroll straight to the form. A missing or unknown topic falls back to `general` (“Something else” / “Etwas anderes”), so a mistyped link still works.

| Slug | Used by |
| --- | --- |
| `general` | Fallback; “Something else” in the select |
| `clarity-check` | “Book your Clarity Check” (homepage offers, strategic support, Team Snapshot results) |
| `focused-build` | “Plan your Focused Build” (homepage offers, strategic support) |
| `interim-hr` | Interim HR Business Partner buttons (homepage offers, strategic support) |
| `workshop` | “Book a workshop” on the homepage; “Discuss a workshop” / “Discuss your workshop” on `/team-workshops/` |
| `workshop-algorithmic-hiring` | “Discuss your workshop” and “Book the workshop” on `/workshops` |
| `workshop-implementing-ai` | “Discuss this topic” on `/team-workshops/` |
| `workshop-hr-operations` | “Discuss this topic” on `/team-workshops/` |
| `workshop-internal-communications` | “Discuss this topic” on `/team-workshops/` |
| `workshop-remote-environments` | “Discuss this topic” on `/team-workshops/` |
| `team-snapshot` | Questions about the free Team Snapshot |

The topics, their English and German labels, and the email subject lines live in `_data/contact_topics.yml`. Both contact pages build the select from it. To add a topic, add an entry there and link to it with its slug; to rename one, change only its labels, because links across the site use the slug. General links such as the navigation, “Book a call” and Calendly stay plain `/contact` links.

When `contact_form_endpoint` is empty, the page shows the email address instead of the form. The topic still counts: “Or open your email program” starts a draft with the topic’s subject line (for example “Booking a Clarity Check”, plus the optional `email_body` starting note from the data file), and a short note under the address names the topic.

### Handing over a message from another page

A page can pass a ready-made message to the contact form without putting it in the URL. Before it navigates to the contact page, it stores this in `sessionStorage`:

```js
sessionStorage.setItem("contactPrefill", JSON.stringify({
  topic: "clarity-check",
  message: "Plain-text message, for example a Team Snapshot summary",
}));
window.location.href = "/contact?topic=clarity-check#write";
```

`contact-form.js` reads the `contactPrefill` key once and removes it straight away, so a reload or a later visit starts empty. The message goes into the message field, where the visitor can edit it before sending; it is only used if its `topic` matches the page’s topic (or has none). On the email-address version of the page it becomes the body of the email draft instead. Personal data and summaries never go into the URL: the query string only ever carries the topic slug. The Team Snapshot’s “Book your Clarity Check” button uses this hand-over.

## Add your portrait

The homepage portrait (`index.html` and `de/index.html`) is a plain `<picture>` in the HTML, lazy-loaded by the browser (no JavaScript):

```text
assets/portrait-friendly.webp   (used by most browsers: smaller)
assets/portrait-friendly.jpg    (fallback for browsers without WebP; also the image in the structured data)
```

To change it, save a vertical JPG (900 × 1157 px) as `assets/portrait-friendly.jpg` and replace the `.webp` with a WebP copy of the same photo. Always replace both: if you replace only the JPG, most browsers keep showing the old WebP. If you use a different size, update the `width` and `height` on the `<img>` in both homepages. If you don’t want a WebP copy, delete the `<source … type="image/webp">` line in both homepages as well; deleting only the file leaves a broken image. The AL placeholder shows in the frame until the photo has loaded.

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
  link_url="/contact"
%}
```

No page uses it at the moment. Its styles stay in `styles.css`, so it works as soon as you add the include.

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
