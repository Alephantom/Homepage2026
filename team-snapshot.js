// Free Team Snapshot: scores the answers in the browser and shows the results on the page.
// The answers are not stored. Nothing is sent unless the visitor chooses to: signing up for the
// newsletter sends email, company name and scores to Brevo (see BREVO_FIELDS); "Book your Clarity
// Check" hands a plain-text summary to the contact form in this tab, where the visitor can edit it.
// All content and wording come from the JSON block in the page (team-snapshot.html, or the German
// de/team-snapshot.html): questions and results from _data/, UI words from the page's `snapshot_ui`.
(() => {
  // Brevo embedded-form field names, all in one place. If your Brevo form uses different
  // names (Brevo > Contacts > Forms > your form > Share > HTML code), change them here.
  const BREVO_FIELDS = {
    email: 'EMAIL', // required
    company: 'COMPANY', // text attribute
    score: 'SNAPSHOT_SCORE', // number attribute: overall score, 0–100 (empty when there is none)
    areas: 'SNAPSHOT_AREAS', // text attribute: "Priorities: Clear (100); …"
    optIn: 'OPT_IN', // consent checkbox, sent as "1"
    honeypot: 'email_address_check', // Brevo's spam trap, always empty for people
    locale: 'locale', // the page language, e.g. "en" or "de"
    htmlType: 'html_type' // sent as "simple"
  };

  // The contact form (contact-form.js) reads this once, fills in the message and removes it.
  const PREFILL_KEY = 'contactPrefill';

  const page = document.querySelector('[data-snapshot]');
  const dataElement = document.getElementById('snapshot-data');
  if (!page || !dataElement) return;

  let data;
  try {
    data = JSON.parse(dataElement.textContent);
  } catch (error) {
    return;
  }

  const i18n = data.i18n || {};
  // UI words from the page, with {placeholders} filled in.
  const t = (key, vars) => {
    const text = typeof i18n[key] === 'string' ? i18n[key] : '';
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, (match, name) => (Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match));
  };

  const form = page.querySelector('[data-snapshot-form]');
  const submit = form.querySelector('[data-snapshot-submit]');
  const progress = form.querySelector('[data-snapshot-progress]');
  const errorMessage = form.querySelector('[data-snapshot-error]');
  const announce = form.querySelector('[data-snapshot-announce]');
  const teamInput = form.querySelector('#snapshot-team');
  const questionsHeading = document.getElementById('reflections-title');

  const results = document.getElementById('results');
  const resultsHeading = document.getElementById('results-title');
  const teamOutput = results.querySelector('[data-snapshot-team]');
  const dateOutput = results.querySelector('[data-snapshot-date]');
  const overallOutput = results.querySelector('[data-snapshot-overall]');
  const startOutput = results.querySelector('[data-snapshot-start]');
  const areasOutput = results.querySelector('[data-snapshot-areas]');
  const unsureNote = results.querySelector('[data-snapshot-unsure-note]');
  const bookLink = results.querySelector('[data-snapshot-book]');
  const pdfButtons = Array.from(results.querySelectorAll('[data-snapshot-pdf]'));

  // Newsletter signup: only in the page when brevo_form_url is set (or in the local preview).
  const signupForm = results.querySelector('[data-signup-form]');
  const signupCompany = signupForm ? signupForm.querySelector('#signup-company') : null;

  const questions = data.questions || [];
  const config = data.results || {};
  const statuses = config.statuses || {};
  const levels = (config.levels || []).slice().sort((a, b) => b.min - a.min);
  const notAnswered = config.not_answered || { label: '', text: '' };
  const contact = data.contact || {};
  const urls = data.urls || {};
  const total = questions.length;
  const locale = i18n.dateLocale || document.documentElement.lang || undefined;
  const dateFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' });

  // Small DOM helper: text is always set with textContent, never parsed as HTML.
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

  const teamName = () => teamInput.value.replace(/\s+/g, ' ').trim();

  // One entry per question. A status without a numeric score ("not sure") is answered but unscored.
  const collect = () => questions.map((question) => {
    const checked = form.querySelector(`input[name="${CSS.escape(question.id)}"]:checked`);
    const key = checked ? checked.value : null;
    const status = key && statuses[key] ? { key, ...statuses[key] } : null;
    const scored = Boolean(status) && typeof status.score === 'number';
    return {
      question,
      status,
      scored,
      unsure: Boolean(status) && !scored,
      text: status && question.results ? question.results[key] : notAnswered.text,
      tips: question.tips || []
    };
  });

  const summarise = (areas) => {
    const answered = areas.filter((area) => area.status);
    if (!answered.length) return null;
    const scored = areas.filter((area) => area.scored);
    const unsure = areas.filter((area) => area.unsure);
    const skipped = areas.filter((area) => !area.status);
    const score = scored.length
      ? Math.round(scored.reduce((sum, area) => sum + area.status.score, 0) / scored.length)
      : null;
    const level = score === null ? null : (levels.find((item) => score >= item.min) || levels[levels.length - 1] || null);
    // Where to start: the lowest-scoring scored area (on a tie the earlier question wins) unless
    // it is clear; otherwise the first "not sure" area; otherwise nothing (all clear).
    const lowest = scored.length
      ? scored.reduce((low, area) => (area.status.score < low.status.score ? area : low))
      : null;
    let start = null;
    if (lowest && lowest.status.key !== 'clear') start = lowest;
    else if (unsure.length) start = unsure[0];
    return { answered, scored, unsure, skipped, score, level, start };
  };

  const statusText = (area) => {
    if (!area.status) return notAnswered.label;
    return area.scored
      ? t('statusScore', { label: area.status.label, score: area.status.score })
      : t('statusNoScore', { label: area.status.label });
  };

  // "(1 marked ‘not sure’, 2 not answered)" details for the overall score.
  const basisDetails = (summary) => {
    const parts = [];
    if (summary.unsure.length) parts.push(t('detailUnsure', { count: summary.unsure.length }));
    if (summary.skipped.length) parts.push(t('detailSkipped', { count: summary.skipped.length }));
    return parts.join(t('listSeparator') || ', ');
  };

  const basisText = (summary) => {
    if (summary.score === null) return t('basisNone', { details: basisDetails(summary) });
    if (summary.scored.length === total) return t('basisAll', { total });
    return t('basisSome', { scored: summary.scored.length, total, details: basisDetails(summary) });
  };

  // One line per area for the booking message and the newsletter, e.g. "Priorities: Clear (100/100)".
  const areaLine = (area, scoredKey) => {
    if (!area.status) return t('lineNotAnswered', { topic: area.question.topic, label: notAnswered.label });
    if (!area.scored) return t('lineUnsure', { topic: area.question.topic, label: area.status.label });
    return t(scoredKey, { topic: area.question.topic, label: area.status.label, score: area.status.score });
  };

  // "Priorities: Clear (100); Decision ownership: Worth a closer look (not sure); …" for Brevo.
  const areasText = (areas) => areas.map((area) => areaLine(area, 'brevoLineScored')).join('; ');

  const updateProgress = () => {
    const count = collect().filter((area) => area.status).length;
    progress.textContent = t('progress', { count, total });
    if (count) errorMessage.textContent = '';
  };

  const tipList = (tips, className) => {
    const list = el('ul', className);
    tips.forEach((tip) => list.appendChild(el('li', '', tip)));
    return list;
  };

  const renderOverall = (summary) => {
    overallOutput.replaceChildren();
    overallOutput.appendChild(el('h3', 'eyebrow snapshotCardTitle', t('overallTitle')));
    if (summary.score === null) {
      const noScore = config.no_score || {};
      overallOutput.appendChild(el('p', 'snapshotLevelTitle snapshotLevelTitle--noScore', noScore.title || ''));
      overallOutput.appendChild(el('p', '', noScore.text || ''));
    } else {
      const score = el('p', 'snapshotScore');
      score.appendChild(el('span', 'snapshotScoreNumber', String(summary.score)));
      score.appendChild(el('span', 'snapshotScoreOutOf', t('outOf')));
      overallOutput.appendChild(score);
      overallOutput.appendChild(el('p', 'snapshotLevelTitle', summary.level ? summary.level.title : ''));
      overallOutput.appendChild(el('p', '', summary.level ? summary.level.summary : ''));
    }
    overallOutput.appendChild(el('p', 'snapshotSmall', basisText(summary)));
  };

  const renderStart = (summary) => {
    startOutput.replaceChildren();
    startOutput.appendChild(el('h3', 'eyebrow snapshotCardTitle', t('startTitle')));
    if (!summary.start) {
      const allClear = config.all_clear || {};
      startOutput.appendChild(el('p', 'snapshotLevelTitle', allClear.title || ''));
      startOutput.appendChild(el('p', '', allClear.text || ''));
      return;
    }
    const area = summary.start;
    startOutput.appendChild(el('p', 'snapshotLevelTitle', area.question.topic));
    startOutput.appendChild(el('p', 'snapshotStatus', statusText(area)));
    startOutput.appendChild(el('p', '', area.text));
    startOutput.appendChild(el('p', 'snapshotTipsLabel', t('tipsLabel')));
    startOutput.appendChild(tipList(area.tips, 'snapshotTips'));
  };

  const renderAreas = (areas, summary) => {
    areasOutput.replaceChildren();
    areas.forEach((area, index) => {
      const key = area.status ? area.status.key : 'none';
      const item = el('li', `snapshotArea snapshotArea--${key}${area.status && !area.scored ? ' snapshotArea--noScore' : ''}`);

      const head = el('div', 'snapshotAreaHead');
      head.appendChild(el('span', 'snapshotAreaNumber', String(index + 1).padStart(2, '0')));
      head.appendChild(el('h4', '', area.question.topic));
      item.appendChild(head);

      const body = el('div', 'snapshotAreaBody');
      const scoreRow = el('div', 'snapshotAreaScore');
      const bar = el('div', 'snapshotBar');
      bar.setAttribute('aria-hidden', 'true');
      const fill = el('span', 'snapshotBarFill');
      fill.style.width = `${area.scored ? area.status.score : 0}%`;
      bar.appendChild(fill);
      scoreRow.appendChild(bar);
      scoreRow.appendChild(el('p', 'snapshotStatus', statusText(area)));
      body.appendChild(scoreRow);
      body.appendChild(el('p', 'snapshotAreaText', area.text));

      if (area.status && area.status.key !== 'clear') {
        if (summary.start === area) {
          body.appendChild(el('p', 'snapshotTipsLabel snapshotTipsLabel--ref', t('startRef')));
        } else {
          body.appendChild(el('p', 'snapshotTipsLabel', t('tipsLabel')));
          body.appendChild(tipList(area.tips, 'snapshotTips'));
        }
      }
      item.appendChild(body);
      areasOutput.appendChild(item);
    });

    const note = unsureNoteText(summary);
    unsureNote.hidden = !note;
    unsureNote.textContent = note;
  };

  const unsureNoteText = (summary) => {
    const unsure = summary.unsure[0];
    if (!unsure || !unsure.status.note) return '';
    return t('unsureNote', { label: unsure.status.label, note: unsure.status.note });
  };

  // Plain-text summary for the booking message in the contact form. Never put into a URL.
  const bookingMessage = (areas, summary) => {
    const lines = [t('bookGreeting'), '', t('bookIntro'), ''];
    if (teamName()) lines.push(t('bookTeam', { team: teamName() }), '');
    lines.push(t('bookResults'));
    areas.forEach((area) => lines.push(areaLine(area, 'lineScored')));
    if (summary.score === null) {
      lines.push(t('bookOverallNone'));
    } else {
      const vars = { score: summary.score, level: summary.level ? summary.level.title : '', scored: summary.scored.length, total };
      lines.push(summary.scored.length === total ? t('bookOverall', vars) : t('bookOverallSome', vars));
    }
    lines.push('', t('bookChallenge'), '', '', t('bookTeamPrompt'), '');
    return lines.join('\n');
  };

  const render = ({ moveFocus }) => {
    const areas = collect();
    const summary = summarise(areas);

    if (!summary) {
      results.hidden = true;
      document.documentElement.classList.remove('snapshotHasResults');
      // Clear first so a repeated press is announced again by the live region.
      errorMessage.textContent = '';
      window.setTimeout(() => {
        errorMessage.textContent = t('errorNoAnswer');
      }, 50);
      return;
    }

    errorMessage.textContent = '';
    const name = teamName();
    teamOutput.textContent = name;
    teamOutput.hidden = !name;
    dateOutput.textContent = dateFormat.format(new Date());

    renderOverall(summary);
    renderStart(summary);
    renderAreas(areas, summary);

    results.hidden = false;
    document.documentElement.classList.add('snapshotHasResults');

    if (moveFocus) {
      announce.textContent = '';
      const message = summary.score === null
        ? t('announceNoScore')
        : t('announceScore', { score: summary.score, level: summary.level ? summary.level.title : '' });
      window.setTimeout(() => {
        announce.textContent = message;
      }, 100);
      resultsHeading.focus({ preventScroll: true });
      results.scrollIntoView({ block: 'start' });
    }
  };

  form.addEventListener('change', () => {
    updateProgress();
    if (!results.hidden) render({ moveFocus: false });
  });

  // The team or company name is one value with two places to type it: above the results
  // and in the newsletter signup. Typing in either keeps the other in step.
  const syncCompany = (from, to) => {
    if (to && to.value !== from.value) to.value = from.value;
    if (!results.hidden) render({ moveFocus: false });
  };
  teamInput.addEventListener('input', () => syncCompany(teamInput, signupCompany));
  if (signupCompany) {
    signupCompany.addEventListener('input', () => syncCompany(signupCompany, teamInput));
    signupCompany.value = teamInput.value;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    render({ moveFocus: true });
  });

  results.querySelectorAll('[data-snapshot-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      questionsHeading.focus({ preventScroll: true });
      questionsHeading.scrollIntoView({ block: 'start' });
    });
  });

  // "Book your Clarity Check": hand the summary to the contact form in this tab (sessionStorage),
  // then follow the link as usual (contact page with ?topic=clarity-check). The link works without
  // this too; the visitor then simply writes the message themselves.
  if (bookLink) {
    bookLink.addEventListener('click', (event) => {
      // A new tab or window doesn't share this tab's sessionStorage, so only a plain click counts.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const areas = collect();
      const summary = summarise(areas);
      if (!summary) return;
      try {
        window.sessionStorage.setItem(PREFILL_KEY, JSON.stringify({
          topic: bookLink.dataset.prefillTopic || 'clarity-check',
          message: bookingMessage(areas, summary)
        }));
      } catch (error) {
        // Storage blocked (e.g. strict privacy settings): the contact form simply starts empty.
      }
    });
  }

  /* ---------- PDF download (jsPDF, loaded only when a Download PDF button is pressed) ---------- */

  let jsPdfPromise = null;
  const loadJsPdf = () => {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    if (!jsPdfPromise) {
      jsPdfPromise = new Promise((resolve, reject) => {
        if (!urls.jspdf) {
          reject(new Error('No jsPDF URL'));
          return;
        }
        const script = document.createElement('script');
        script.src = urls.jspdf;
        script.async = true;
        script.onload = () => {
          if (window.jspdf && window.jspdf.jsPDF) resolve(window.jspdf.jsPDF);
          else reject(new Error('jsPDF did not load'));
        };
        script.onerror = () => {
          script.remove();
          reject(new Error('jsPDF could not be loaded'));
        };
        document.head.appendChild(script);
      }).catch((error) => {
        jsPdfPromise = null; // allow another try
        throw error;
      });
    }
    return jsPdfPromise;
  };

  // The logo as a data URL. Without it the PDF still works, with the name as text instead.
  let logoPromise = null;
  const loadLogo = () => {
    if (!urls.logo) return Promise.resolve(null);
    if (!logoPromise) {
      logoPromise = fetch(urls.logo)
        .then((response) => {
          if (!response.ok) throw new Error(`Logo ${response.status}`);
          return response.blob();
        })
        .then((blob) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        }))
        .catch(() => {
          logoPromise = null;
          return null;
        });
    }
    return logoPromise;
  };

  // Gives up on a request that hangs (slow or captive network) instead of leaving the buttons on
  // "Creating PDF…" for ever.
  const withTimeout = (promise, ms) => new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => { window.clearTimeout(timer); resolve(value); },
      (error) => { window.clearTimeout(timer); reject(error); }
    );
  });

  // "tel:" link without spaces, brackets or the German trunk "(0)": "+49 (0)30 123 456-78" → "tel:+493012345678".
  const telHref = (phone) => `tel:${String(phone).replace(/\s*\(0\)\s*/g, '').replace(/[^\d+]/g, '')}`;

  // The PDF's standard Helvetica font covers Western European text (WinAnsi): ä ö ü ß é € ’ “ ” – — • …
  // Anything else is swapped for a close match or left out, so it never prints as garbage.
  const WIN_ANSI_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
  const PDF_REPLACEMENTS = {
    ' ': ' ', ' ': ' ', ' ': ' ', ' ': ' ', ' ': ' ', ' ': ' ', ' ': ' ',
    '​': '', '‌': '', '‍': '', '⁠': '', '﻿': '', '­': '',
    '‐': '-', '‑': '-', '‒': '–', '−': '-', '―': '—',
    '′': '\'', '″': '"', '‛': '’', '‟': '”', '‹': '‹', '›': '›',
    '→': '->', '←': '<-', '↑': '', '↓': '', '↗': '', '↘': '',
    'Ł': 'L', 'ł': 'l', 'Đ': 'D', 'đ': 'd', 'ı': 'i', 'Œ': 'Œ', 'œ': 'œ'
  };
  const pdfSafe = (value) => Array.from(String(value === undefined || value === null ? '' : value).replace(/\r\n?/g, '\n'))
    .map((char) => {
      if (Object.prototype.hasOwnProperty.call(PDF_REPLACEMENTS, char)) return PDF_REPLACEMENTS[char];
      const code = char.codePointAt(0);
      if (code === 10) return char;
      if (code < 32) return ' ';
      if (code < 127 || (code >= 160 && code <= 255) || WIN_ANSI_EXTRA.includes(char)) return char;
      const plain = char.normalize('NFKD').replace(/[̀-ͯ]/g, '');
      return plain && Array.from(plain).every((c) => c.codePointAt(0) < 127 || (c.codePointAt(0) >= 160 && c.codePointAt(0) <= 255)) ? plain : '';
    })
    .join('')
    .replace(/ {2,}/g, ' ');

  const FILE_LETTERS = { Ä: 'Ae', Ö: 'Oe', Ü: 'Ue', ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss', Æ: 'Ae', æ: 'ae', Œ: 'Oe', œ: 'oe', Ø: 'O', ø: 'o', Ł: 'L', ł: 'l', Đ: 'D', đ: 'd', Þ: 'Th', þ: 'th', ı: 'i' };
  const fileSafe = (value) => value
    .replace(/[ÄÖÜäöüßÆæŒœØøŁłĐđÞþı]/g, (char) => FILE_LETTERS[char])
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '');

  // "Team-Snapshot-Company-2026-09-30.pdf"
  const pdfFileName = () => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const company = fileSafe(teamName());
    const base = fileSafe(t('pdfFileName')) || 'Team-Snapshot';
    return `${base}${company ? `-${company}` : ''}-${date}.pdf`;
  };

  const COLOURS = {
    ink: [29, 27, 47],
    muted: [84, 82, 99],
    coral: [189, 64, 51],
    rule: [205, 201, 192],
    paper: [251, 248, 240],
    acid: [216, 255, 82],
    acidTint: [243, 255, 206],
    lavender: [200, 189, 248],
    lavenderTint: [238, 234, 253],
    stuck: [231, 83, 66],
    white: [255, 255, 255]
  };
  const BAR_FILL = { clear: COLOURS.acid, attention: COLOURS.lavender, stuck: COLOURS.stuck };

  const buildPdf = (JsPDF, areas, summary, logo) => {
    const doc = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
    const PAGE_W = 210;
    const MARGIN = 18;
    const WIDTH = PAGE_W - MARGIN * 2;
    const TOP = 18;
    const BOTTOM = 276; // content stops here; the footer sits below
    const PT = 0.3528; // mm per point
    const upper = (text) => pdfSafe(String(text === undefined || text === null ? '' : text).toLocaleUpperCase(locale));
    let y = TOP;

    const lineHeight = (size, factor = 1.4) => size * PT * factor;
    const font = (size, style = 'normal', colour = COLOURS.ink) => {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      doc.setTextColor(...colour);
    };
    // A text block: wrapped lines plus the size and style to draw them with.
    const block = (text, width, size, style = 'normal', colour = COLOURS.ink, factor = 1.4) => {
      font(size, style, colour);
      const lines = text ? doc.splitTextToSize(pdfSafe(text), width) : [];
      return { lines, size, style, colour, factor, height: lines.length * lineHeight(size, factor) };
    };
    const draw = (item, x, top, options = {}) => {
      font(item.size, item.style, item.colour);
      item.lines.forEach((line, index) => {
        doc.text(line, x, top + index * lineHeight(item.size, item.factor), { baseline: 'top', ...options });
      });
      return top + item.height;
    };
    const link = (x, top, width, height, url) => {
      if (url) doc.link(x, top, width, height, { url });
    };
    const ensure = (height) => {
      if (y + height > BOTTOM && y > TOP) {
        doc.addPage();
        y = TOP;
      }
    };
    // Tips as bullet points with a hanging indent. Returns the height, or draws when `top` is given.
    const TIP_GAP = 1.1;
    const tipsHeight = (tips, width) => tips.reduce((sum, tip) => sum + block(tip, width - 5, 9.5).height + TIP_GAP, 0);
    const drawTips = (tips, x, top, width) => {
      let cursor = top;
      tips.forEach((tip) => {
        const item = block(tip, width - 5, 9.5);
        font(9.5, 'bold', COLOURS.coral);
        doc.text('•', x + 0.5, cursor, { baseline: 'top' });
        cursor = draw(item, x + 5, cursor) + TIP_GAP;
      });
      return cursor;
    };
    const statusLine = (area) => upper(statusText(area));

    doc.setProperties({
      title: pdfSafe(`${t('pdfDocTitle')}${teamName() ? ` – ${teamName()}` : ''}`),
      author: pdfSafe(contact.name || ''),
      subject: pdfSafe(t('pdfEyebrow')),
      creator: pdfSafe(contact.website || '')
    });
    doc.setLineHeightFactor(1.4);

    /* Header: logo on the left, contact details on the right */
    const contactLines = [
      { text: contact.name, style: 'bold', size: 11 },
      { text: contact.email, url: contact.email ? `mailto:${contact.email}` : '', size: 10 },
      { text: contact.website, url: contact.websiteUrl, size: 10 },
      { text: contact.phone, url: contact.phone ? telHref(contact.phone) : '', size: 10 }
    ].filter((line) => line.text);
    let contactY = TOP - 1;
    contactLines.forEach((line) => {
      font(line.size, line.style || 'normal', COLOURS.ink);
      const text = pdfSafe(line.text);
      doc.text(text, PAGE_W - MARGIN, contactY, { baseline: 'top', align: 'right' });
      const width = doc.getTextWidth(text);
      link(PAGE_W - MARGIN - width, contactY, width, lineHeight(line.size, 1.1), line.url);
      contactY += lineHeight(line.size, 1.45);
    });

    let logoBottom = TOP;
    let logoAdded = false;
    if (logo) {
      try {
        const props = doc.getImageProperties(logo);
        const logoWidth = 80;
        const logoHeight = logoWidth * (props.height / props.width);
        doc.addImage(logo, 'JPEG', MARGIN - 2, TOP - 3, logoWidth, logoHeight);
        logoBottom = TOP - 3 + logoHeight;
        logoAdded = true;
      } catch (error) {
        logoAdded = false;
      }
    }
    if (!logoAdded) {
      font(16, 'bold', COLOURS.ink);
      doc.text(pdfSafe(contact.name || ''), MARGIN, TOP, { baseline: 'top' });
      logoBottom = TOP + lineHeight(16);
    }
    y = Math.max(logoBottom, contactY) + 4;
    doc.setDrawColor(...COLOURS.ink);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 9;

    /* Title, company, date */
    font(8, 'bold', COLOURS.coral);
    doc.text(upper(t('pdfEyebrow')), MARGIN, y, { baseline: 'top', charSpace: 0.35 });
    y += 6;
    y = draw(block(t('pdfTitle'), WIDTH, 24, 'bold', COLOURS.ink, 1.15), MARGIN, y) + 2;
    if (teamName()) y = draw(block(teamName(), WIDTH, 13, 'bold'), MARGIN, y);
    y = draw(block(dateFormat.format(new Date()), WIDTH, 10, 'normal', COLOURS.muted), MARGIN, y) + 7;

    /* Overall score */
    {
      const pad = 6;
      const hasScore = summary.score !== null;
      const numberWidth = hasScore ? 40 : 0;
      const textX = MARGIN + pad + numberWidth;
      const textWidth = WIDTH - pad * 2 - numberWidth;
      const noScore = config.no_score || {};
      const title = block(hasScore ? (summary.level ? summary.level.title : '') : noScore.title, textWidth, 15, 'bold', COLOURS.ink, 1.2);
      const text = block(hasScore ? (summary.level ? summary.level.summary : '') : noScore.text, textWidth, 10);
      const basis = block(basisText(summary), textWidth, 8.5, 'normal', COLOURS.muted);
      const inner = lineHeight(7.5) + 2 + title.height + 1.5 + text.height + 2.5 + basis.height;
      const height = Math.max(inner, hasScore ? 26 : 0) + pad * 2;
      ensure(height);
      doc.setFillColor(...COLOURS.paper);
      doc.setDrawColor(...COLOURS.ink);
      doc.setLineWidth(0.3);
      doc.roundedRect(MARGIN, y, WIDTH, height, 3, 3, 'FD');
      let top = y + pad;
      if (hasScore) {
        font(38, 'bold', COLOURS.ink);
        const number = String(summary.score);
        doc.text(number, MARGIN + pad, top - 1, { baseline: 'top' });
        const numberW = doc.getTextWidth(number);
        font(11, 'bold', COLOURS.ink);
        doc.text(pdfSafe(t('outOf')), MARGIN + pad + numberW + 1.2, top + 8.5, { baseline: 'top' });
      }
      font(7.5, 'bold', COLOURS.coral);
      doc.text(upper(t('overallTitle')), textX, top, { baseline: 'top', charSpace: 0.3 });
      top += lineHeight(7.5) + 2;
      top = draw(title, textX, top) + 1.5;
      top = draw(text, textX, top) + 2.5;
      draw(basis, textX, top);
      y += height + 6;
    }

    /* Where to start */
    {
      const pad = 6;
      const innerWidth = WIDTH - pad * 2;
      const area = summary.start;
      const allClear = config.all_clear || {};
      const title = block(area ? area.question.topic : allClear.title, innerWidth, 15, 'bold', COLOURS.ink, 1.2);
      const status = area ? block(statusLine(area), innerWidth, 8, 'bold') : null;
      const text = block(area ? area.text : allClear.text, innerWidth, 10);
      const tipsH = area ? lineHeight(7.5) + 2 + tipsHeight(area.tips, innerWidth) : 0;
      const inner = lineHeight(7.5) + 2 + title.height + 1.5 + (status ? status.height + 1.5 : 0) + text.height + (area ? 3 + tipsH : 0);
      const height = inner + pad * 2;
      ensure(height);
      doc.setFillColor(...COLOURS.acidTint);
      doc.setDrawColor(...COLOURS.ink);
      doc.setLineWidth(0.6);
      doc.roundedRect(MARGIN, y, WIDTH, height, 3, 3, 'FD');
      const x = MARGIN + pad;
      let top = y + pad;
      font(7.5, 'bold', COLOURS.coral);
      doc.text(upper(t('startTitle')), x, top, { baseline: 'top', charSpace: 0.3 });
      top += lineHeight(7.5) + 2;
      top = draw(title, x, top) + 1.5;
      if (status) top = draw(status, x, top) + 1.5;
      top = draw(text, x, top);
      if (area) {
        top += 3;
        font(7.5, 'bold', COLOURS.ink);
        doc.text(upper(t('tipsLabel')), x, top, { baseline: 'top', charSpace: 0.3 });
        top += lineHeight(7.5) + 2;
        drawTips(area.tips, x, top, innerWidth);
      }
      y += height + 9;
    }

    /* All six areas */
    {
      const LEFT = 50;
      const rightX = MARGIN + LEFT + 6;
      const rightWidth = WIDTH - LEFT - 6;
      const note = unsureNoteText(summary);
      const noteBlock = note ? block(note, WIDTH, 8.5, 'normal', COLOURS.muted) : null;

      const measure = (area) => {
        const number = block(String(areas.indexOf(area) + 1).padStart(2, '0'), 10, 12, 'bold', COLOURS.coral, 1.2);
        const topic = block(area.question.topic, LEFT - 10, 12, 'bold', COLOURS.ink, 1.25);
        const status = block(statusLine(area), rightWidth - 48, 8, 'bold');
        const text = block(area.text, rightWidth, 10);
        let extra = 0;
        let ref = null;
        const showTips = area.status && area.status.key !== 'clear';
        if (showTips) {
          if (summary.start === area) {
            ref = block(t('startRef'), rightWidth, 9, 'italic', COLOURS.muted);
            extra = 2.5 + ref.height;
          } else {
            extra = 3 + lineHeight(7.5) + 2 + tipsHeight(area.tips, rightWidth);
          }
        }
        const rightHeight = Math.max(4, status.height) + 2.5 + text.height + extra;
        const height = Math.max(topic.height, rightHeight) + 8;
        return { number, topic, status, text, ref, showTips, height };
      };

      const heading = lineHeight(8) + 3 + (noteBlock ? noteBlock.height + 2 : 0);
      ensure(heading + measure(areas[0]).height);
      font(8, 'bold', COLOURS.ink);
      doc.text(upper(t('areasTitle')), MARGIN, y, { baseline: 'top', charSpace: 0.35 });
      y += lineHeight(8) + 1;
      doc.setDrawColor(...COLOURS.ink);
      doc.setLineWidth(0.4);
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += 2;
      if (noteBlock) y = draw(noteBlock, MARGIN, y + 1) + 1;

      areas.forEach((area, index) => {
        const m = measure(area);
        ensure(m.height);
        const top = y + 4;
        draw(m.number, MARGIN, top);
        draw(m.topic, MARGIN + 10, top);

        // Score bar: filled by score, dashed and empty when there is no score.
        const barWidth = 42;
        const barHeight = 3.2;
        const barY = top + 0.6;
        doc.setFillColor(...COLOURS.white);
        doc.setDrawColor(...COLOURS.ink);
        doc.setLineWidth(0.25);
        if (area.scored) {
          doc.roundedRect(rightX, barY, barWidth, barHeight, 1.6, 1.6, 'FD');
          const fillWidth = barWidth * (area.status.score / 100);
          doc.setFillColor(...(BAR_FILL[area.status.key] || COLOURS.lavender));
          if (fillWidth > 0) doc.roundedRect(rightX, barY, fillWidth, barHeight, 1.6, 1.6, 'FD');
        } else {
          doc.setLineDashPattern([0.8, 0.8], 0);
          doc.roundedRect(rightX, barY, barWidth, barHeight, 1.6, 1.6, 'S');
          doc.setLineDashPattern([], 0);
        }
        draw(m.status, rightX + barWidth + 5, top + 0.4);

        let cursor = top + Math.max(4, m.status.height) + 2.5;
        cursor = draw(m.text, rightX, cursor);
        if (m.showTips) {
          if (m.ref) {
            draw(m.ref, rightX, cursor + 2.5);
          } else {
            cursor += 3;
            font(7.5, 'bold', COLOURS.ink);
            doc.text(upper(t('tipsLabel')), rightX, cursor, { baseline: 'top', charSpace: 0.3 });
            cursor += lineHeight(7.5) + 2;
            drawTips(area.tips, rightX, cursor, rightWidth);
          }
        }
        y += m.height;
        if (index < areas.length - 1) {
          doc.setDrawColor(...COLOURS.rule);
          doc.setLineWidth(0.25);
          doc.line(MARGIN, y, PAGE_W - MARGIN, y);
        }
      });
      y += 7;
    }

    /* Closing box: Clarity Check and how to reach me */
    {
      const pad = 6;
      const innerWidth = WIDTH - pad * 2;
      const title = block(t('pdfCtaTitle'), innerWidth, 15, 'bold', COLOURS.ink, 1.2);
      const text = block(t('pdfCtaText'), innerWidth, 10);
      const price = data.clarityCheck && data.clarityCheck.price
        ? block(t('pdfCtaPrice', { price: data.clarityCheck.price }), innerWidth, 11, 'bold')
        : null;
      const reach = block(t('pdfCtaReach'), innerWidth, 10);
      const reachLines = [
        contact.email ? { text: t('pdfContactEmail', { email: contact.email }), url: `mailto:${contact.email}` } : null,
        contact.bookUrl ? { text: t('pdfContactWeb', { url: contact.bookLabel || contact.bookUrl }), url: contact.bookUrl } : null,
        contact.phone ? { text: t('pdfContactPhone', { phone: contact.phone }), url: telHref(contact.phone) } : null
      ].filter(Boolean).map((line) => ({ ...line, item: block(line.text, innerWidth, 10, 'bold') }));
      const reachHeight = reachLines.reduce((sum, line) => sum + line.item.height + 0.6, 0);
      const inner = lineHeight(7.5) + 2 + title.height + 2 + text.height + (price ? 3 + price.height : 0) + 3 + reach.height + 1.5 + reachHeight;
      const height = inner + pad * 2;
      ensure(height);
      doc.setFillColor(...COLOURS.lavenderTint);
      doc.setDrawColor(...COLOURS.ink);
      doc.setLineWidth(0.3);
      doc.roundedRect(MARGIN, y, WIDTH, height, 3, 3, 'FD');
      const x = MARGIN + pad;
      let top = y + pad;
      font(7.5, 'bold', COLOURS.coral);
      doc.text(upper(t('pdfCtaEyebrow')), x, top, { baseline: 'top', charSpace: 0.3 });
      top += lineHeight(7.5) + 2;
      top = draw(title, x, top) + 2;
      top = draw(text, x, top);
      if (price) top = draw(price, x, top + 3);
      top = draw(reach, x, top + 3) + 1.5;
      reachLines.forEach((line) => {
        draw(line.item, x, top);
        font(10, 'bold');
        link(x, top, Math.min(innerWidth, doc.getTextWidth(line.item.lines[0] || '')), line.item.height, line.url);
        top += line.item.height + 0.6;
      });
      y += height;
    }

    /* Footer on every page: website and email, page number */
    const pages = doc.getNumberOfPages();
    const footer = pdfSafe(t('pdfFooter', { website: contact.website || '', email: contact.email || '' }));
    for (let number = 1; number <= pages; number += 1) {
      doc.setPage(number);
      doc.setDrawColor(...COLOURS.rule);
      doc.setLineWidth(0.25);
      doc.line(MARGIN, 283, PAGE_W - MARGIN, 283);
      font(8, 'normal', COLOURS.muted);
      doc.text(footer, MARGIN, 286, { baseline: 'top' });
      doc.text(pdfSafe(t('pdfPage', { page: number, pages })), PAGE_W - MARGIN, 286, { baseline: 'top', align: 'right' });
      if (contact.websiteUrl) {
        font(8, 'normal', COLOURS.muted);
        link(MARGIN, 286, doc.getTextWidth(pdfSafe(contact.website || '')), 3.5, contact.websiteUrl);
      }
    }
    return doc;
  };

  const pdfStatus = (button) => {
    const wrap = button.closest('.snapshotActionsWrap');
    return wrap ? wrap.querySelector('[data-snapshot-pdf-status]') : null;
  };
  let pdfBusy = false;

  const downloadPdf = async (button) => {
    if (pdfBusy) return;
    const areas = collect();
    const summary = summarise(areas);
    if (!summary) return;
    pdfBusy = true;
    const status = pdfStatus(button);
    results.querySelectorAll('[data-snapshot-pdf-status]').forEach((node) => { node.textContent = ''; node.classList.remove('snapshotPdfStatus--error'); });
    pdfButtons.forEach((item) => {
      item.setAttribute('aria-disabled', 'true');
      const label = item.querySelector('[data-snapshot-pdf-label]');
      if (label) {
        if (!label.dataset.label) label.dataset.label = label.textContent;
        label.textContent = t('pdfCreating');
      }
    });
    try {
      // A slow logo only drops the logo (the name is shown as text instead); a slow jsPDF goes to
      // the catch below: error message plus the print window.
      const [JsPDF, logo] = await Promise.all([
        withTimeout(loadJsPdf(), 15000).catch((error) => {
          jsPdfPromise = null; // allow another try
          throw error;
        }),
        withTimeout(loadLogo(), 8000).catch(() => {
          logoPromise = null;
          return null;
        })
      ]);
      const doc = buildPdf(JsPDF, areas, summary, logo);
      doc.save(pdfFileName());
      if (status) status.textContent = t('pdfReady');
    } catch (error) {
      console.error('Team Snapshot PDF:', error);
      if (status) {
        status.textContent = t('pdfError');
        status.classList.add('snapshotPdfStatus--error');
      }
      window.setTimeout(() => window.print(), 400);
    } finally {
      pdfBusy = false;
      pdfButtons.forEach((item) => {
        item.removeAttribute('aria-disabled');
        const label = item.querySelector('[data-snapshot-pdf-label]');
        if (label && label.dataset.label) label.textContent = label.dataset.label;
      });
    }
  };

  pdfButtons.forEach((button) => {
    button.addEventListener('click', () => downloadPdf(button));
  });

  // Newsletter signup. Nothing is sent until the visitor submits this form with the consent box
  // ticked. Brevo's form endpoint doesn't allow cross-origin reads, so the request goes out with
  // mode 'no-cors': the reply can't be read, and a request that completes counts as sent. Brevo
  // then emails a confirmation link (double opt-in).
  if (signupForm) {
    const signupMode = signupForm.dataset.signupMode;
    const signupUrl = signupForm.dataset.signupUrl || '';
    const signupFields = signupForm.querySelector('[data-signup-fields]');
    const signupEmail = signupForm.querySelector('#signup-email');
    const signupConsent = signupForm.querySelector('#signup-consent');
    const signupHoneypot = signupForm.querySelector('#signup-check');
    const signupButton = signupForm.querySelector('[data-signup-submit]');
    const signupLabel = signupForm.querySelector('[data-signup-label]');
    const signupStatus = signupForm.querySelector('[data-signup-status]');
    let sending = false;

    const setStatus = (text, kind) => {
      signupStatus.className = `snapshotSignupStatus${kind ? ` snapshotSignupStatus--${kind}` : ''}`;
      signupStatus.textContent = text;
    };

    const setFieldError = (input, text) => {
      const error = document.getElementById(`${input.id}-error`);
      if (error) error.textContent = text;
      if (text) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    };

    // The browser accepts "name@company"; ask for a dot in the domain as well.
    const emailLooksValid = () => signupEmail.validity.valid && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.value.trim());

    const validateSignup = () => {
      const emailError = !signupEmail.value.trim() ? t('signupEmailMissing') : (emailLooksValid() ? '' : t('signupEmailInvalid'));
      const consentError = signupConsent.checked ? '' : t('signupConsentMissing');
      setFieldError(signupEmail, emailError);
      setFieldError(signupConsent, consentError);
      const firstInvalid = (emailError && signupEmail) || (consentError && signupConsent);
      if (firstInvalid) firstInvalid.focus();
      return !firstInvalid;
    };

    const signupBody = () => {
      const areas = collect();
      const summary = summarise(areas);
      const body = new URLSearchParams();
      body.append(BREVO_FIELDS.email, signupEmail.value.trim());
      body.append(BREVO_FIELDS.company, teamName());
      body.append(BREVO_FIELDS.score, summary && summary.score !== null ? String(summary.score) : '');
      body.append(BREVO_FIELDS.areas, areasText(areas));
      body.append(BREVO_FIELDS.optIn, '1');
      body.append(BREVO_FIELDS.honeypot, signupHoneypot ? signupHoneypot.value : '');
      body.append(BREVO_FIELDS.locale, t('signupLocale') || document.documentElement.lang || '');
      body.append(BREVO_FIELDS.htmlType, 'simple');
      return body;
    };

    signupEmail.addEventListener('input', () => {
      if (signupEmail.hasAttribute('aria-invalid') && emailLooksValid()) setFieldError(signupEmail, '');
    });
    signupConsent.addEventListener('change', () => {
      if (signupConsent.checked) setFieldError(signupConsent, '');
    });

    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (sending) return;
      setStatus('');
      if (!validateSignup()) return;
      const body = signupBody();

      if (signupMode !== 'live' || !signupUrl) {
        // Local preview without brevo_form_url: show what would be sent, send nothing.
        console.info('Team Snapshot newsletter preview, not sent:', Object.fromEntries(body));
        window.setTimeout(() => setStatus(t('signupPreview'), 'preview'), 50);
        return;
      }

      sending = true;
      // aria-disabled rather than disabled: a disabled button drops keyboard focus to <body>.
      // The sending flag already blocks double submits.
      signupButton.setAttribute('aria-disabled', 'true');
      signupLabel.textContent = t('signupSending');
      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      const timer = controller ? window.setTimeout(() => controller.abort(), 20000) : 0;
      try {
        await fetch(signupUrl, {
          method: 'POST',
          mode: 'no-cors',
          body,
          signal: controller ? controller.signal : undefined
        });
        signupFields.hidden = true;
        setStatus(t('signupSuccess'), 'success');
        signupStatus.focus();
      } catch (error) {
        signupLabel.textContent = t('signupRetry');
        setStatus(t('signupFailure'), 'error');
      } finally {
        window.clearTimeout(timer);
        sending = false;
        signupButton.removeAttribute('aria-disabled');
      }
    });
  }

  // Print fallback (and Ctrl+P): give the saved PDF a useful file name while printing.
  const originalTitle = document.title;
  window.addEventListener('beforeprint', () => {
    if (results.hidden) return;
    const name = teamName();
    document.title = `${t('printTitle')}${name ? ` – ${name}` : ''} – ${dateFormat.format(new Date())}`;
  });
  window.addEventListener('afterprint', () => {
    document.title = originalTitle;
  });

  updateProgress();
  submit.disabled = false;
})();
