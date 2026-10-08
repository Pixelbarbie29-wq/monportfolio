/* =====================================================================
   LinkTruck — page « Offres de missions »
   Toutes les offres sont des missions en CDD.
   1) Les données (tableau de missions fictives)
   2) La logique de filtrage et de tri (fonctions simples, sans DOM)
   3) L'affichage et les événements (tout ce qui touche à la page)
   ===================================================================== */

/* ---------------------------------------------------------------------
   1) DONNÉES DE DÉMONSTRATION
   Chaque mission est un objet (toutes les entreprises et tous les montants
   sont inventés). Plus tard, ce tableau pourra être remplacé par des données
   venant d'une base (par exemple Supabase) : le reste du code n'aura presque
   pas besoin de changer.

   salaireNet = salaire net TOTAL pour la mission, en euros (toute la durée du CDD).
   --------------------------------------------------------------------- */
const MISSIONS = [
  {
    id: 1,
    titre: "Chauffeur PL messagerie régionale",
    entreprise: "Transports Méridienne (fictif)",
    ville: "Nîmes",
    region: "Occitanie",
    permis: "C",
    contrat: "CDD",
    duree: "4 mois",
    salaireNet: 7000,
    date: "2026-10-05",
    description: "Tournées de livraison en messagerie sur le Gard et l'Hérault, retour au dépôt chaque soir.",
    details: ["Départ du dépôt à 6 h", "Chargement assisté par un quai équipé", "Mutuelle et tickets restaurant"],
  },
  {
    id: 2,
    titre: "Conducteur SPL longue distance",
    entreprise: "Fret Rhône Alpes (fictif)",
    ville: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    permis: "CE",
    contrat: "CDD",
    duree: "6 mois",
    salaireNet: 12000,
    date: "2026-10-03",
    description: "Transport de marchandises sur l'axe Lyon – Paris – Lille, 2 nuits par semaine hors domicile.",
    details: ["Tracteur récent (moins de 2 ans)", "Primes de nuit et de grand déplacement", "Retour au domicile le week-end"],
  },
  {
    id: 3,
    titre: "Chauffeur-livreur 7,5 tonnes",
    entreprise: "Logis'Trans Sud (fictif)",
    ville: "Montpellier",
    region: "Occitanie",
    permis: "C",
    contrat: "CDD",
    duree: "6 mois",
    salaireNet: 9800,
    date: "2026-10-06",
    description: "Livraisons en centre-ville et en périphérie avec un camion équipé d'un hayon élévateur.",
    details: ["Durée : 6 mois, renouvelable", "Livraison de matériaux et d'équipements", "Prise de poste à 7 h"],
  },
  {
    id: 4,
    titre: "Conducteur benne travaux publics",
    entreprise: "Terrassements Cévennes (fictif)",
    ville: "Alès",
    region: "Occitanie",
    permis: "C",
    contrat: "CDD",
    duree: "3 semaines",
    salaireNet: 1100,
    date: "2026-10-01",
    description: "CDD court sur un chantier d'aménagement, transport de granulats entre carrière et chantier.",
    details: ["Chantier à moins de 30 km", "Équipements de sécurité fournis", "Possibilité de prolongation"],
  },
  {
    id: 5,
    titre: "Conducteur frigorifique",
    entreprise: "Froid Express Languedoc (fictif)",
    ville: "Perpignan",
    region: "Occitanie",
    permis: "CE",
    contrat: "CDD",
    duree: "5 mois",
    salaireNet: 9500,
    date: "2026-09-29",
    description: "Transport de fruits et légumes sous température dirigée vers les plateformes du Nord de la France.",
    details: ["Remorque frigorifique avec suivi de température", "Rotation Perpignan – Rungis", "Formation aux règles de la chaîne du froid"],
  },
  {
    id: 6,
    titre: "Conducteur citerne (ADR)",
    entreprise: "Vrac Méditerranée (fictif)",
    ville: "Marseille",
    region: "Provence-Alpes-Côte d'Azur",
    permis: "CE",
    contrat: "CDD",
    duree: "6 mois",
    salaireNet: 12900,
    date: "2026-10-02",
    description: "Transport de produits liquides en citerne, depuis la zone industrielle de Fos-sur-Mer.",
    details: ["Formation ADR citerne exigée", "Matériel entretenu en atelier interne", "Prime de dangerosité"],
  },
  {
    id: 7,
    titre: "Navettes de palettes Bordeaux – Toulouse",
    entreprise: "Garonne Transport (fictif)",
    ville: "Bordeaux",
    region: "Nouvelle-Aquitaine",
    permis: "CE",
    contrat: "CDD",
    duree: "2 mois",
    salaireNet: 3800,
    date: "2026-10-07",
    description: "Navettes régulières de palettes entre la plateforme de Bordeaux et celle de Toulouse, en renfort d'équipe.",
    details: ["Départ de la plateforme à 5 h", "Retour à Bordeaux dans la journée", "Ensemble routier récent"],
  },
  {
    id: 8,
    titre: "Conducteur international Benelux",
    entreprise: "Euro Fret Nord (fictif)",
    ville: "Lille",
    region: "Hauts-de-France",
    permis: "CE",
    contrat: "CDD",
    duree: "4 mois",
    salaireNet: 7800,
    date: "2026-09-27",
    description: "Liaisons entre le nord de la France, la Belgique et les Pays-Bas, avec retour hebdomadaire.",
    details: ["Anglais de base apprécié", "Indemnités de déplacement", "Tracteur avec couchette"],
  },
  {
    id: 9,
    titre: "Conducteur SPL distribution Grand Est",
    entreprise: "Rhin Logistique Services (fictif)",
    ville: "Strasbourg",
    region: "Grand Est",
    permis: "CE",
    contrat: "CDD",
    duree: "2 mois",
    salaireNet: 3500,
    date: "2026-10-04",
    description: "Distribution régionale de produits industriels sur le Grand Est, en renfort de l'équipe.",
    details: ["Plannings communiqués la semaine précédente", "Possibilité de CDI à terme", "Équipements de sécurité fournis"],
  },
  {
    id: 10,
    titre: "Chauffeur distribution Île-de-France",
    entreprise: "Capitale Livraisons (fictif)",
    ville: "Gennevilliers",
    region: "Île-de-France",
    permis: "C",
    contrat: "CDD",
    duree: "3 mois",
    salaireNet: 5200,
    date: "2026-09-30",
    description: "Livraisons de produits alimentaires auprès de commerces et restaurants, 5 jours par semaine.",
    details: ["Tournées en zone urbaine dense", "Port de charges légères", "Poste à pourvoir sous 15 jours"],
  },
  {
    id: 11,
    titre: "Chauffeur porteur transport régional",
    entreprise: "Occitanie Express (fictif)",
    ville: "Toulouse",
    region: "Occitanie",
    permis: "C",
    contrat: "CDD",
    duree: "3 mois",
    salaireNet: 5400,
    date: "2026-10-06",
    description: "Tournées régionales de livraison de colis et de palettes, du lundi au vendredi.",
    details: ["Retour au dépôt chaque soir", "Frais de carburant pris en charge", "Camion de moins de 3 ans"],
  },
  {
    id: 12,
    titre: "Chauffeur fruits et légumes",
    entreprise: "Primeurs du Comtat (fictif)",
    ville: "Avignon",
    region: "Provence-Alpes-Côte d'Azur",
    permis: "C",
    contrat: "CDD",
    duree: "3 mois",
    salaireNet: 5000,
    date: "2026-09-26",
    description: "CDD de saison : livraison de fruits et légumes auprès de marchés et de grandes surfaces dans le Vaucluse et le Gard.",
    details: ["Horaires du matin, finis vers 14 h", "Camion équipé d'un hayon", "Indemnité de fin de contrat"],
  },
  {
    // Mission d'illustration pour la maquette : tous les champs sont renseignés
    id: 13,
    titre: "Chauffeur SPL transport de matériaux — départ lundi",
    entreprise: "Matériaux du Midi (fictif)",
    ville: "Béziers",
    region: "Occitanie",
    permis: "CE",
    contrat: "CDD",
    duree: "3 mois",
    salaireNet: 5600,
    date: "2026-10-08",
    description:
      "Remplacement de 3 mois pour des livraisons de matériaux de construction (parpaings, sacs de ciment, palettes) entre notre dépôt de Béziers et les chantiers de l'Hérault et de l'Aude.",
    details: [
      "Début de mission : lundi 12 octobre 2026, 6 h 30 au dépôt",
      "Durée : 3 mois, avec possibilité de renouvellement",
      "Ensemble routier avec grue auxiliaire (formation interne assurée)",
      "Retour au dépôt chaque soir, aucun découcher",
      "Panier repas et équipements de sécurité fournis",
    ],
  },
];

