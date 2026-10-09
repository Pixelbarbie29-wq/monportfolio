// LinkTruck — inscription, connexion et espace chauffeur / entreprise
// Tout texte venant du serveur est inséré avec textContent (jamais innerHTML).
(function () {
  const $ = (id) => document.getElementById(id);
  const page = document.body.dataset.page;

  /* ---------- Comportement commun à toutes les pages du site : en-tête et menu mobile ---------- */
  const navToggle = $("navToggle");
  const mobileNav = $("mobileNav");
  navToggle.addEventListener("click", () => {
    const ouvert = navToggle.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(ouvert));
    navToggle.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
    mobileNav.hidden = !ouvert;
    document.body.style.overflow = ouvert ? "hidden" : "";
  });

  async function api(method, url, body) {
    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "X-Requested-With": "fetch" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const j = await r.json().catch(() => ({}));
    return { status: r.status, ok: r.ok, j };
  }
  function el(tag, props = {}, ...enfants) {
    const n = document.createElement(tag);
    Object.assign(n, props);
    enfants.forEach((c) => n.append(c));
    return n;
  }
  function montrerErreur(msg) {
    const e = $("formError");
    e.textContent = msg;
    e.hidden = false;
  }

  /* ---------- Page d'inscription ---------- */
  if (page === "inscription") {
    const TEXTES = {
      chauffeur: {
        label: "06 — Chauffeur routier",
        titre: ["Votre route,", "votre ", "choix"],
        texte: "Vous choisissez vos missions, votre région et votre permis. Le salaire net de chaque mission est affiché avant que vous vous engagiez. Créez votre profil en trois petites étapes.",
        etapes: [["Vous vous présentez", "Trois petites étapes, deux minutes."], ["Vous envoyez vos documents", "En PDF ou en photo, depuis votre espace."], ["Vous choisissez", "Parmi les missions en CDD qui vous correspondent."]],
        docsTitre: "À avoir sous la main",
        docsSous: "Prenez-les en photo ou scannez-les : vous les enverrez juste après l'inscription.",
      },
      entreprise: {
        label: "06 — Le lien permanent entre transporteurs et chauffeurs",
        titre: ["Des chauffeurs", "", "prêts à rouler"],
        texte: "Réinventez le recrutement dans le transport routier : LinkTruck vous met en relation avec des chauffeurs disponibles, qualifiés et prêts à prendre la route. Chaque dossier est vérifié avant d'être validé.",
        etapes: [["Votre société", "Raison sociale et SIRET."], ["Vos justificatifs", "Kbis et RIB, vérifiés par l'équipe LinkTruck."], ["Vos missions en CDD", "Publiées après validation du dossier."]],
        docsTitre: "Pièces justificatives",
        docsSous: "Elles seront à envoyer depuis votre espace, juste après l'inscription.",
      },
    };
    const TITRES_ETAPES = ["Parlons de vous", "Votre permis", "Votre compte"];
    let profil = new URLSearchParams(location.search).get("profil") === "entreprise" ? "entreprise" : "chauffeur";
    let etape = 1;
    const formes = { chauffeur: $("formChauffeur"), entreprise: $("formEntreprise") };

    function ligneDoc(d, n) {
      return el("li", {}, el("span", { className: "doc-num", textContent: typeof n === "number" ? String(n).padStart(2, "0") : n }),
        el("div", {}, el("strong", { textContent: d.label }), el("span", { className: "d", textContent: d.aide })));
    }
    async function chargerDocuments(p) {
      try {
        const r = await api("GET", "/api/documents-requis?role=" + p);
        if (!r.ok || p !== profil) return;
        $("docsRequis").replaceChildren(...r.j.requis.map((d, i) => ligneDoc(d, i + 1)));
        $("docsCertBloc").hidden = !r.j.certifications.length;
        $("docsCert").replaceChildren(...r.j.certifications.map((d) => ligneDoc(d, "+")));
        $("docsFac").replaceChildren(...r.j.facultatifs.map((d) => el("li", { textContent: "· " + d.label })));
        $("docsFacBloc").hidden = !r.j.facultatifs.length;
      } catch { /* la liste est un confort : l'inscription reste possible sans elle */ }
    }

    function appliquerProfil(p) {
      profil = p;
      const t = TEXTES[p];
      $("hero").dataset.profil = p;
      document.querySelectorAll("[data-profil]").forEach((b) => b.tagName === "BUTTON" && b.setAttribute("aria-pressed", String(b.dataset.profil === p)));
      formes.chauffeur.hidden = p !== "chauffeur";
      formes.entreprise.hidden = p !== "entreprise";
      $("heroLabel").textContent = t.label;
      $("heroTitre").replaceChildren(t.titre[0], document.createElement("br"), t.titre[1], el("em", { textContent: t.titre[2] }));
      $("heroTexte").textContent = t.texte;
      $("heroLien").hidden = p !== "chauffeur"; // voir les offres sans compte : liberté de regarder avant de s'engager
      $("heroEtapes").replaceChildren(...t.etapes.map(([titre, detail], i) =>
        el("li", {}, el("span", { className: "feature-num", textContent: String(i + 1).padStart(2, "0") }), el("div", {}, el("strong", { textContent: titre }), el("span", { className: "d", textContent: detail })))));
      $("docsTitre").textContent = t.docsTitre;
      $("docsSous").textContent = t.docsSous;
      history.replaceState(null, "", "?profil=" + p);
      chargerDocuments(p);
    }
    document.querySelectorAll("button[data-profil]").forEach((b) => b.addEventListener("click", () => appliquerProfil(b.dataset.profil)));

    /* --- Chauffeur : parcours en trois étapes --- */
    const fc = formes.chauffeur;
    function afficherEtape(n) {
      etape = n;
      fc.querySelectorAll("[data-etape]").forEach((f) => (f.hidden = Number(f.dataset.etape) !== n));
      fc.querySelectorAll("#points li").forEach((li, i) => {
        li.classList.toggle("actif", i + 1 === n);
        li.classList.toggle("fait", i + 1 < n);
        li.toggleAttribute("aria-current", i + 1 === n);
      });
      $("etapeTitre").textContent = TITRES_ETAPES[n - 1];
      $("retour").hidden = n === 1;
      $("suivant").hidden = n === 3;
      $("submitChauffeur").hidden = n !== 3;
      $("erreurChauffeur").hidden = true;
      const premier = fc.querySelector(`[data-etape="${n}"] input:not([type="radio"]):not([type="checkbox"]), [data-etape="${n}"] textarea`);
      if (premier && n !== 1) premier.focus();
    }
    function etapeValide(n) {
      for (const c of fc.querySelectorAll(`[data-etape="${n}"] input, [data-etape="${n}"] select, [data-etape="${n}"] textarea`)) {
        if (!c.checkValidity()) { c.reportValidity(); return false; }
      }
      return true;
    }
    $("suivant").addEventListener("click", () => { if (etapeValide(etape)) afficherEtape(etape + 1); });
    $("retour").addEventListener("click", () => afficherEtape(etape - 1));

    /* --- Envoi (les deux profils) --- */
    async function envoyer(p, form, erreurId, btnId) {
      const erreur = $(erreurId);
      const echec = (m) => { erreur.textContent = m; erreur.hidden = false; };
      erreur.hidden = true;
      const f = new FormData(form);
      if (f.get("password") !== f.get("password2")) return echec("Les deux mots de passe ne sont pas identiques.");
      if (!form.querySelector('input[name="accepte"]').checked) return echec("Vous devez accepter le traitement de vos documents pour continuer.");
      const donnees = { role: p, accepte: true, site_web: f.get("site_web") };
      ["nom", "email", "telephone", "ville", "region", "password"].forEach((k) => (donnees[k] = f.get(k)));
      if (p === "chauffeur") { donnees.permis = f.get("permis"); donnees.presentation = f.get("presentation"); }
      else donnees.siret = f.get("siret");
      const btn = $(btnId);
      btn.disabled = true;
      try {
        const r = await api("POST", "/api/inscription", donnees);
        if (r.ok) { location.href = r.j.connecte ? "espace.html" : "connexion.html"; return; }
        echec(r.j.message || "Inscription impossible.");
      } catch { echec("Serveur injoignable. Réessayez dans un instant."); }
      btn.disabled = false;
    }
    fc.addEventListener("submit", (e) => {
      e.preventDefault();
      if (etape < 3) { if (etapeValide(etape)) afficherEtape(etape + 1); return; } // Entrée = étape suivante
      if (etapeValide(3)) envoyer("chauffeur", fc, "erreurChauffeur", "submitChauffeur");
    });
    formes.entreprise.addEventListener("submit", (e) => {
      e.preventDefault();
      for (const c of formes.entreprise.querySelectorAll("input, select, textarea")) if (!c.checkValidity()) return c.reportValidity();
      envoyer("entreprise", formes.entreprise, "erreurEntreprise", "submitEntreprise");
    });

    afficherEtape(1);
    appliquerProfil(profil);
  }

  /* ---------- Page de connexion ---------- */
  if (page === "connexion") {
    $("formConnexion").addEventListener("submit", async (e) => {
      e.preventDefault();
      $("formError").hidden = true;
      const btn = $("submitBtn");
      btn.disabled = true;
      try {
        const r = await api("POST", "/api/login", { email: $("email").value, password: $("password").value });
        if (r.ok) { location.href = "espace.html"; return; }
        montrerErreur(r.j.message || "Connexion impossible.");
      } catch { montrerErreur("Serveur injoignable. Réessayez dans un instant."); }
      btn.disabled = false;
    });
  }

  /* ---------- Espace : suivi du dossier et envoi des documents ---------- */
  if (page === "espace") {
    const ETATS = { valide: "Validé", en_attente: "En cours de vérification", refuse: "Refusé", manquant: "À envoyer" };
    const TYPES_OK = ["application/pdf", "image/jpeg", "image/png"];
    const TAILLE_MAX = 5 * 1024 * 1024;
    let toastTimer;
    const toast = (msg) => {
      const t = $("toast");
      t.textContent = msg; t.hidden = false;
      clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 4000);
    };
    async function deconnexion(e) {
      e.preventDefault();
      await api("POST", "/api/logout").catch(() => {});
      location.href = "connexion.html";
    }
    $("logoutBtn").addEventListener("click", deconnexion);
    $("logoutMobile").addEventListener("click", deconnexion);

    const lireBase64 = (fichier) => new Promise((ok, ko) => {
      const r = new FileReader();
      r.onload = () => ok(String(r.result).split(",")[1] || "");
      r.onerror = () => ko(new Error("Lecture du fichier impossible."));
      r.readAsDataURL(fichier);
    });

    function carteDocument(d, peutEnvoyer) {
      const etat = d.statut || "manquant";
      const info = el("div", {}, el("h3", { textContent: d.label }), el("p", { textContent: d.aide }));
      if (d.fichier_nom) info.append(el("p", { className: "fichier", textContent: "Fichier envoyé : " + d.fichier_nom }));
      if (d.statut === "refuse" && d.motif_refus) info.append(el("p", { className: "motif", textContent: "Motif du refus : " + d.motif_refus }));
      const carte = el("div", { className: "doc-card" }, info, d.sansEtat ? el("span") : el("span", { className: "etat " + etat, textContent: ETATS[etat] }));

      if (peutEnvoyer && d.modifiable) {
        const input = el("input", { type: "file", className: "sr-only", accept: ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" });
        const choisi = el("span", { className: "choisi" });
        const envoyer = el("button", { type: "button", className: "btn btn-primary", textContent: "Envoyer", disabled: true });
        const erreur = el("p", { className: "doc-erreur", role: "alert", hidden: true });
        input.addEventListener("change", () => {
          erreur.hidden = true;
          const f = input.files[0];
          choisi.textContent = f ? f.name : "";
          envoyer.disabled = !f;
        });
        envoyer.addEventListener("click", async () => {
          const f = input.files[0];
          if (!f) return;
          const echec = (m) => { erreur.textContent = m; erreur.hidden = false; };
          if (!TYPES_OK.includes(f.type)) return echec("Format non accepté : choisissez un PDF, un JPG ou un PNG.");
          if (f.size > TAILLE_MAX) return echec("Fichier trop lourd (5 Mo maximum).");
          envoyer.disabled = true; envoyer.textContent = "Envoi…";
          try {
            const r = await api("POST", "/api/espace/documents", { type: d.type, nom_fichier: f.name, fichier: await lireBase64(f) });
            if (r.status === 401) { location.href = "connexion.html"; return; }
            if (!r.ok) { echec(r.j.message || "Envoi impossible."); envoyer.textContent = "Envoyer"; envoyer.disabled = false; return; }
            toast("Document envoyé : " + d.label);
            charger();
          } catch (e) { echec(e.message || "Serveur injoignable."); envoyer.textContent = "Envoyer"; envoyer.disabled = false; }
        });
        carte.append(el("div", { className: "doc-upload" },
          el("label", { className: "btn btn-outline" }, d.envoye ? "Remplacer" : "Choisir un fichier", input), choisi, envoyer), erreur);
      }
      return carte;
    }

    function banniere(profil, manquants, total) {
      const b = $("banniere");
      const titre = el("strong", {});
      const texte = el("p", {});
      b.className = "banner";
      if (profil.statut === "valide") {
        b.classList.add("ok");
        titre.textContent = "Compte validé";
        texte.textContent = profil.role === "chauffeur"
          ? "Votre dossier est complet et validé. L'accès aux missions arrive bientôt sur cette page."
          : "Votre dossier est complet et validé. Pour l'instant, l'équipe LinkTruck crée vos missions avec vous.";
      } else if (profil.statut === "suspendu" || profil.statut === "refuse") {
        b.classList.add("ko");
        titre.textContent = profil.statut === "suspendu" ? "Compte suspendu" : "Compte refusé";
        texte.textContent = (profil.motif_statut ? "Motif : " + profil.motif_statut + ". " : "") + "Contactez l'équipe LinkTruck pour en savoir plus.";
      } else if (manquants > 0) {
        titre.textContent = "Dossier à compléter";
        texte.textContent = "Il vous reste " + manquants + " document" + (manquants > 1 ? "s" : "") + " obligatoire" + (manquants > 1 ? "s" : "") + " à envoyer sur " + total + ".";
      } else {
        titre.textContent = "Dossier complet";
        texte.textContent = "Merci ! L'équipe LinkTruck vérifie vos documents. Revenez sur cette page pour suivre l'avancement : votre compte sera validé dès que tout est conforme.";
      }
      b.replaceChildren(titre, texte);
      b.hidden = false;
    }

    async function charger() {
      let r;
      try { r = await api("GET", "/api/espace/me"); } catch { $("espaceSous").textContent = "Serveur injoignable."; return; }
      if (r.status === 401) { location.href = "connexion.html"; return; }
      const { profil, documents } = r.j;
      const peutEnvoyer = ["en_attente", "valide"].includes(profil.statut);
      $("espaceRole").textContent = profil.role === "chauffeur" ? "06 — Espace chauffeur" : "06 — Espace entreprise";
      $("espaceTitre").replaceChildren("Bonjour, ", el("em", { textContent: profil.nom }));
      $("espaceSous").textContent = profil.email;
      const envoyes = documents.requis.filter((d) => d.envoye).length;
      const total = documents.requis.length;
      banniere(profil, total - envoyes, total);
      const p = $("progression");
      p.replaceChildren(
        el("p", { textContent: envoyes + " / " + total + " documents obligatoires envoyés · " + documents.requis.filter((d) => d.statut === "valide").length + " validés" }),
        el("div", { className: "progress-bar" }, el("div", { style: "width:" + Math.round((envoyes / total) * 100) + "%" })));
      p.hidden = false;
      $("docsRequis").replaceChildren(...documents.requis.map((d) => carteDocument(d, peutEnvoyer)));
      const certifs = documents.certifications || [];
      $("certBloc").hidden = !certifs.length;
      $("docsCert").replaceChildren(...certifs.map((d) => carteDocument(d, peutEnvoyer)));
      // Pièces jointes libres : celles déjà envoyées, puis une carte pour en ajouter (jusqu'à la limite)
      const autres = documents.autres || [];
      const cartes = autres.map((a) => carteDocument({ label: a.fichier_nom || "Document complémentaire", aide: "Document complémentaire", statut: a.statut, motif_refus: a.motif_refus, envoye: true, modifiable: false }, false));
      if (peutEnvoyer && autres.length < documents.autres_max) {
        cartes.push(carteDocument({ type: "autre", label: "Ajouter un document", aide: "PDF, JPG ou PNG — encore " + (documents.autres_max - autres.length) + " possible" + (documents.autres_max - autres.length > 1 ? "s" : "") + ".", envoye: false, modifiable: true, sansEtat: true }, true));
      }
      $("autresBloc").hidden = !cartes.length;
      $("docsAutres").replaceChildren(...cartes);
      $("docsFac").replaceChildren(...documents.facultatifs.map((d) => carteDocument(d, peutEnvoyer)));
      $("facBloc").hidden = !documents.facultatifs.length;
    }
    charger();
  }
})();
