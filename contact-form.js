// Contact page helpers:
// - the enquiry topic: links can open the page with ?topic=<slug> (see _data/contact_topics.yml),
//   and another page can hand over a note in sessionStorage under "contactPrefill";
// - the Formspree contact form (when contact_form_endpoint is set);
// - the "Copy address" button and the email draft link on the email card (when it is not).

(() => {
  const DEFAULT_TOPIC = "general";
  const PREFILL_KEY = "contactPrefill";
  const MAX_PREFILL_LENGTH = 4000;

  const readTopics = () => {
    const source = document.querySelector("[data-contact-topics]");
    if (!source) return {};
    try {
      const parsed = JSON.parse(source.textContent);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  };

  const topics = readTopics();
  const toSlug = (value) => (typeof value === "string" ? value.trim().toLowerCase() : "");
  const isKnownTopic = (slug) => Boolean(slug) && Object.prototype.hasOwnProperty.call(topics, slug);

  // One-time hand-over from another page, e.g. the Team Snapshot's "Book your Clarity Check":
  // sessionStorage.contactPrefill = '{"topic":"clarity-check","message":"…"}'.
  // It is read once and removed straight away, so a reload or a later visit starts empty.
  const takePrefill = () => {
    let raw = null;
    try {
      raw = window.sessionStorage.getItem(PREFILL_KEY);
      window.sessionStorage.removeItem(PREFILL_KEY);
    } catch (error) {
      return null;
    }
    if (!raw) return null;

    try {
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return null;
      const message = typeof data.message === "string" ? data.message.trim().slice(0, MAX_PREFILL_LENGTH) : "";
      return { topic: toSlug(data.topic), message };
    } catch (error) {
      return null;
    }
  };

  const prefill = takePrefill();
  const urlTopic = toSlug(new URLSearchParams(window.location.search).get("topic"));
  let topic = DEFAULT_TOPIC;
  if (isKnownTopic(urlTopic)) {
    topic = urlTopic;
  } else if (prefill && isKnownTopic(prefill.topic)) {
    topic = prefill.topic;
  }

  // Only use a handed-over note that was meant for this topic.
  const prefillMessage = prefill && (!prefill.topic || prefill.topic === topic) ? prefill.message : "";
  const topicInfo = topics[topic] || {};

  const contactForm = document.querySelector("[data-contact-form]");

  if (contactForm) {
    const submitButton = contactForm.querySelector("[data-contact-submit]");
    const statusRegion = contactForm.querySelector("[data-contact-status]");
    const successTemplate = contactForm.querySelector("[data-contact-success]");
    const errorTemplate = contactForm.querySelector("[data-contact-error]");
    const topicSelect = contactForm.querySelector("[data-contact-topic]");
    const subjectInput = contactForm.querySelector("[data-contact-subject]");
    const messageInput = contactForm.querySelector("[data-contact-message]");
    const submitLabel = submitButton.textContent.trim();
    const sendingLabel = contactForm.dataset.i18nSending || submitLabel;
    const subjectTemplate = contactForm.dataset.i18nSubject || "";
    const baseSubject = subjectInput ? subjectInput.value : "";
    const requestTimeoutMs = 20000;
    let isSending = false;

    const selectTopic = (slug) => {
      if (!topicSelect) return;
      const options = Array.from(topicSelect.options);
      const match = options.find((option) => option.value === slug);
      if (!match) return;
      // Mark it as the default too, so form.reset() after sending keeps the topic.
      options.forEach((option) => {
        option.defaultSelected = option === match;
      });
      topicSelect.value = slug;
    };

    // Formspree uses _subject as the email subject, e.g. "New enquiry: Clarity Check".
    const updateSubject = () => {
      if (!subjectInput) return;
      const option = topicSelect?.selectedOptions?.[0];
      const label = option ? option.textContent.trim() : "";
      const useTopic = option && option.value !== DEFAULT_TOPIC && label && subjectTemplate.includes("{topic}");
      subjectInput.value = useTopic ? subjectTemplate.replace("{topic}", label) : baseSubject;
    };

    selectTopic(topic);
    updateSubject();
    topicSelect?.addEventListener("change", updateSubject);

    if (messageInput && prefillMessage && !messageInput.value.trim()) {
      messageInput.value = prefillMessage;
    }

    const showStatus = (template) => {
      statusRegion.replaceChildren(template.content.cloneNode(true));
    };

    const setSending = (sending) => {
      isSending = sending;
      // aria-disabled rather than disabled: a disabled button drops keyboard focus to <body>.
      // isSending already blocks double submits.
      submitButton.setAttribute("aria-disabled", String(sending));
      submitButton.textContent = sending ? sendingLabel : submitLabel;
      contactForm.setAttribute("aria-busy", String(sending));
    };

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (isSending) return;

      updateSubject();
      setSending(true);
      statusRegion.replaceChildren();

      const controller = "AbortController" in window ? new AbortController() : null;
      const timeoutId = controller ? window.setTimeout(() => controller.abort(), requestTimeoutMs) : null;

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" },
          signal: controller?.signal,
        });

        if (!response.ok) throw new Error(`Form service responded with ${response.status}`);

        contactForm.reset();
        updateSubject();
        showStatus(successTemplate);
      } catch (error) {
        showStatus(errorTemplate);
      } finally {
        if (timeoutId) window.clearTimeout(timeoutId);
        setSending(false);
      }
    });
  }

  const copyBlock = document.querySelector("[data-copy-email]");

  if (copyBlock) {
    const copyButton = copyBlock.querySelector("[data-copy-button]");
    const copySource = copyBlock.querySelector("[data-copy-source]");
    const copyStatus = copyBlock.querySelector("[data-copy-status]");
    const buttonLabel = copyButton.textContent.trim();
    const address = copySource.textContent.trim();
    let resetTimer = null;

    const selectAddress = () => {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(copySource);
      selection.removeAllRanges();
      selection.addRange(range);
    };

    const copyAddress = async () => {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(address);
          return true;
        } catch (error) {
          // Fall through to selecting the text.
        }
      }

      selectAddress();
      try {
        return document.execCommand("copy");
      } catch (error) {
        return false;
      }
    };

    copyButton.hidden = false;
    copyButton.addEventListener("click", async () => {
      const copied = await copyAddress();
      window.clearTimeout(resetTimer);

      if (copied) {
        copyButton.textContent = copyBlock.dataset.i18nCopied || buttonLabel;
        copyStatus.textContent = copyBlock.dataset.i18nCopiedStatus || "";
        resetTimer = window.setTimeout(() => {
          copyButton.textContent = buttonLabel;
        }, 2500);
      } else {
        copyButton.textContent = buttonLabel;
        selectAddress();
        copyStatus.textContent = copyBlock.dataset.i18nSelectStatus || "";
      }
    });
  }

  // Email draft link on the email card: subject from the topic, body from a handed-over note
  // (or the topic's starting note). Built by hand with encodeURIComponent, because
  // URLSearchParams would turn spaces into "+", which several mail programs show literally.
  const mailtoLink = document.querySelector("[data-contact-mailto]");

  if (mailtoLink) {
    const address = (mailtoLink.getAttribute("href") || "").replace(/^mailto:/i, "").split("?")[0];
    const encode = (text) => encodeURIComponent(text.replace(/\r\n|\r|\n/g, "\r\n"));
    const subject = topicInfo.emailSubject || "";
    const body = prefillMessage || topicInfo.emailBody || "";

    if (address && subject) {
      mailtoLink.href = `mailto:${address}?subject=${encode(subject)}${body ? `&body=${encode(body)}` : ""}`;
    }

    const topicNote = document.querySelector("[data-contact-topic-note]");
    const noteTemplate = body ? topicNote?.dataset.i18nTopicNotePrefill : topicNote?.dataset.i18nTopicNote;
    if (topicNote && noteTemplate && topicInfo.label && (topic !== DEFAULT_TOPIC || prefillMessage)) {
      topicNote.textContent = noteTemplate.replace("{topic}", topicInfo.label);
      topicNote.hidden = false;
    }
  }

  // Keep the topic when switching language: /contact.html?topic=workshop#write → /de/kontakt/?topic=workshop#schreiben.
  // (A handed-over note isn't carried over: it was read once and removed above.)
  if (topic !== DEFAULT_TOPIC) {
    const formHash = { en: "#write", de: "#schreiben" };
    const onForm = Object.values(formHash).includes(window.location.hash);
    document.querySelectorAll("a[hreflang][lang]").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (!/contact|kontakt/.test(href) || href.includes("?")) return;
      const hash = onForm ? formHash[link.getAttribute("hreflang")] || "" : "";
      link.setAttribute("href", `${href.split("#")[0]}?topic=${encodeURIComponent(topic)}${hash}`);
    });
  }
})();
