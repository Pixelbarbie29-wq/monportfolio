/* =====================================================================
   LinkTruck Mobile — page « Missions »

   Les données (MISSIONS) et la logique (filtrerMissions, trierMissions,
   valeursUniques, formaterSalaire) viennent de
   ../linktruck-v2/scripts/offres.js, chargé juste avant ce fichier.
   → Pour ajouter ou modifier une mission, on ne le fait qu'à cet endroit :
     la page web et l'appli mobile se mettent à jour ensemble.

   Ce fichier ne s'occupe que de l'affichage mobile et des événements.
   Il est enveloppé dans une fonction pour ne pas mélanger ses noms avec
   ceux de offres.js.
   ===================================================================== */
(function () {
  "use strict";

  // Sécurité : si offres.js n'a pas été chargé, on le dit clairement
  if (typeof MISSIONS === "undefined") {
    const liste = document.getElementById("missionsList");
    if (liste) liste.textContent = "Les missions n'ont pas pu être chargées (fichier offres.js introuvable).";
    return;
  }

  const form = document.getElementById("missionsForm");
  const liste = document.getElementById("missionsList");
  const compteur = document.getElementById("missionsCount");
  const vide = document.getElementById("missionsEmpty");
  const toast = document.getElementById("missionsToast");
  const topDate = document.getElementById("topDate");

  const champRecherche = document.getElementById("mSearch");
  const champRegion = document.getElementById("mRegion");
  const champPermis = document.getElementById("mPermis");
  const champTri = document.getElementById("mTri");

  /* ----- Date en haut à droite (comme sur l'écran d'accueil) ----- */
  if (topDate) {
    topDate.textContent = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

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
  let minuteur;
  function afficherToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(minuteur);
    minuteur = setTimeout(() => {
      toast.hidden = true;
    }, 4500);
  }

  /* ----- Construire la carte d'une mission ----- */
  function creerCarte(mission) {
    const carte = creer("article", "offer");
    carte.append(creer("span", "offer__mark"));
    carte.firstChild.setAttribute("aria-hidden", "true");

    const corps = creer("div", "offer__body");

    const tags = creer("p", "offer__tags");
    tags.append(
      creer("span", "tag tag--red", "Permis " + mission.permis),
      creer("span", "tag", mission.contrat + " · " + mission.duree)
    );
    corps.append(tags);

    corps.append(creer("h2", "offer__title", mission.titre));
    corps.append(creer("p", "offer__company", mission.entreprise + " — " + mission.ville + ", " + mission.region));
    corps.append(creer("p", "offer__salary", formaterSalaire(mission.salaireNet)));
    corps.append(creer("p", "offer__desc", mission.description));
    corps.append(creer("p", "offer__date", "Publiée le " + formaterDate(mission.date)));

    // Détails repliables
    const idDetails = "m-details-" + mission.id;
    const details = creer("div", "offer__details");
    details.id = idDetails;
    details.hidden = true;
    details.append(creer("p", "section-legend", "Conditions de la mission"));
    const puces = creer("ul");
    mission.details.forEach((ligne) => puces.append(creer("li", "", ligne)));
    details.append(puces);
    corps.append(details);

    // Boutons
    const actions = creer("div", "offer__actions");

    const boutonDetail = creer("button", "action-btn", "Voir le détail");
    boutonDetail.type = "button";
    boutonDetail.setAttribute("aria-expanded", "false");
    boutonDetail.setAttribute("aria-controls", idDetails);
    boutonDetail.addEventListener("click", () => {
      const ouvrir = details.hidden; // s'il est caché, on va l'ouvrir
      details.hidden = !ouvrir;
      boutonDetail.setAttribute("aria-expanded", String(ouvrir));
      boutonDetail.textContent = ouvrir ? "Masquer le détail" : "Voir le détail";
    });

    const boutonPostuler = creer("button", "action-btn action-btn--main", "Postuler");
    boutonPostuler.type = "button";
    boutonPostuler.addEventListener("click", () => {
      afficherToast(
        "Démonstration : ta candidature à « " + mission.titre + " » n'est pas envoyée (pas encore de back-end)."
      );
    });

    actions.append(boutonDetail, boutonPostuler);
    corps.append(actions);

    carte.append(corps);
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

    liste.replaceChildren(...resultats.map(creerCarte));

    const nombre = resultats.length;
    compteur.replaceChildren(
      creer("strong", "", String(nombre)),
      document.createTextNode(nombre > 1 ? " missions en CDD" : " mission en CDD")
    );
    vide.hidden = nombre > 0;
  }

  /* ----- Événements ----- */
  champRecherche.addEventListener("input", mettreAJour);
  [champRegion, champPermis, champTri].forEach((champ) => champ.addEventListener("change", mettreAJour));

  // Touche Entrée dans la recherche : on n'envoie pas le formulaire
  form.addEventListener("submit", (e) => e.preventDefault());

  // « Réinitialiser » remet les champs à zéro, puis on recalcule
  form.addEventListener("reset", () => setTimeout(mettreAJour, 0));

  document.getElementById("missionsEmptyReset").addEventListener("click", () => {
    form.reset();
    champRecherche.focus();
  });

  mettreAJour();
})();
