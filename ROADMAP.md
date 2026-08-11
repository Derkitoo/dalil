# Roadmap produit — Dalil | دليل

## Vision

Dalil aide les francophones et arabophones à transformer un message douteux en enquête structurée, puis cette enquête en compétence durable.

Principe central : **ne pas demander à l’utilisateur de croire Dalil, mais lui montrer comment vérifier**.

## Indicateur principal

Le succès n’est pas le temps passé dans l’application. Nous mesurons la capacité à mieux vérifier sans assistance :

- reconnaître une technique de manipulation ;
- retrouver une source primaire ;
- différencier affirmation, opinion et preuve ;
- expliquer pourquoi une source est fiable ;
- renoncer à partager lorsqu’une preuve manque.

---

## Phase 0 — Prototype pédagogique bilingue

**Statut : livré**

- [x] Interface français/arabe avec RTL automatique
- [x] Analyse locale de trois catégories : arnaque, santé, général
- [x] Explication en trois blocs : connu, risque, preuve manquante
- [x] Sources recommandées
- [x] Micro-leçon interactive
- [x] Progression locale sans compte
- [x] Déploiement GitHub Pages

### Limite assumée

Cette version oriente l’enquête mais ne consulte pas encore les sources en direct. Elle ne doit jamais être présentée comme un moteur de fact-checking complet.

---

## Phase 1 — MVP « Anti-arnaque »

**Objectif : fournir une première utilité réelle avec un domaine à risque maîtrisable.**

### P0 — indispensable

- [ ] Coller un texte, une URL ou un message WhatsApp
- [ ] Détecter urgence, gain, usurpation, demande de code et lien suspect
- [ ] Extraire et afficher le domaine réel d’un lien
- [ ] Vérifier le domaine avec des services de réputation
- [ ] Comparer le lien au domaine officiel de l’organisation citée
- [ ] Produire un verdict prudent avec preuves visibles
- [ ] Générer une réponse courte à renvoyer à un proche
- [ ] Boutons « utile », « incorrect » et « preuve insuffisante »
- [ ] Ne jamais stocker un message sans consentement explicite

### P1 — important

- [ ] Import de capture d’écran avec extraction du texte
- [ ] Reconnaissance des chiffres arabes et occidentaux
- [ ] Détection français, arabe standard et dialectes fréquents
- [ ] Historique local supprimable
- [ ] Mode faible connexion
- [ ] Signalement d’un nouveau modèle d’arnaque

### Critères de sortie

- au moins 80 % des utilisateurs comprennent la recommandation sans aide ;
- zéro demande de mot de passe, code OTP ou donnée bancaire par Dalil ;
- chaque conclusion contient une preuve ou porte la mention « non vérifiable » ;
- test avec 30 utilisateurs arabophones et francophones ;
- revue des scénarios par un spécialiste de cybersécurité.

---

## Phase 2 — Moteur de preuves

**Objectif : passer d’un classificateur de risques à une enquête documentée.**

### Pipeline

1. Détecter la langue et normaliser le texte.
2. Découper le message en affirmations vérifiables.
3. Classer le domaine et son niveau de risque.
4. Sélectionner uniquement les sources adaptées.
5. Rechercher des passages précis, pas seulement des pages.
6. Comparer date, auteur, indépendance et contradictions.
7. Produire une conclusion avec niveau de confiance.
8. Montrer les limites et transformer le cas en micro-leçon.

### Registre des sources

Chaque source devra contenir :

- propriétaire et URL officielle ;
- pays, langue et domaine couvert ;
- nature : primaire, institutionnelle, scientifique ou secondaire ;
- licence, coût, quota et authentification ;
- date de dernière vérification ;
- disponibilité et temps de réponse ;
- règles de citation et restrictions d’usage ;
- niveau de risque acceptable.

### P0 — indispensable

- [ ] Registre structuré des sources
- [ ] Vérification automatique des liens morts
- [ ] Citations ouvrables au niveau du passage pertinent
- [ ] Date de consultation et date du document
- [ ] Statuts : confirmé, probable, trompeur, non étayé, faux, invérifiable
- [ ] Affichage séparé des faits et de l’interprétation de Dalil
- [ ] Journal interne permettant d’expliquer chaque conclusion

### Critères de sortie

