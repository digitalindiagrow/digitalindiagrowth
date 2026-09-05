(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionItems = document.querySelectorAll(".ads-reveal, .ads-benefits article, .ads-value-grid article, .ads-process-grid article");
  motionItems.forEach((item, index) => {
    item.classList.add("ads-motion");
    item.style.setProperty("--ads-delay", `${Math.min(index % 6, 5) * 55}ms`);
  });

  if (reducedMotion || !("IntersectionObserver" in window)) {
    motionItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -32px" });
    motionItems.forEach((item) => revealObserver.observe(item));
  }

  const processFlow = document.querySelector("[data-ads-flow]");
  if (processFlow && !reducedMotion && "IntersectionObserver" in window) {
    const flowObserver = new IntersectionObserver(([entry]) => {
      processFlow.classList.toggle("is-flow-active", entry.isIntersecting);
    }, { threshold: 0.2 });
    flowObserver.observe(processFlow);
  }

  const modal = document.getElementById("adsModal");
  const form = document.getElementById("adsForm");
  const status = form?.querySelector(".ads-form-status");
  const submitButton = form?.querySelector('[type="submit"]');
  let previousFocus = null;

  const setStatus = (message, isError = false) => {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("show", Boolean(message));
    status.classList.toggle("error", isError);
  };
  const openModal = () => {
    if (!modal) return;
    previousFocus = document.activeElement;
    setStatus("");
    modal.hidden = false;
    document.body.classList.add("ads-modal-open");
    requestAnimationFrame(() => modal.querySelector("input")?.focus());
  };
  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("ads-modal-open");
    previousFocus?.focus?.();
  };
  document.querySelectorAll("[data-open-ads-form]").forEach((button) => button.addEventListener("click", openModal));
  document.querySelectorAll("[data-close-ads-form]").forEach((button) => button.addEventListener("click", closeModal));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) closeModal();
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    data.append("source", "Paid Advertising Page");
    data.append("page_url", location.href);
    data.append("timestamp", new Date().toISOString());
    const message = ["New Paid Ads Consultation", `Name: ${data.get("name")}`, `Phone: ${data.get("phone")}`, `Email: ${data.get("email") || "Not provided"}`, `Website: ${data.get("website") || "Not provided"}`, `Service: ${data.get("requirement")}`].join("\n");
    const whatsappUrl = `https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(message)}`;
    const whatsappWindow = typeof openWhatsapp === "function" ? openWhatsapp(whatsappUrl) : window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    submitButton.disabled = true;
    const originalLabel = submitButton.innerHTML;
    submitButton.textContent = "Sending...";
    setStatus("Sending your consultation request…");
    try {
      if (typeof saveLead !== "function") throw new Error("Lead service is unavailable.");
      const saved = await saveLead(form.dataset.sheetEndpoint.trim(), data);
      if (!saved.ok) throw new Error(saved.message || "Lead could not be saved.");
      setStatus(whatsappWindow ? "Request saved. WhatsApp confirmation is opening…" : "Request saved. Our ads team will contact you shortly.");
      form.reset();
    } catch (error) {
      console.error("Ads form error:", error);
      setStatus("Request could not be sent. Please call +91 9871031423.", true);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalLabel;
    }
  });
})();
