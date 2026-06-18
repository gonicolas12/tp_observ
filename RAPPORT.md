# Rapport TP — Observabilité (Grafana) & CI/CD

**Étudiant :** Nicolas GOUY
**Parcours choisi :** Docker Compose
**Dépôt / image :** `taskboard-api:1.0.0`

> Convertir ce fichier en PDF (1–2 pages) une fois les captures insérées.
> Sur VS Code : extension « Markdown PDF » → clic droit → *Export (pdf)*.

---

## Partie A — Stack de supervision

Chaîne : **Prometheus + node_exporter (+ cAdvisor) → Grafana → Alertmanager →
mail (MailHog) + Discord**. Tout est défini dans `monitoring/`
(`docker-compose.monitoring.yml` + configs commentées).

### A.1 — Cibles UP
*(Capture : Prometheus → Status → Targets, toutes les cibles UP)*

![Targets UP](captures/targets-up.png)

### A.2 — Dashboard Grafana
*(Capture : dashboard « TaskBoard - Vue d'ensemble » et/ou Node Exporter Full 1860)*

![Dashboard Grafana](captures/grafana-dashboard.png)

### A.3 — Alerte mail + Discord
Règle déclenchée : `NodeExporterDown` (arrêt volontaire de node_exporter).

*(Capture 1 : mail reçu dans MailHog :8025)*

![Alerte mail](captures/alerte-mail.png)

*(Capture 2 : message reçu dans le salon Discord)*

![Alerte Discord](captures/alerte-discord.png)

---

## Partie B — Pipeline CI/CD (GitHub Actions)

Fichier : `.github/workflows/ci.yml`. À chaque push : **test → build → scan
Trivy** (échec sur CVE HIGH/CRITICAL grâce à `exit-code: 1`).

### Échec volontaire puis correction (rouge → vert)
*(Capture 1 : pipeline ROUGE — Trivy échoue sur une CVE HIGH/CRITICAL)*

![Pipeline rouge](captures/pipeline-rouge.png)

*(Capture 2 : pipeline VERT après correction)*

![Pipeline vert](captures/pipeline-vert.png)

**Comment l'échec a été provoqué :** voir `CI-DEMO.md` (ajout d'une dépendance
vulnérable, puis retrait).

---

## Choix techniques (2–3 phrases)

J'ai choisi le parcours **Docker Compose** car la stack TaskBoard de la séance 1
était déjà opérationnelle. Pour l'alerting, **MailHog** sert de faux SMTP (aucun
mot de passe réel, mails visibles dans une UI) et **Alertmanager v0.27** envoie
en parallèle sur le webhook **Discord** via `discord_configs`. Le pipeline
**GitHub Actions** sépare *test* et *build+scan* : Trivy échoue le job sur toute
CVE HIGH/CRITICAL (`exit-code: 1`), ce qui bloque la livraison d'une image
vulnérable.
