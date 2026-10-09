# Portfolio de développement web

Portfolio réalisé dans le cadre de ma formation développeur web et applications (bac+3, STUDI).
Il présente mes projets, du site vitrine à l'application connectée à une base de données.

Site en ligne : https://pixelbarbie29-wq.github.io/monportfolio/

## Technologies

HTML, CSS, JavaScript. Publication avec GitHub Pages.

## Projets présentés

| Projet | Description |
| --- | --- |
| **LinkTruck** (web v2) | Plateforme qui met en relation des chauffeurs routiers et des entreprises qui recrutent : page d'accueil et offres de missions. |
| **LinkTruck** (mobile) | Version mobile : accueil et liste des missions. |
| **Movewell** | Application de sport adaptatif connectée à Supabase (présentée par captures d'écran). |
| **Sites vitrines WordPress** | Maquettes réalisées avec Elementor : boulangerie « La Mie de Soleil » et salon de coiffure « Pigment-Studio » (présentés par captures d'écran). |

## Organisation du dépôt

```
index.html, portfolio.html   pages d'accueil et de présentation des projets
apropos.html, contact.html   pages « À propos » et « Contact »
projet*.html                 une page par projet
linktruck-v2/                LinkTruck web (pages, scripts, styles)
linktruck-mobile/            LinkTruck mobile (pages, scripts, styles)
linktruck-demo/              démo d'inscription et d'espace LinkTruck (voir ci-dessous)
images/                      toutes les images du site
common.css, portfolio.css    styles partagés
```

## Démo d'inscription LinkTruck

Le dossier `linktruck-demo/` reprend les pages d'inscription, de connexion et d'espace personnel du projet complet.
Sans serveur, un faux serveur écrit en JavaScript (`scripts/demo-api.js`) répond à la place du vrai : les comptes
sont gardés dans le navigateur du visiteur (localStorage), les mots de passe y sont hachés, et seul le nom des
fichiers est conservé (jamais leur contenu). Deux boutons en haut de page simulent la validation ou le refus d'un
document par l'équipe LinkTruck. L'outil d'administration n'est pas inclus.

## Notes

Les projets LinkTruck et Movewell complets sont développés dans des dépôts privés.
Ce dépôt ne contient que les pages de démonstration du portfolio.
