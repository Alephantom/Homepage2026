const portraitFrame = document.querySelector("#portrait-frame");

if (portraitFrame) {
  const baseUrl = document.body.dataset.baseurl || "";
  const portrait = new Image();
  portrait.alt = "Portrait of Anna-Lena";
  portrait.className = "portraitPhoto";
  portrait.addEventListener("load", () => {
    portraitFrame.replaceChildren(portrait);
    portraitFrame.classList.add("hasPhoto");
  }, { once: true });
  portrait.src = `${baseUrl}/assets/portrait-friendly.png`;
}

const typingHeadline = document.querySelector("[data-typing-headline]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const portfolioCard = document.querySelector("[data-portfolio-card]");
const portfolioCarousel = document.querySelector("[data-portfolio-carousel]");
const locationTypewriter = document.querySelector("[data-location-typewriter]");

if (portfolioCarousel) {
  const portfolioSlides = Array.from(portfolioCarousel.querySelectorAll("[data-portfolio-slide]"));
  const previousCaseButton = portfolioCarousel.querySelector("[data-portfolio-previous]");
  const nextCaseButton = portfolioCarousel.querySelector("[data-portfolio-next]");
  const carouselStatus = portfolioCarousel.querySelector("[data-portfolio-carousel-status]");
  let activeCaseIndex = 0;

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

if (portfolioCard) {
  const portfolioFaces = Array.from(portfolioCard.querySelectorAll(".portfolioCaseFace"));
  const portfolioStatus = document.querySelector("[data-portfolio-status]");
  let activePortfolioFace = 0;
  let portfolioIsTurning = false;

  const measurePortfolioCard = () => {
    portfolioCard.classList.add("isMeasuring");
    const activeFaceHeight = portfolioFaces[activePortfolioFace].scrollHeight;
    portfolioCard.classList.remove("isMeasuring");
    portfolioCard.style.height = `${activeFaceHeight + 8}px`;
  };

  const showPortfolioFace = (faceIndex) => {
    portfolioCard.dataset.activeFace = String(faceIndex);

    portfolioFaces.forEach((face, index) => {
      const isActive = index === faceIndex;
      face.classList.toggle("isActive", isActive);
      face.setAttribute("aria-hidden", String(!isActive));
    });

    const currentLabel = portfolioFaces[faceIndex].dataset.cardLabel;
    const nextLabel = portfolioFaces[(faceIndex + 1) % portfolioFaces.length].dataset.cardLabel;
    portfolioStatus.textContent = `${currentLabel} · ${faceIndex + 1} of ${portfolioFaces.length}`;
    portfolioCard.setAttribute(
      "aria-label",
      `Mindfulife portfolio card. Showing ${currentLabel.toLowerCase()}. Activate to show ${nextLabel.toLowerCase()}.`,
    );
  };

  const rotatePortfolioCard = () => {
    if (portfolioIsTurning) return;

    const nextFace = (activePortfolioFace + 1) % portfolioFaces.length;

    if (prefersReducedMotion.matches) {
      activePortfolioFace = nextFace;
      showPortfolioFace(activePortfolioFace);
      measurePortfolioCard();
      return;
    }

    portfolioIsTurning = true;
    portfolioCard.classList.add("isTurning");

    window.setTimeout(() => {
      activePortfolioFace = nextFace;
      showPortfolioFace(activePortfolioFace);
      measurePortfolioCard();
    }, 360);

    window.setTimeout(() => {
      portfolioCard.classList.remove("isTurning");
      portfolioIsTurning = false;
      measurePortfolioCard();
    }, 740);
  };

  portfolioCard.addEventListener("click", rotatePortfolioCard);
  portfolioCard.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    rotatePortfolioCard();
  });
  window.addEventListener("resize", measurePortfolioCard);

  showPortfolioFace(activePortfolioFace);
  measurePortfolioCard();
  document.fonts?.ready.then(measurePortfolioCard);
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