/* ---------------------------------------------------------------------
   2) LOGIQUE : filtrer et trier
   Ces fonctions ne touchent pas à la page : elles reçoivent des données
   et renvoient des données. C'est ce qui les rend faciles à tester.
   --------------------------------------------------------------------- */

/* Supprime les accents et passe en minuscules : « Nîmes » devient « nimes ».
   Ainsi, taper « nimes » trouve bien « Nîmes ». */
function normaliser(texte) {
  return String(texte)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/* Niveau de chaque permis : un conducteur titulaire du CE peut aussi
   conduire un porteur (permis C). L'inverse n'est pas vrai. */
const NIVEAU_PERMIS = { C: 1, CE: 2 };

/* Renvoie les missions qui respectent TOUS les critères choisis.
   criteres = { recherche, region, permis }
   Un critère vide ("") est ignoré. */
function filtrerMissions(missions, criteres) {
  const recherche = normaliser(criteres.recherche || "");
  const mots = recherche.split(/\s+/).filter(Boolean);

  return missions.filter((mission) => {
    // 1) Région : correspondance exacte
    if (criteres.region && mission.region !== criteres.region) return false;

    // 2) Permis : la mission doit demander un permis de niveau inférieur ou égal au mien
    if (criteres.permis && NIVEAU_PERMIS[mission.permis] > NIVEAU_PERMIS[criteres.permis]) return false;

    // 3) Recherche texte : chaque mot tapé doit se trouver quelque part dans l'offre
    if (mots.length > 0) {
      const texteOffre = normaliser(
        [mission.titre, mission.entreprise, mission.ville, mission.region, mission.description].join(" ")
      );
      if (!mots.every((mot) => texteOffre.includes(mot))) return false;
    }

    return true;
  });
}

/* Trie une copie du tableau (sans modifier l'original). */
function trierMissions(missions, tri) {
  const copie = [...missions];
  if (tri === "salaire") {
    // Salaire net de la mission, du plus élevé au plus bas
    copie.sort((a, b) => b.salaireNet - a.salaireNet);
  } else {
    // Par défaut : les plus récentes d'abord (les dates ISO se comparent comme du texte)
    copie.sort((a, b) => b.date.localeCompare(a.date));
  }
  return copie;
}

/* Liste sans doublons des valeurs d'un champ, triée alphabétiquement.
   Sert à remplir automatiquement la liste « Région ». */
function valeursUniques(missions, champ) {
  return [...new Set(missions.map((m) => m[champ]))].sort((a, b) => a.localeCompare(b, "fr"));
}

/* Affiche un montant : 7000 devient « 7 000 € net / mission » */
function formaterSalaire(montant) {
  return montant.toLocaleString("fr-FR") + " € net / mission";
}

/* ---------------------------------------------------------------------
   3) AFFICHAGE ET ÉVÉNEMENTS
   Ce bloc ne s'exécute que sur la page web des offres (offres.html) :
   - pas pendant les tests (pas de document) ;
   - pas sur la page mobile, qui réutilise seulement les données et la logique
     ci-dessus, et qui a son propre affichage (linktruck-mobile/missions.js).
   --------------------------------------------------------------------- */
if (typeof document !== "undefined" && document.getElementById("filtersForm")) {
  const header = document.getElementById("header");
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");

  const form = document.getElementById("filtersForm");
  const grid = document.getElementById("offersGrid");
  const compteur = document.getElementById("resultsCount");
  const aucunResultat = document.getElementById("noResults");
  const toast = document.getElementById("toast");

  const champRecherche = document.getElementById("fSearch");
  const champRegion = document.getElementById("fRegion");
  const champPermis = document.getElementById("fPermis");
  const champTri = document.getElementById("fTri");

  /* ----- Menu mobile (même comportement que la page d'accueil) ----- */
  window.addEventListener(
    "scroll",
    () => header.classList.toggle("scrolled", window.scrollY > 40),
    { passive: true }
  );

  navToggle.addEventListener("click", () => {
    const ouvert = navToggle.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(ouvert));
    navToggle.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
    mobileNav.hidden = !ouvert;
    document.body.style.overflow = ouvert ? "hidden" : "";
  });

  /* ----- Remplir la liste des régions à partir des données ----- */
  valeursUniques(MISSIONS, "region").forEach((region) => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    champRegion.appendChild(option);
  });

  /* ----- Petite fonction pour créer un élément HTML ----- */
  function creer(balise, classe, texte) {
    const el = document.createElement(balise);
    if (classe) el.className = classe;
    if (texte !== undefined) el.textContent = texte;
    return el;
  }

  function formaterDate(dateIso) {
    return new Date(dateIso + "T00:00:00").toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  /* ----- Message de confirmation (démo) ----- */
  let minuteurToast;
  function afficherToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(minuteurToast);
    minuteurToast = setTimeout(() => {
      toast.hidden = true;
    }, 4500);
  }

  /* ----- Construire la carte d'une mission ----- */
  function creerCarte(mission) {
    const carte = creer("article", "offer-card");

    const haut = creer("div", "offer-top");
    haut.append(creer("span", "badge badge-gold", "Permis " + mission.permis));
    haut.append(creer("span", "badge badge-outline", mission.contrat + " · " + mission.duree));
    carte.append(haut);

    carte.append(creer("h3", "offer-title", mission.titre));
    carte.append(creer("p", "offer-company", mission.entreprise));

    const infos = creer("ul", "offer-meta");
    const lieu = creer("li");
    lieu.append(creer("strong", "", mission.ville), document.createTextNode(" — " + mission.region));
    infos.append(lieu);
    infos.append(creer("li", "", "Publiée le " + formaterDate(mission.date)));
    carte.append(infos);

    carte.append(creer("p", "offer-salary", formaterSalaire(mission.salaireNet)));
    carte.append(creer("p", "offer-desc", mission.description));

    // Détails repliables
    const idDetails = "details-" + mission.id;
    const details = creer("div", "offer-details");
    details.id = idDetails;
    details.hidden = true;
    details.append(creer("h4", "", "Conditions de la mission"));
    const liste = creer("ul");
    mission.details.forEach((ligne) => liste.append(creer("li", "", ligne)));
    details.append(liste);
    carte.append(details);

    // Boutons
    const actions = creer("div", "offer-actions");

    const boutonDetail = creer("button", "btn btn-outline", "Voir le détail");
    boutonDetail.type = "button";
    boutonDetail.setAttribute("aria-expanded", "false");
    boutonDetail.setAttribute("aria-controls", idDetails);
    boutonDetail.addEventListener("click", () => {
      const ouvert = details.hidden; // s'il est caché, on va l'ouvrir
      details.hidden = !ouvert;
      boutonDetail.setAttribute("aria-expanded", String(ouvert));
      boutonDetail.textContent = ouvert ? "Masquer le détail" : "Voir le détail";
    });

    const boutonPostuler = creer("button", "btn btn-primary", "Postuler");
    boutonPostuler.type = "button";
    boutonPostuler.addEventListener("click", () => {
      afficherToast(
        "Démonstration : votre candidature à « " + mission.titre + " » n'est pas envoyée (pas encore de back-end)."
      );
    });

    actions.append(boutonDetail, boutonPostuler);
    carte.append(actions);

    return carte;
  }

  /* ----- Lire les filtres, calculer, afficher ----- */
  function mettreAJour() {
    const criteres = {
      recherche: champRecherche.value,
      region: champRegion.value,
      permis: champPermis.value,
    };

    const resultats = trierMissions(filtrerMissions(MISSIONS, criteres), champTri.value);

    // On vide la grille puis on la remplit avec les cartes
    grid.replaceChildren(...resultats.map(creerCarte));

    const nombre = resultats.length;
    compteur.replaceChildren(
      creer("strong", "", String(nombre)),
      document.createTextNode(nombre > 1 ? " missions en CDD trouvées" : " mission en CDD trouvée")
    );
    aucunResultat.hidden = nombre > 0;
  }

  /* ----- Événements ----- */
  // « input » se déclenche à chaque touche tapée, « change » quand on choisit dans une liste
  champRecherche.addEventListener("input", mettreAJour);
  [champRegion, champPermis, champTri].forEach((champ) => champ.addEventListener("change", mettreAJour));

  // Entrée dans le champ de recherche : on n'envoie pas le formulaire
  form.addEventListener("submit", (e) => e.preventDefault());

  // Le bouton « Réinitialiser » remet les champs à zéro, puis on recalcule
  form.addEventListener("reset", () => setTimeout(mettreAJour, 0));

  document.getElementById("noResultsReset").addEventListener("click", () => {
    form.reset();
    champRecherche.focus();
  });

  mettreAJour();
}

/* Export pour pouvoir tester la logique avec Node.js (ignoré par le navigateur) */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { MISSIONS, normaliser, filtrerMissions, trierMissions, valeursUniques, formaterSalaire };
}
