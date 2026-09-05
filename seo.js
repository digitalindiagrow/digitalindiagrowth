(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = document.querySelectorAll(".seo-reveal");
  const motionItems = document.querySelectorAll(".seo-benefits article, .seo-process-grid article, .seo-service");
  motionItems.forEach((item, index) => {
    item.classList.add("seo-motion-item");
    item.style.setProperty("--seo-motion-delay", `${Math.min(index % 7, 5) * 55}ms`);
  });
  const animatedItems = [...new Set([...revealItems, ...motionItems])];
  if (reducedMotion || !("IntersectionObserver" in window)) {
    animatedItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px" });
    animatedItems.forEach((item) => observer.observe(item));
  }

  const processFlow = document.querySelector("[data-seo-flow]");
  if (processFlow && !reducedMotion && "IntersectionObserver" in window) {
    const flowObserver = new IntersectionObserver(([entry]) => {
      processFlow.classList.toggle("is-flow-active", entry.isIntersecting);
    }, { threshold: 0.2 });
    flowObserver.observe(processFlow);
  }

  const modal = document.getElementById("seoModal");
  const form = document.getElementById("seoForm");
  const requirement = form?.elements.requirement;
  const status = form?.querySelector(".seo-form-status");
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
    if (service && requirement) requirement.value = service;
    setStatus("");
    modal.hidden = false;
    document.body.classList.add("seo-modal-open");
    requestAnimationFrame(() => modal.querySelector("input")?.focus());
  };

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("seo-modal-open");
    previousFocus?.focus?.();
  };

  document.querySelectorAll("[data-open-seo-form]").forEach((trigger) => {
    trigger.addEventListener("click", () => openModal(trigger.dataset.seoService || ""));
  });
  document.querySelectorAll("[data-close-seo-form]").forEach((trigger) => trigger.addEventListener("click", closeModal));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) closeModal();
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    data.append("source", "SEO Services Page");
    data.append("page_url", location.href);
    data.append("timestamp", new Date().toISOString());

    const message = [
      "New SEO Consultation Request",
      `Name: ${data.get("name")}`,
      `Phone: ${data.get("phone")}`,
      `Email: ${data.get("email") || "Not provided"}`,
      `Website: ${data.get("website") || "Not provided"}`,
      `Service: ${data.get("requirement")}`
    ].join("\n");
    const whatsappUrl = `https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(message)}`;
    const whatsappWindow = typeof openWhatsapp === "function" ? openWhatsapp(whatsappUrl) : window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    submitButton.disabled = true;
    const originalLabel = submitButton.innerHTML;
    submitButton.textContent = "Sending...";
    setStatus("Sending your SEO audit request…");

    try {
      if (typeof saveLead !== "function") throw new Error("Lead service is unavailable.");
      const saved = await saveLead(form.dataset.sheetEndpoint.trim(), data);
      if (!saved.ok) throw new Error(saved.message || "Lead could not be saved.");
      setStatus(whatsappWindow ? "Request saved. WhatsApp confirmation is opening…" : "Request saved. Our SEO team will contact you shortly.");
      form.reset();
    } catch (error) {
      console.error("SEO form error:", error);
      setStatus("Request could not be sent. Please call +91 9871031423.", true);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalLabel;
    }
  });
})();

/* Before/After ranking bars: grow when scrolled into view */
(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-seop-bars]").forEach((el) => {
    if (reduced || !("IntersectionObserver" in window)) { el.classList.add("is-bars"); return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-bars");
        obs.unobserve(el);
      });
    }, { threshold: 0.35 });
    io.observe(el);
  });
})();
