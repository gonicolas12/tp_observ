# Démonstration CI : échec sur CVE (rouge) → correction (vert)

## Ce qui a réellement été fait dans ce rendu

Le scan Trivy a détecté de **vraies CVE HIGH** (run #2, rouge) :
- côté OS : `libssl3` / `libcrypto3` (Alpine) ;
- côté Node : `tar`, `glob`, `minimatch`, `cross-spawn`, embarqués dans le CLI
  **npm** présent dans l'image de base `node:20-alpine` (pas dans nos
  dépendances applicatives).

**Correction (run #3, vert)** dans `backend/Dockerfile` :
- `RUN apk upgrade --no-cache` → corrige les CVE des paquets système ;
- suppression du CLI npm de l'image finale (inutile au runtime, lancé par
  `node`) → supprime les CVE de `tar`/`glob`/`minimatch`/`cross-spawn` et réduit
  la surface d'attaque.

C'est un échec/correction **authentique**. Les méthodes ci-dessous sont des
alternatives « volontaires » si l'on veut reproduire la démo à la demande.

---

## Méthodes alternatives pour forcer un échec

## Méthode recommandée : dépendance vulnérable

1. Ajouter une dépendance avec une CVE HIGH/CRITICAL connue dans
   `backend/package.json` :

   ```json
   "dependencies": {
     "cors": "^2.8.5",
     "dotenv": "^16.4.5",
     "express": "^4.19.2",
     "pg": "^8.12.0",
     "lodash": "4.17.4"        // <-- prototype pollution (CVE-2019-10744, HIGH)
   }
   ```

2. Commit + push → l'étape **Scan Trivy** détecte la CVE et **échoue**
   (capture « rouge » du pipeline).

3. **Corriger** : retirer la ligne `lodash` (ou la passer en `^4.17.21`),
   commit + push → le pipeline repasse **vert** (capture « verte »).

> `ignore-unfixed: true` est activé dans le workflow : seules les CVE **avec
> correctif** font échouer le scan, ce qui rend la démo rouge→vert fiable.

## Méthode alternative : test cassé

Modifier temporairement `backend/test/validation.test.js` pour qu'une assertion
soit fausse (ex. attendre `r.ok === true` sur un titre vide). L'étape **test**
échoue → pipeline rouge. Rétablir l'assertion → vert.

## Scan en local (facultatif)

```bash
docker build -t taskboard-api:1.0.0 ./backend
trivy image --severity HIGH,CRITICAL --exit-code 1 taskboard-api:1.0.0
```
