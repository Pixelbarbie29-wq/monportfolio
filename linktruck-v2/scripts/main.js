const header = document.getElementById("header");
const navToggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobileNav");
const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");

/* Sticky header */
window.addEventListener(
  "scroll",
  () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  },
  { passive: true }
);

/* Mobile nav */
navToggle.addEventListener("click", () => {
  const open = navToggle.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  mobileNav.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
});

mobileNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navToggle.classList.remove("open");
    mobileNav.hidden = true;
    document.body.style.overflow = "";
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* Scroll reveal */
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
revealEls.forEach((el) => revealObserver.observe(el));

/* Animated counters */
function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  const suffix = el.nextElementSibling?.classList.contains("stat-suffix");

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = value.toLocaleString("fr-FR");
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString("fr-FR");
  }
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      animateCounter(el, target);
      statObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll(".stat-num").forEach((el) => statObserver.observe(el));

/* Contact form → API Node.js */
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(contactForm));

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur");

    contactForm.hidden = true;
    formNote.textContent = data.message;
    formNote.hidden = false;
  } catch {
    contactForm.hidden = true;
    formNote.textContent =
      "Merci pour votre intérêt ! En mode démo (fichiers statiques), le message n'est pas envoyé au serveur. Lancez le projet avec Node.js pour activer l'API contact.";
    formNote.hidden = false;
  }
});
