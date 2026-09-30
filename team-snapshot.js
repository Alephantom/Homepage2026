// Free Team Snapshot: scores the answers in the browser and shows the results on the page.
// Nothing is sent or stored. Content comes from _data/team_snapshot.yml and
// _data/team_snapshot_results.yml via the JSON block in team-snapshot.html.
(() => {
  const page = document.querySelector('[data-snapshot]');
  const dataElement = document.getElementById('snapshot-data');
  if (!page || !dataElement) return;

  let data;
  try {
    data = JSON.parse(dataElement.textContent);
  } catch (error) {
    return;
  }

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

  const questions = data.questions || [];
  const config = data.results || {};
  const statuses = config.statuses || {};
  const levels = (config.levels || []).slice().sort((a, b) => b.min - a.min);
  const notAnswered = config.not_answered || { label: 'Not answered', text: '' };
  const total = questions.length;
  const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Small DOM helper: text is always set with textContent, never parsed as HTML.
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

  const teamName = () => teamInput.value.replace(/\s+/g, ' ').trim();

  const collect = () => questions.map((question) => {
    const checked = form.querySelector(`input[name="${CSS.escape(question.id)}"]:checked`);
    const key = checked ? checked.value : null;
    const status = key && statuses[key] ? { key, ...statuses[key] } : null;
    return {
      question,
      status,
      text: status && question.results ? question.results[key] : notAnswered.text,
      tips: question.tips || []
    };
  });

  const summarise = (areas) => {
    const answered = areas.filter((area) => area.status);
    if (!answered.length) return null;
    const score = Math.round(answered.reduce((sum, area) => sum + area.status.score, 0) / answered.length);
    const level = levels.find((item) => score >= item.min) || levels[levels.length - 1];
    // Lowest-scoring answered area; on a tie the earlier question wins.
    const start = answered.reduce((lowest, area) => (area.status.score < lowest.status.score ? area : lowest));
    return { answered, score, level, start: start.status.key === 'clear' ? null : start };
  };

  const statusText = (area) => (area.status ? `${area.status.label} · ${area.status.score}/100` : notAnswered.label);

  const updateProgress = () => {
    const count = collect().filter((area) => area.status).length;
    progress.textContent = `${count} of ${total} answered`;
    if (count) errorMessage.textContent = '';
  };

  const tipList = (tips, className) => {
    const list = el('ul', className);
    tips.forEach((tip) => list.appendChild(el('li', '', tip)));
    return list;
  };

  const renderOverall = (summary) => {
    overallOutput.replaceChildren();
    overallOutput.appendChild(el('h3', 'eyebrow snapshotCardTitle', 'Overall score'));
    const score = el('p', 'snapshotScore');
    score.appendChild(el('span', 'snapshotScoreNumber', String(summary.score)));
    score.appendChild(el('span', 'snapshotScoreOutOf', '/100'));
    overallOutput.appendChild(score);
    overallOutput.appendChild(el('p', 'snapshotLevelTitle', summary.level ? summary.level.title : ''));
    overallOutput.appendChild(el('p', '', summary.level ? summary.level.summary : ''));
    const skipped = total - summary.answered.length;
    const basis = skipped
      ? `Based on ${summary.answered.length} of ${total} areas. ${skipped} not answered, so not counted.`
      : `Based on all ${total} areas.`;
    overallOutput.appendChild(el('p', 'snapshotSmall', basis));
  };

  const renderStart = (summary) => {
    startOutput.replaceChildren();
    startOutput.appendChild(el('h3', 'eyebrow snapshotCardTitle', 'Where to start'));
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
    startOutput.appendChild(el('p', 'snapshotTipsLabel', 'Try this week'));
    startOutput.appendChild(tipList(area.tips, 'snapshotTips'));
  };

  const renderAreas = (areas, summary) => {
    areasOutput.replaceChildren();
    areas.forEach((area, index) => {
      const key = area.status ? area.status.key : 'none';
      const item = el('li', `snapshotArea snapshotArea--${key}`);

      const head = el('div', 'snapshotAreaHead');
      head.appendChild(el('span', 'snapshotAreaNumber', String(index + 1).padStart(2, '0')));
      head.appendChild(el('h4', '', area.question.topic));
      item.appendChild(head);

      const body = el('div', 'snapshotAreaBody');
      const scoreRow = el('div', 'snapshotAreaScore');
      const bar = el('div', 'snapshotBar');
      bar.setAttribute('aria-hidden', 'true');
      const fill = el('span', 'snapshotBarFill');
      fill.style.width = `${area.status ? area.status.score : 0}%`;
      bar.appendChild(fill);
      scoreRow.appendChild(bar);
      scoreRow.appendChild(el('p', 'snapshotStatus', statusText(area)));
      body.appendChild(scoreRow);
      body.appendChild(el('p', 'snapshotAreaText', area.text));

      if (area.status && area.status.key !== 'clear') {
        if (summary.start === area) {
          body.appendChild(el('p', 'snapshotTipsLabel snapshotTipsLabel--ref', 'Your starting point: see the tips under “Where to start” above.'));
        } else {
          body.appendChild(el('p', 'snapshotTipsLabel', 'Try this week'));
          body.appendChild(tipList(area.tips, 'snapshotTips'));
        }
      }
      item.appendChild(body);
      areasOutput.appendChild(item);
    });

    const hasUnsure = areas.some((area) => area.status && area.status.key === 'unsure');
    const note = statuses.unsure && statuses.unsure.note;
    unsureNote.hidden = !(hasUnsure && note);
    unsureNote.textContent = hasUnsure && note ? `About “${statuses.unsure.label}”: ${note}` : '';
  };

  const bookingHref = (areas, summary) => {
    const price = data.clarityCheck ? `${data.clarityCheck.price} ${data.clarityCheck.vatNote}` : '';
    const lines = [
      'Hi Anna-Lena,',
      '',
      `I’ve just done the free Team Snapshot and I’d like to book a Clarity Check${price ? ` (${price})` : ''}.`,
      ''
    ];
    if (teamName()) lines.push(`Team or company: ${teamName()}`, '');
    lines.push('My Team Snapshot results:');
    areas.forEach((area) => {
      lines.push(`${area.question.topic}: ${area.status ? `${area.status.label} (${area.status.score}/100)` : notAnswered.label}`);
    });
    const skipped = areas.length - summary.answered.length;
    const basis = skipped ? `, based on ${summary.answered.length} of ${areas.length} areas` : '';
    lines.push(`Overall: ${summary.score}/100 (${summary.level ? summary.level.title : ''})${basis}`);
    lines.push('', 'The challenge I’d like to look at:', '', '', 'Our team (what we do, roughly how many people):', '');
    const subject = 'Booking a Clarity Check';
    return `mailto:${data.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
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
        errorMessage.textContent = 'Choose an answer for at least one question to see your results.';
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
    bookLink.href = bookingHref(areas, summary);

    results.hidden = false;
    document.documentElement.classList.add('snapshotHasResults');

    if (moveFocus) {
      announce.textContent = '';
      const level = summary.level ? `: ${summary.level.title}` : '';
      window.setTimeout(() => {
        announce.textContent = `Your results are ready. Overall score ${summary.score} out of 100${level}.`;
      }, 100);
      resultsHeading.focus({ preventScroll: true });
      results.scrollIntoView({ block: 'start' });
    }
  };

  form.addEventListener('change', () => {
    updateProgress();
    if (!results.hidden) render({ moveFocus: false });
  });

  teamInput.addEventListener('input', () => {
    if (!results.hidden) render({ moveFocus: false });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    render({ moveFocus: true });
  });

  results.querySelector('[data-snapshot-print]').addEventListener('click', () => window.print());

  results.querySelector('[data-snapshot-edit]').addEventListener('click', () => {
    questionsHeading.focus({ preventScroll: true });
    questionsHeading.scrollIntoView({ block: 'start' });
  });

  // Give the saved PDF a useful file name while printing.
  const originalTitle = document.title;
  window.addEventListener('beforeprint', () => {
    if (results.hidden) return;
    const name = teamName();
    document.title = `Team Snapshot${name ? ` – ${name}` : ''} – ${dateFormat.format(new Date())}`;
  });
  window.addEventListener('afterprint', () => {
    document.title = originalTitle;
  });

  updateProgress();
  submit.disabled = false;
})();