- aucune conclusion sans provenance ;
- au moins deux sources indépendantes pour un verdict fort ;
- mesure de précision sur un corpus bilingue annoté ;
- revue humaine obligatoire pour les cas à fort risque.

---

## Phase 3 — Coach d’esprit critique

**Objectif : réduire progressivement la dépendance à Dalil.**

- [ ] Diagnostic initial des compétences
- [ ] Parcours courts : sources, images, statistiques, IA, faux experts
- [ ] Répétition espacée
- [ ] Difficulté adaptative
- [ ] Explications enfant, grand public et approfondies
- [ ] Passeport de compétences privé
- [ ] Défis avant/après pour mesurer le progrès réel
- [ ] Mode enseignant sans surveillance intrusive

### Compétences suivies

- source primaire ;
- corroboration ;
- biais et cadrage ;
- corrélation/causalité ;
- statistiques trompeuses ;
- urgence artificielle ;
- contenu généré ou manipulé par IA ;
- différence entre absence de preuve et preuve d’absence.

### Critères de sortie

- amélioration mesurable entre le diagnostic et le test final ;
- progression exportable et supprimable ;
- aucune récompense fondée sur le temps d’écran ;
- validation pédagogique avec enseignants ou médiateurs.

---

## Phase 4 — Domaines sensibles et distribution

**Objectif : élargir uniquement après validation du moteur et de la gouvernance.**

### Ordre recommandé

1. Arnaques et sécurité numérique
2. Images, vidéos et contenus générés par IA
3. Statistiques et données publiques
4. Sciences générales
5. Santé, avec supervision médicale
6. Droit, selon le pays et avec avertissements juridictionnels
7. Religion, avec comité éditorial et pluralité explicite des références

### Distribution

- [ ] Progressive Web App installable
- [ ] Partage direct depuis le navigateur et WhatsApp
- [ ] Notes vocales et lecture audio
- [ ] Mode hors connexion partiel
- [ ] Pilotes avec écoles, bibliothèques et associations
- [ ] API pédagogique pour médias et institutions

---

## Gouvernance et sécurité

### Règles non négociables

- Dalil ne doit jamais se présenter comme « la vérité ».
- L’incertitude doit être visible, pas cachée dans une note.
- Les sources doivent être consultables par l’utilisateur.
- La santé, le droit, la finance et la religion exigent des règles renforcées.
- Aucun profil politique, religieux ou psychologique ne doit être construit.
- Les messages privés restent sur l’appareil par défaut.
- L’utilisateur peut effacer et exporter ses données.
- Les corrections importantes sont publiées dans un journal transparent.

### Menaces à tester

- source officielle compromise ou obsolète ;
- citation correcte sortie de son contexte ;
- consensus scientifique présenté comme unanimité ;
- faux domaine ressemblant à un domaine officiel ;
- prompt injection dans une page analysée ;
- contenu haineux ou violent ;
- tentative d’utiliser Dalil pour diffamer une personne.

---

## Architecture cible

```text
Entrée texte / URL / image / audio
              ↓
Normalisation FR / AR / dialectes
              ↓
Extraction des affirmations
              ↓
Classification du risque
              ↓
Routeur vers les sources autorisées
              ↓
Collecte et comparaison des preuves
              ↓
Conclusion + confiance + limites
              ↓
Explication + micro-leçon + retour utilisateur
```

## Prochain sprint recommandé — 2 semaines

### Semaine 1

- [ ] Formaliser 30 exemples d’arnaques FR/AR
- [ ] Définir le schéma d’une analyse et d’une source
- [ ] Extraire les URL présentes dans un message
- [ ] Afficher domaine, protocole et caractères suspects
- [ ] Ajouter trois organisations officielles de test

### Semaine 2

- [ ] Connecter une API de réputation de liens
- [ ] Construire la réponse partageable
- [ ] Ajouter le retour utilisateur
- [ ] Tester avec 10 personnes
- [ ] Corriger les cinq incompréhensions les plus fréquentes

### Définition de « terminé »

Un utilisateur peut coller un message d’arnaque réaliste et obtenir, en moins de dix secondes : les signaux de risque, le domaine réel, les vérifications effectuées, une recommandation claire et une réponse qu’il peut transmettre sans humilier son proche.
