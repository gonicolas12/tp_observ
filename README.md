# TaskBoard - projet fil rouge (séance 3 : production-ready)

Application reprise depuis la séance 1 (conteneurisée) et la séance 2 (déployée
sur Kubernetes). En séance 3, vous la rendez **observable, sécurisée et
déployable proprement**.

## Stack

- Frontend : HTML / CSS / JS (servi par `serve`, port 8080)
- Backend : Node.js / Express (port 3000, route `/health`)
- Base de données : PostgreSQL

## Point de départ

Votre déploiement Kubernetes de la **séance 2** (namespace `taskboard`,
Deployments + Services, ConfigMap, Secret, PVC) doit tourner :

```bash
kubectl get all -n taskboard
```

## Le TP

Sujet complet : **`../TP-Grafana-CICD.md`**.

Deux livrables : un **dashboard Grafana** (observabilité) et un **pipeline CI/CD**
(build → test → scan). Le reste (RBAC, durcissement, NetworkPolicy, blue-green /
canary) est en bonus.
