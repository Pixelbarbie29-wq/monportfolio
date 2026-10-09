// LinkTruck — démo du portfolio : faux serveur dans le navigateur.
// Les pages appellent /api/... comme dans le vrai projet ; ici, ces appels sont interceptés
// et traités avec le localStorage du visiteur. Rien n'est envoyé sur Internet,
// et le contenu des fichiers choisis n'est jamais gardé (seulement leur nom).
(function () {
  "use strict";

  /* ---------- Stockage (localStorage, avec repli en mémoire s'il est bloqué) ---------- */
  const CLE = "linktruck-demo-v1";
  let memoire = null;
  function lire() {
    try { const t = localStorage.getItem(CLE); if (t) return JSON.parse(t); } catch (e) { /* bloqué */ }
    return memoire || { comptes: [], session: null };
  }
  function ecrire(etat) {
    memoire = etat;
    try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) { /* bloqué : on reste en mémoire */ }
  }
  function effacer() {
    memoire = null;
    try { localStorage.removeItem(CLE); } catch (e) { /* rien à faire */ }
  }

  // Le mot de passe n'est jamais gardé en clair, même dans cette démo
  async function empreinte(texte) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("linktruck-demo:" + texte));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    let h = 5381;
    for (const c of "linktruck-demo:" + texte) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
    return "d" + h;
  }

  /* ---------- Règles du vrai projet (documents demandés) ---------- */
  const INFO = {
    cv: ["CV", "Votre CV à jour (PDF de préférence)."],
    identite: ["Pièce d'identité", "Carte d'identité ou passeport en cours de validité (recto et verso)."],
    rib: ["RIB / IBAN", "Relevé d'identité bancaire, IBAN bien lisible."],
    secu: ["Sécurité sociale", "Attestation de droits ou carte Vitale, numéro lisible."],
    permis: ["Permis de conduire", "Permis C ou CE en cours de validité (recto et verso)."],
    fimo: ["FIMO", "Attestation ou carte de qualification FIMO marchandises."],
    kbis: ["Extrait Kbis", "Extrait Kbis de moins de 3 mois."],
    diplome: ["Diplôme", "Titre professionnel ou diplôme (facultatif)."],
    fco: ["FCO", "Attestation de formation continue obligatoire (FCO), le recyclage à renouveler tous les 5 ans."],
    carte_conducteur: ["Carte conducteur", "Carte de conducteur chronotachygraphe (facultatif)."],
    domicile: ["Justificatif de domicile", "Facture ou quittance de moins de 3 mois (facultatif)."],
    casier: ["Extrait de casier judiciaire", "Bulletin n° 3 (facultatif)."],
    certificat_travail: ["Certificat de travail", "Attestation d'un ancien employeur (facultatif)."],
    lettre_motivation: ["Lettre de motivation", "Quelques lignes pour vous présenter (facultatif)."],
    honorabilite: ["Attestation d'honorabilité", "Si vous en disposez (facultatif)."],
    assurance: ["Assurance", "Attestation d'assurance de l'entreprise (facultatif)."],
    adr_base: ["ADR de base", "Certificat de formation ADR (formation de base) en cours de validité."],
    adr_citerne: ["ADR citerne", "Certificat ADR avec la spécialisation citerne, en cours de validité."],
    caces_grue: ["CACES grue", "Certificat CACES pour la grue, en cours de validité."],
    autre: ["Autre document", "Tout document utile à votre dossier."],
  };
  const REQUIS = { chauffeur: ["cv", "identite", "rib", "secu", "permis", "fimo", "fco"], entreprise: ["kbis", "rib"] };
  const CERTIFS = { chauffeur: ["adr_base", "adr_citerne", "caces_grue"], entreprise: [] };
  const FACULTATIFS = {
    chauffeur: ["diplome", "carte_conducteur", "domicile", "casier", "certificat_travail", "lettre_motivation", "honorabilite"],
    entreprise: ["assurance"],
  };
  const MAX_AUTRES = 5;
  const info = (type) => ({ type, label: INFO[type][0], aide: INFO[type][1] });
  const typesAutorises = (role) => [...REQUIS[role], ...CERTIFS[role], ...FACULTATIFS[role], "autre"];

  function etatDocuments(role, documents) {
    const dernier = (type) => documents.filter((d) => d.type === type).sort((a, b) => b.created_at - a.created_at)[0];
    const ligne = (type) => {
      const d = dernier(type);
      return {
        ...info(type),
        envoye: !!d,
        statut: d ? d.statut : null,
        motif_refus: d && d.statut === "refuse" ? d.motif_refus : null,
        fichier_nom: d ? d.fichier_nom || null : null,
        modifiable: !d || d.statut !== "valide",
      };
    };
    const autres = documents.filter((d) => d.type === "autre").sort((a, b) => a.created_at - b.created_at)
      .map((d) => ({ statut: d.statut, fichier_nom: d.fichier_nom || null, motif_refus: d.statut === "refuse" ? d.motif_refus : null }));
    return {
      requis: REQUIS[role].map(ligne), certifications: CERTIFS[role].map(ligne), facultatifs: FACULTATIFS[role].map(ligne),
      autres, autres_max: MAX_AUTRES, autres_info: info("autre"),
    };
  }

  /* ---------- Validation de l'inscription (mêmes messages que le vrai serveur) ---------- */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const TEL = /^\+?[0-9 .\-()]{8,20}$/;
  const s = (v) => (typeof v === "string" ? v.trim() : "");
  function validerInscription(b) {
    const role = b.role;
    if (!["chauffeur", "entreprise"].includes(role)) return { erreur: "Choisissez un profil : chauffeur ou entreprise." };
    const nom = s(b.nom);
    if (nom.length < 2 || nom.length > 120) return { erreur: role === "entreprise" ? "Raison sociale requise." : "Prénom et nom requis." };
    const email = s(b.email).toLowerCase();
    if (email.length > 254 || !EMAIL.test(email)) return { erreur: "Adresse email invalide." };
    const telephone = s(b.telephone);
    if (!TEL.test(telephone)) return { erreur: "Numéro de téléphone invalide." };
    const ville = s(b.ville), region = s(b.region);
    if (!ville || ville.length > 80 || !region || region.length > 80) return { erreur: "Ville et région requises." };
    if (typeof b.password !== "string" || b.password.length < 10 || b.password.length > 72) return { erreur: "Mot de passe : 10 à 72 caractères." };
    if (b.accepte !== true) return { erreur: "Vous devez accepter le traitement de vos documents pour vérifier votre dossier." };
    const details = { ville, region };
    if (role === "chauffeur") {
      if (!["C", "CE"].includes(b.permis)) return { erreur: "Permis : C ou CE." };
      details.permis = b.permis;
      const presentation = s(b.presentation);
      if (presentation.length > 500) return { erreur: "Présentation : 500 caractères maximum." };
      details.presentation = presentation || null;
    } else {
      const siret = s(b.siret).replace(/\s/g, "");
      if (!/^\d{14}$/.test(siret)) return { erreur: "SIRET : 14 chiffres." };
      details.siret = siret;
    }
    return { compte: { role, nom, email, telephone, details } };
  }

  const nettoyerNom = (n) => s(n).split(/[\\/]/).pop().replace(/[^\w .()\-àâäéèêëîïôöùûüç]/gi, "_").slice(0, 80) || null;

  /* ---------- Les routes /api/... ---------- */
  const reponse = (status, j) => ({ status, j });
  const refus401 = () => reponse(401, { ok: false, message: "Session expirée : reconnectez-vous." });

  async function traiter(methode, chemin, params, corps) {
    const etat = lire();
    const courant = () => etat.comptes.find((c) => c.email === etat.session);

    if (chemin === "/api/documents-requis" && methode === "GET") {
      const role = params.get("role");
      if (!REQUIS[role]) return reponse(400, { ok: false, message: "Profil : chauffeur ou entreprise." });
      return reponse(200, {
        ok: true, requis: REQUIS[role].map(info), certifications: CERTIFS[role].map(info),
        facultatifs: FACULTATIFS[role].map(info), autres: { max: MAX_AUTRES, ...info("autre") },
      });
    }

    if (chemin === "/api/inscription" && methode === "POST") {
      if (corps.site_web) return reponse(201, { ok: true, connecte: false }); // champ piège pour les robots
      const { compte, erreur } = validerInscription(corps);
      if (erreur) return reponse(400, { ok: false, message: erreur });
      if (etat.comptes.some((c) => c.email === compte.email)) {
        return reponse(409, { ok: false, message: "Cette adresse email a déjà un compte. Connectez-vous." });
      }
      compte.mdp = await empreinte(corps.password);
      compte.statut = "en_attente";
      compte.documents = [];
      etat.comptes.push(compte);
      etat.session = compte.email;
      ecrire(etat);
      return reponse(201, { ok: true, connecte: true });
    }

    if (chemin === "/api/login" && methode === "POST") {
      const refus = () => reponse(401, { ok: false, message: "Identifiants incorrects." });
      if (typeof corps.email !== "string" || typeof corps.password !== "string" || !corps.email || !corps.password) return refus();
      const c = etat.comptes.find((x) => x.email === corps.email.trim().toLowerCase());
      if (!c || c.mdp !== (await empreinte(corps.password))) return refus();
      etat.session = c.email;
      ecrire(etat);
      return reponse(200, { ok: true, nom: c.nom });
    }

    if (chemin === "/api/logout" && methode === "POST") {
      etat.session = null;
      ecrire(etat);
      return reponse(200, { ok: true });
    }

    if (chemin === "/api/espace/me" && methode === "GET") {
      const c = courant();
      if (!c) return refus401();
      return reponse(200, {
        ok: true,
        profil: { nom: c.nom, email: c.email, role: c.role, statut: c.statut, motif_statut: null },
        documents: etatDocuments(c.role, c.documents),
      });
    }

    if (chemin === "/api/espace/documents" && methode === "POST") {
      const c = courant();
      if (!c) return refus401();
      if (!["en_attente", "valide"].includes(c.statut)) return reponse(403, { ok: false, message: "Votre compte ne permet plus l'envoi de documents. Contactez l'équipe LinkTruck." });
      const { type, nom_fichier } = corps;
      if (!typesAutorises(c.role).includes(type)) return reponse(400, { ok: false, message: "Type de document non attendu pour votre profil." });
      const ajout = type === "autre";
      if (ajout && c.documents.filter((d) => d.type === "autre").length >= MAX_AUTRES) {
        return reponse(409, { ok: false, message: "Vous avez déjà ajouté " + MAX_AUTRES + " documents complémentaires. Contactez l'équipe LinkTruck pour en ajouter d'autres." });
      }
      const existant = ajout ? null : c.documents.find((d) => d.type === type);
      if (existant && existant.statut === "valide") return reponse(409, { ok: false, message: "Ce document est déjà validé. Pour le changer, contactez l'équipe LinkTruck." });
      if (!ajout) c.documents = c.documents.filter((d) => d.type !== type);
      // Seul le nom du fichier est gardé : son contenu n'est ni lu ni stocké
      c.documents.push({ type, statut: "en_attente", fichier_nom: nettoyerNom(nom_fichier), motif_refus: null, created_at: Date.now() });
      ecrire(etat);
      return reponse(201, { ok: true, document: { type, statut: "en_attente" } });
    }

    return reponse(404, { ok: false, message: "Route inconnue." });
  }

  /* ---------- Interception de fetch ---------- */
  const fetchReel = window.fetch.bind(window);
  window.fetch = async function (url, options) {
    const u = new URL(String(url), location.href);
    if (!u.pathname.startsWith("/api/")) return fetchReel(url, options);
    const o = options || {};
    let corps = {};
    try { corps = o.body ? JSON.parse(o.body) : {}; } catch (e) { corps = {}; }
    await new Promise((ok) => setTimeout(ok, 250)); // petit délai, comme un vrai serveur
    const r = await traiter((o.method || "GET").toUpperCase(), u.pathname, u.searchParams, corps);
    return new Response(JSON.stringify(r.j), { status: r.status, headers: { "Content-Type": "application/json" } });
  };

  /* ---------- Actions de démonstration (barre du haut) ---------- */
  // Dans le vrai projet, c'est l'équipe LinkTruck (administratrice) qui vérifie les documents.
  // La démo permet de voir le résultat côté utilisateur, sans montrer l'outil d'administration.
  function message(texte) { try { sessionStorage.setItem("linktruck-demo-msg", texte); } catch (e) { /* ignoré */ } }

  function simulerValidation() {
    const etat = lire();
    const c = etat.comptes.find((x) => x.email === etat.session);
    if (!c) return;
    const envoyes = c.documents.filter((d) => d.statut === "en_attente");
    if (!envoyes.length) { message("Envoyez d'abord au moins un document, puis simulez la validation."); return location.reload(); }
    envoyes.forEach((d) => { d.statut = "valide"; d.motif_refus = null; });
    const complet = REQUIS[c.role].every((t) => c.documents.some((d) => d.type === t && d.statut === "valide"));
    if (complet) { c.statut = "valide"; message("Dossier complet : l'équipe LinkTruck a validé votre compte."); }
    else message("Documents validés. Il manque encore des pièces obligatoires pour valider le compte.");
    ecrire(etat);
    location.reload();
  }

  function simulerRefus() {
    const etat = lire();
    const c = etat.comptes.find((x) => x.email === etat.session);
    if (!c) return;
    const cible = c.documents.find((d) => d.statut === "en_attente" && d.type !== "autre");
    if (!cible) { message("Envoyez d'abord un document, puis simulez un refus."); return location.reload(); }
    cible.statut = "refuse";
    cible.motif_refus = "Document illisible : merci d'envoyer une photo plus nette.";
    ecrire(etat);
    message("Un document a été refusé : remplacez-le pour continuer.");
    location.reload();
  }

  function recommencer() {
    effacer();
    location.href = "inscription.html";
  }

  function bouton(texte, action) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "demo-btn";
    b.textContent = texte;
    b.addEventListener("click", action);
    return b;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const zone = document.getElementById("demoActions");
    if (zone) {
      if (document.body.dataset.page === "espace") {
        zone.append(bouton("✓ Simuler la validation", simulerValidation), bouton("✗ Simuler un refus", simulerRefus));
      }
      zone.append(bouton("↺ Recommencer", recommencer));
    }
    let msg = null;
    try { msg = sessionStorage.getItem("linktruck-demo-msg"); sessionStorage.removeItem("linktruck-demo-msg"); } catch (e) { /* ignoré */ }
    const toast = document.getElementById("toast");
    if (msg && toast) {
      setTimeout(() => {
        toast.textContent = msg;
        toast.hidden = false;
        setTimeout(() => { toast.hidden = true; }, 6000);
      }, 400);
    }
  });
})();
