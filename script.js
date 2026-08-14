const siteNav = document.querySelector("[data-site-nav]");

if (siteNav) {
  const navMenuToggle = siteNav.querySelector("[data-nav-menu-toggle]");
  const navMobileMenu = siteNav.querySelector("[data-nav-mobile-menu]");
  const navSectionLinks = Array.from(siteNav.querySelectorAll("[data-nav-section]"));
  const navSections = Array.from(new Set(navSectionLinks.map((link) => link.dataset.navSection)))
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setMenuOpen = (open, returnFocus = false) => {
    if (!navMenuToggle || !navMobileMenu) return;

    navMenuToggle.setAttribute("aria-expanded", String(open));
    navMenuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    navMobileMenu.hidden = !open;

    if (!open && returnFocus) navMenuToggle.focus();
  };

  navMenuToggle?.addEventListener("click", () => {
    setMenuOpen(navMenuToggle.getAttribute("aria-expanded") !== "true");
  });

  navMobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("click", (event) => {
    if (!siteNav.contains(event.target)) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navMenuToggle?.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false, true);
    }
  });

  window.matchMedia("(min-width: 981px)").addEventListener("change", (event) => {
    if (event.matches) setMenuOpen(false);
  });

  const updateStickyState = () => {
    siteNav.classList.toggle("isScrolled", window.scrollY > 8);
  };

  let navSectionFrame = null;
  const updateActiveSection = () => {
    navSectionFrame = null;
    if (!navSections.length) return;

    const activationLine = siteNav.offsetHeight + window.innerHeight * 0.2;
    const activeSection = navSections.find((section) => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= activationLine && bounds.bottom > activationLine;
    });

    navSectionLinks.forEach((link) => {
      if (activeSection && link.dataset.navSection === activeSection.id) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const scheduleNavUpdate = () => {
    updateStickyState();
    if (!navSectionFrame) navSectionFrame = window.requestAnimationFrame(updateActiveSection);
  };

  window.addEventListener("scroll", scheduleNavUpdate, { passive: true });
  window.addEventListener("resize", scheduleNavUpdate);
  updateStickyState();
  updateActiveSection();
}

const portraitFrame = document.querySelector("#portrait-frame");

if (portraitFrame) {
  const baseUrl = document.body.dataset.baseurl || "";
  const loadPortrait = () => {
    const portrait = new Image();
    portrait.alt = "Portrait of Anna-Lena";
    portrait.className = "portraitPhoto";
    portrait.decoding = "async";
    portrait.addEventListener("load", () => {
      portraitFrame.replaceChildren(portrait);
      portraitFrame.classList.add("hasPhoto");
    }, { once: true });
    portrait.src = `${baseUrl}/assets/portrait-friendly.jpg`;
  };

  if ("IntersectionObserver" in window) {
    const portraitObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      portraitObserver.disconnect();
      loadPortrait();
    }, { rootMargin: "300px" });

    portraitObserver.observe(portraitFrame);
  } else {
    loadPortrait();
  }
}

