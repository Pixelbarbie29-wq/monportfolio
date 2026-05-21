const progress = document.getElementById("routeProgress");
const marker = document.getElementById("routeMarker");
const journeyLink = document.getElementById("journeyLink");
const openDest = document.getElementById("openDest");
const zones = document.querySelectorAll(".zone");
const goBtn = document.getElementById("goBtn");
const topDate = document.getElementById("topDate");

if (topDate) {
    const now = new Date();
    topDate.textContent = now.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

const destinations = {
    portfolio: {
        percent: 8,
        truckLeft: "8%",
        label: "Accueil du portfolio",
        href: "../portfolio.html#projets",
    },
    v1: {
        percent: 36,
        truckLeft: "36%",
        label: "Ancienne base (v1)",
        href: "../projet1truckcopie.html",
    },
    v2: {
        percent: 64,
        truckLeft: "64%",
        label: "Secteur neuf (v2)",
        href: "../linktruck-v2/index.html",
    },
    contact: {
        percent: 92,
        truckLeft: "92%",
        label: "Contact",
        href: "../contact.html",
    },
};

let currentKey = "portfolio";
let isMoving = false;

function setActiveZone(key) {
    zones.forEach((z) => {
        z.classList.toggle("is-active", z.dataset.dest === key);
    });
}

function updateUI(key) {
    const d = destinations[key];
    if (!d) return;
    journeyLink.innerHTML = `Prochaine destination : <a href="${d.href}">${d.label}</a>`;
    openDest.href = d.href;
}

function goTo(key) {
    if (isMoving || !destinations[key]) return;
    isMoving = true;
    currentKey = key;
    setActiveZone(key);

    const { percent, truckLeft } = destinations[key];
    progress.style.width = `${percent}%`;
    marker.style.left = truckLeft;
    marker.classList.add("is-moving");

    updateUI(key);

    window.setTimeout(() => {
        marker.classList.remove("is-moving");
        isMoving = false;
    }, 1350);
}

zones.forEach((zone) => {
    zone.addEventListener("click", () => goTo(zone.dataset.dest));
});

goBtn.addEventListener("click", () => {
    const keys = Object.keys(destinations);
    const idx = keys.indexOf(currentKey);
    goTo(keys[(idx + 1) % keys.length]);
});

goTo("portfolio");
