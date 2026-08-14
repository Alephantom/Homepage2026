(() => {
  const measurementId = document.body.dataset.googleAnalyticsId?.trim();
  const banner = document.querySelector("[data-consent-banner]");

  if (!measurementId || !banner) return;

  const storageKey = "al_privacy_consent_v1";
  const configuredDays = Number.parseInt(document.body.dataset.consentStorageDays || "180", 10);
  const storageDays = Number.isFinite(configuredDays) ? configuredDays : 180;
  const choiceDuration = storageDays * 24 * 60 * 60 * 1000;
  const acceptButton = banner.querySelector("[data-consent-accept]");
  const rejectButton = banner.querySelector("[data-consent-reject]");
  const settingsButtons = document.querySelectorAll("[data-cookie-settings-open]");
  let analyticsLoaded = false;
  let returnFocusTo = null;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  window.gtag("set", "ads_data_redaction", true);

  const readChoice = () => {
    try {
      const savedChoice = JSON.parse(window.localStorage.getItem(storageKey));

      if (!savedChoice || savedChoice.expiresAt <= Date.now()) {
        window.localStorage.removeItem(storageKey);
        return null;
      }

      return savedChoice.analytics === "granted" ? "granted" : "denied";
    } catch {
      return null;
    }
  };

  const saveChoice = (analytics) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({
        analytics,
        expiresAt: Date.now() + choiceDuration,
      }));
    } catch {
      // Consent still applies for the current page if storage is unavailable.
    }
  };

  const removeAnalyticsCookies = () => {
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      if (!name.startsWith("_ga")) return;

      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname}; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${window.location.hostname}; SameSite=Lax`;
    });
  };

  const loadAnalytics = () => {
    window.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
    });

    if (analyticsLoaded) return;
    analyticsLoaded = true;

    const analyticsScript = document.createElement("script");
    analyticsScript.async = true;
    analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.append(analyticsScript);

    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_ad_personalization_signals: false,
      allow_google_signals: false,
    });
  };

  const hideBanner = () => {
    banner.hidden = true;
    returnFocusTo?.focus();
    returnFocusTo = null;
  };

  const showBanner = (trigger = null) => {
    returnFocusTo = trigger;
    banner.hidden = false;
    rejectButton.focus();
  };

  const applyChoice = (choice) => {
    saveChoice(choice);

    if (choice === "granted") {
      loadAnalytics();
    } else {
      window.gtag("consent", "update", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
      });
      removeAnalyticsCookies();
    }

    hideBanner();
  };

  acceptButton.addEventListener("click", () => applyChoice("granted"));
  rejectButton.addEventListener("click", () => applyChoice("denied"));

  settingsButtons.forEach((button) => {
    button.addEventListener("click", () => showBanner(button));
  });

  const savedChoice = readChoice();
  if (savedChoice === "granted") {
    loadAnalytics();
  } else if (!savedChoice) {
    showBanner();
  }
})();