const typingHeadline = document.querySelector("[data-typing-headline]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const portfolioCarousel = document.querySelector("[data-portfolio-carousel]");
const locationTypewriter = document.querySelector("[data-location-typewriter]");

if (portfolioCarousel) {
  const portfolioSlides = Array.from(portfolioCarousel.querySelectorAll("[data-portfolio-slide]"));
  const previousCaseButton = portfolioCarousel.querySelector("[data-portfolio-previous]");
  const nextCaseButton = portfolioCarousel.querySelector("[data-portfolio-next]");
  const carouselStatus = portfolioCarousel.querySelector("[data-portfolio-carousel-status]");
  let activeCaseIndex = 0;

  if (portfolioSlides.length <= 1) {
    previousCaseButton.hidden = true;
    nextCaseButton.hidden = true;
    carouselStatus.hidden = true;
  }

  const showPortfolioCase = (nextIndex) => {
    activeCaseIndex = (nextIndex + portfolioSlides.length) % portfolioSlides.length;

    portfolioSlides.forEach((slide, index) => {
      const isCurrent = index === activeCaseIndex;
      slide.hidden = !isCurrent;
      slide.classList.toggle("isCurrent", isCurrent);
      slide.setAttribute("aria-hidden", String(!isCurrent));
    });

    carouselStatus.textContent = `Case ${String(activeCaseIndex + 1).padStart(2, "0")} of ${String(portfolioSlides.length).padStart(2, "0")}`;
  };

  previousCaseButton.addEventListener("click", () => showPortfolioCase(activeCaseIndex - 1));
  nextCaseButton.addEventListener("click", () => showPortfolioCase(activeCaseIndex + 1));

  showPortfolioCase(activeCaseIndex);
}

if (typingHeadline && !prefersReducedMotion.matches) {
  const textWalker = document.createTreeWalker(typingHeadline, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (textWalker.nextNode()) {
    textNodes.push(textWalker.currentNode);
  }

  const characters = [];

  textNodes.forEach((textNode) => {
    const characterFragment = document.createDocumentFragment();

    Array.from(textNode.textContent).forEach((character) => {
      const characterSpan = document.createElement("span");
      characterSpan.className = "heroTypeCharacter";
      characterSpan.setAttribute("aria-hidden", "true");
      characterSpan.textContent = character;
      characterFragment.append(characterSpan);
      characters.push(characterSpan);
    });

    textNode.replaceWith(characterFragment);
  });

  typingHeadline.classList.add("isTyping");

  let characterIndex = 0;

  const typeNextCharacter = () => {
    const previousCharacter = characters[characterIndex - 1];
    const currentCharacter = characters[characterIndex];

    previousCharacter?.classList.remove("isCurrent");

    if (!currentCharacter) {
      window.setTimeout(() => {
        typingHeadline.classList.remove("isTyping");
        previousCharacter?.classList.remove("isCurrent");
      }, 900);
      return;
    }

    currentCharacter.classList.add("isTyped", "isCurrent");
    characterIndex += 1;

    window.setTimeout(typeNextCharacter, currentCharacter.textContent === " " ? 38 : 66);
  };

  window.setTimeout(typeNextCharacter, 240);
}

if (locationTypewriter) {
  const locationWords = locationTypewriter.dataset.locationWords
    .split("|")
    .map((word) => word.trim())
    .filter(Boolean);
  const finalLocation = locationWords[locationWords.length - 1] || locationTypewriter.textContent.trim();

  if (prefersReducedMotion.matches || locationWords.length < 2) {
    locationTypewriter.textContent = finalLocation;
  } else {
    const typeSpeed = 72;
    const eraseSpeed = 38;
    const holdDelay = 820;
    let wordIndex = 0;
    let characterIndex = 0;
    let isErasing = false;

    locationTypewriter.classList.add("isTyping");
    locationTypewriter.textContent = "";

    const typeLocation = () => {
      const currentWord = locationWords[wordIndex];
      const isFinalWord = wordIndex === locationWords.length - 1;

      if (!isErasing) {
        characterIndex += 1;
        locationTypewriter.textContent = currentWord.slice(0, characterIndex);

        if (characterIndex === currentWord.length) {
          if (isFinalWord) {
            window.setTimeout(() => {
              locationTypewriter.classList.remove("isTyping");
            }, 900);
            return;
          }

          isErasing = true;
          window.setTimeout(typeLocation, holdDelay);
          return;
        }

        window.setTimeout(typeLocation, typeSpeed);
        return;
      }

      characterIndex -= 1;
      locationTypewriter.textContent = currentWord.slice(0, characterIndex);

      if (characterIndex === 0) {
        isErasing = false;
        wordIndex += 1;
      }

      window.setTimeout(typeLocation, eraseSpeed);
    };

    window.setTimeout(typeLocation, 680);
  }
}

const calendlyContainer = document.querySelector("[data-calendly-container]");

if (calendlyContainer) {
  const calendlyGate = document.querySelector("[data-calendly-gate]");
  const calendlyButton = calendlyGate?.querySelector("[data-calendly-load]");
  const calendlyStatus = calendlyGate?.querySelector("[data-calendly-status]");
  const calendlyUrl = calendlyContainer.dataset.calendlyUrl;

  const showCalendlyError = () => {
    calendlyButton.disabled = false;
    calendlyButton.textContent = "Try again";
    calendlyStatus.textContent = "The calendar could not be loaded. You can still open Calendly in a new tab.";
  };

  const initialiseCalendly = () => {
    if (!window.Calendly?.initInlineWidget) {
      showCalendlyError();
      return;
    }

    const styledUrl = new URL(calendlyUrl);
    styledUrl.searchParams.set("background_color", "fbf8f0");
    styledUrl.searchParams.set("text_color", "1d1b2f");
    styledUrl.searchParams.set("primary_color", "f05a47");

    calendlyGate.hidden = true;
    calendlyContainer.hidden = false;
    window.Calendly.initInlineWidget({
      parentElement: calendlyContainer,
      url: styledUrl.toString(),
    });
  };

  calendlyButton?.addEventListener("click", () => {
    calendlyButton.disabled = true;
    calendlyButton.textContent = "Loading…";
    calendlyStatus.textContent = "Connecting to Calendly…";

    const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');

    if (existingScript) {
      if (window.Calendly) initialiseCalendly();
      else existingScript.addEventListener("load", initialiseCalendly, { once: true });
      return;
    }

    const calendlyScript = document.createElement("script");
    calendlyScript.src = "https://assets.calendly.com/assets/external/widget.js";
    calendlyScript.async = true;
    calendlyScript.addEventListener("load", initialiseCalendly, { once: true });
    calendlyScript.addEventListener("error", showCalendlyError, { once: true });
    document.head.append(calendlyScript);
  });
}
