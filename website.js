(() => {
  "use strict";

  const menuButton = document.querySelector(".gd-menu");
  const navigation = document.querySelector(".gd-nav");

  const closeMenu = () => {
    if (!menuButton || !navigation) return;
    menuButton.classList.remove("is-open");
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  };

  menuButton?.addEventListener("click", () => {
    const willOpen = !navigation.classList.contains("is-open");
    menuButton.classList.toggle("is-open", willOpen);
    navigation.classList.toggle("is-open", willOpen);
    menuButton.setAttribute("aria-expanded", String(willOpen));
  });

  navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });

  document.querySelectorAll("#web-work-showcase .portfolio-card").forEach((card, index) => {
    const projectNumber = card.querySelector(".portfolio-meta b");
    if (projectNumber) projectNumber.textContent = String(index + 1).padStart(2, "0");
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = document.querySelectorAll(".gd-reveal");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const processFlow = document.querySelector("[data-design-flow]");
  if (processFlow) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      processFlow.classList.add("is-active");
    } else {
      const processObserver = new IntersectionObserver(([entry]) => {
        processFlow.classList.toggle("is-active", entry.isIntersecting);
      }, { threshold: 0.25 });
      processObserver.observe(processFlow);
    }
  }

  const estimatorType = document.getElementById("web-estimator-type");
  const estimatorPages = document.getElementById("web-estimator-pages");
  const estimatorFeatures = Array.from(document.querySelectorAll(".web-estimator-features input"));
  const estimatorResult = document.querySelector(".web-estimator-result");

  if (estimatorType && estimatorPages && estimatorResult) {
    const formatMoney = (value) => new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
    const updateEstimate = () => {
      const pages = Number(estimatorPages.value);
      const selectedFeatures = estimatorFeatures.filter((input) => input.checked);
      const base = Number(estimatorType.value);
      const selectedType = estimatorType.options[estimatorType.selectedIndex];
      const pageRate = Number(selectedType.dataset.pageRate || 1500);
      const includedPages = Number(selectedType.dataset.includedPages || 0);
      const bookingRate = Number(selectedType.dataset.bookingRate || 500);
      const chargeablePages = Math.max(0, pages - includedPages);
      const pageCost = chargeablePages * pageRate;
      const featureCost = selectedFeatures.reduce((total, input) => {
        return total + (input.dataset.feature === "Booking Setup" ? bookingRate : Number(input.value));
      }, 0);
      const packagePrice = base + pageCost + featureCost;
      const pageLabel = `${pages} ${pages === 1 ? "page" : "pages"}`;
      const typeLabel = estimatorType.options[estimatorType.selectedIndex].text;
      const featureLabels = selectedFeatures.map((input) => input.dataset.feature);

      document.getElementById("web-page-output").textContent = pageLabel;
      document.getElementById("web-estimate-price").textContent = formatMoney(packagePrice);
      document.getElementById("web-estimate-type").textContent = typeLabel;
      document.getElementById("web-estimate-pages").textContent = pageLabel;
      document.getElementById("web-estimate-features").textContent = featureLabels.length ? featureLabels.join(", ") : "Standard build";
      document.getElementById("web-booking-price").textContent = formatMoney(bookingRate);
      estimatorPages.style.setProperty("--web-progress", `${((pages - 1) / 11) * 100}%`);

      const message = [
        "Hello Digital India Grow, I used the Website Project Estimator.",
        `Website: ${typeLabel}`,
        `Pages: ${pageLabel}`,
        `Pages included: ${includedPages}`,
        `Page rate: ${formatMoney(pageRate)} per page`,
        `Features: ${featureLabels.length ? featureLabels.join(", ") : "Standard build"}`,
        `Package price: ${formatMoney(packagePrice)}`,
        "Please help me plan the next steps."
      ].join("\n");
      document.getElementById("web-estimate-whatsapp").href = `https://wa.me/919871031423?text=${encodeURIComponent(message)}`;

      estimatorResult.classList.remove("is-updating");
      void estimatorResult.offsetWidth;
      estimatorResult.classList.add("is-updating");
      window.setTimeout(() => estimatorResult.classList.remove("is-updating"), 180);
    };

    estimatorType.addEventListener("change", updateEstimate);
    estimatorPages.addEventListener("input", updateEstimate);
    estimatorFeatures.forEach((input) => input.addEventListener("change", updateEstimate));
    updateEstimate();
  }

  const modal = document.getElementById("designModal");
  const form = document.getElementById("designForm");
  const serviceSelect = form?.elements.requirement;
  const status = form?.querySelector(".gd-form-status");
  const submitButton = form?.querySelector('[type="submit"]');
  let previousFocus = null;

  const setStatus = (message, isError = false) => {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("show", Boolean(message));
    status.classList.toggle("error", isError);
  };

  const openModal = (service = "") => {
    if (!modal) return;
    previousFocus = document.activeElement;
    if (service && serviceSelect) serviceSelect.value = service;
    setStatus("");
    modal.hidden = false;
    document.body.classList.add("gd-modal-open");
    window.setTimeout(() => modal.querySelector("input")?.focus(), 30);
  };

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("gd-modal-open");
    previousFocus?.focus?.();
  };

  document.querySelectorAll("[data-open-design-form]").forEach((trigger) => {
    trigger.addEventListener("click", () => openModal(trigger.dataset.service || ""));
  });
  document.querySelectorAll("[data-close-design-form]").forEach((trigger) => {
    trigger.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) closeModal();
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const endpoint = form.dataset.sheetEndpoint;
    const whatsapp = form.dataset.whatsapp;
    const values = Object.fromEntries(new FormData(form).entries());
    const payload = new URLSearchParams({
      name: values.name || "",
      phone: values.phone || "",
      email: values.email || "",
      website: "",
      requirement: values.requirement || "Website Development Consultation",
      source: "Website Development Page",
      page_url: window.location.href,
      submitted_at: new Date().toISOString()
    });

    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    setStatus("Sending your consultation request…");

    try {
      if (!endpoint) throw new Error("Submission endpoint is missing.");
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: payload.toString()
      });

      setStatus("Request sent. Our website team will contact you shortly.");
      const message = [
        "Hello Digital India Grow, I submitted a website development consultation request.",
        `Name: ${values.name}`,
        `Phone: ${values.phone}`,
        `Service: ${values.requirement}`
      ].join("\n");

      if (whatsapp) {
        window.setTimeout(() => {
          window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
        }, 450);
      }
      form.reset();
    } catch (error) {
      console.error(error);
      setStatus("Request could not be sent. Please call +91 9871031423.", true);
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
    }
  });
})();
