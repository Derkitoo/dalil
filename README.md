# Dalil | دليل

Assistant bilingue français–arabe pour analyser une information, identifier les preuves nécessaires et développer l’esprit critique.

## Tester l’application

- Version publiée : <https://derkitoo.github.io/dalil/>
- Version locale autonome : ouvrir `index.html` dans un navigateur.

## Fonctionnalités actuelles

- interface française et arabe avec RTL automatique ;
- analyse préliminaire des arnaques, affirmations de santé et messages généraux ;
- sources recommandées et limites clairement affichées ;
- mini-leçons interactives ;
- progression conservée uniquement sur l’appareil.

## Vérification en direct

Le service serveur `GET /api/reputation?url=...` consulte le dernier rapport connu de VirusTotal sans soumettre automatiquement une nouvelle URL. La clé reste côté serveur dans `VIRUSTOTAL_API_KEY` et ne doit jamais être intégrée au JavaScript public.

GitHub Pages héberge uniquement l’interface statique : l’analyse locale y reste disponible, mais la réputation en direct nécessite le déploiement du Worker avec cette variable secrète.

Cette version est un prototype pédagogique. Elle ne réalise pas encore de vérification en direct et ne remplace pas un avis professionnel.

## Roadmap

Consulter la [roadmap produit](ROADMAP.md) pour les prochaines phases, les priorités et les critères de sortie.

## Publication

Le workflow GitHub Pages publie automatiquement `index.html` après chaque push sur `main`.
