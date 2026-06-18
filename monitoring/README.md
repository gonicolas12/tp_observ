# Stack de supervision TaskBoard

Parcours choisi : **Docker Compose**.

Chaîne montée : **Prometheus + node_exporter (+ cAdvisor) → Grafana →
Alertmanager → mail (MailHog) + Discord**.

```
prometheus.yml ──scrape──> node-exporter (CPU/RAM/disque/réseau)
       │                    cadvisor      (conteneurs TaskBoard)
       │
       ├── évalue rules/alerts.yml
       │
       └──> Alertmanager ──┬── e-mail  -> MailHog (UI :8025)
                           └── Discord -> webhook du salon

Grafana ──datasource──> Prometheus ──> dashboards (TaskBoard + Node Exporter Full 1860)
```

## Arborescence

```
monitoring/
├── docker-compose.monitoring.yml      # tous les services de supervision
├── prometheus/
│   ├── prometheus.yml                 # cibles à scraper + lien Alertmanager
│   └── rules/alerts.yml               # règles d'alerte (node down, CPU, RAM)
├── alertmanager/
│   └── alertmanager.yml               # routage mail + Discord
└── grafana/
    ├── provisioning/
    │   ├── datasources/datasource.yml # datasource Prometheus auto-créée
    │   └── dashboards/dashboards.yml  # chargement auto des dashboards
    └── dashboards/
        └── taskboard.json             # dashboard TaskBoard personnalisé
```

## 1. Démarrer

D'abord l'application (depuis `taskboard/`) puis la supervision :

```bash
# Application TaskBoard
docker compose up -d

# Stack de supervision
cd monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

| Service       | URL                         | Identifiants |
|---------------|-----------------------------|--------------|
| Prometheus    | http://localhost:9090       | —            |
| Grafana       | http://localhost:3001       | admin / admin|
| Alertmanager  | http://localhost:9093       | —            |
| MailHog (mail)| http://localhost:8025       | —            |
| cAdvisor      | http://localhost:8081       | —            |

## 2. Vérifier les cibles UP (A.1)

Prometheus → **Status → Targets** : `prometheus`, `node`, `cadvisor`,
`alertmanager` doivent être **UP** (capture pour le rapport).

## 3. Grafana (A.2)

- La datasource Prometheus et le dashboard **« TaskBoard - Vue d'ensemble »**
  sont déjà chargés automatiquement (provisioning).
- Pour le **Node Exporter Full (ID 1860)** : Grafana → Dashboards → **New →
  Import** → saisir `1860` → choisir la datasource Prometheus.
  (Option : exporter son JSON et le déposer dans `grafana/dashboards/` pour
  qu'il soit lui aussi auto-chargé.)

## 4. Alerting mail + Discord (A.3)

### a) Configurer le webhook Discord
1. Discord → salon → **Paramètres du salon → Intégrations → Webhooks → Nouveau**.
2. Copier l'URL du webhook.
3. La coller dans `alertmanager/alertmanager.yml` à la place de
   `https://discord.com/api/webhooks/REMPLACEZ_MOI/...`.
4. Recharger Alertmanager :
   ```bash
   docker compose -f docker-compose.monitoring.yml restart alertmanager
   ```

### b) Le mail : rien à faire
Alertmanager envoie sur `mailhog:1025`, MailHog capture tout sur
http://localhost:8025.

### c) Déclencher l'alerte volontairement (preuve)
Le plus simple — couper node_exporter (déclenche `NodeExporterDown` après 1 min) :

```bash
docker compose -f docker-compose.monitoring.yml stop node-exporter
```

- Prometheus → **Alerts** : `NodeExporterDown` passe **PENDING** puis **FIRING**.
- Alertmanager (:9093) : l'alerte apparaît.
- **MailHog (:8025)** : le mail arrive → capture.
- **Discord** : le message arrive dans le salon → capture.

Pour revenir à la normale :
```bash
docker compose -f docker-compose.monitoring.yml start node-exporter
```

> Variante : abaisser le seuil CPU dans `rules/alerts.yml` (ex. `> 1`) puis
> `restart prometheus` pour déclencher `HighCpuLoad`.

## Dépannage

| Symptôme                        | Piste                                                        |
|---------------------------------|--------------------------------------------------------------|
| Cible `node` DOWN               | Vérifier `node-exporter:9100` dans `prometheus.yml`          |
| Alerte jamais envoyée           | Règle pas chargée (Prometheus → Status → Rules) / route KO   |
| Mail non reçu                   | Vérifier MailHog (:8025) et `smtp_smarthost: mailhog:1025`   |
| Discord muet                    | Webhook erroné, ou Alertmanager < v0.25 (ici v0.27 = OK)     |
| Stack qui rame                  | Allouer plus de RAM à Docker Desktop                         |
