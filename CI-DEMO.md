# Démonstration CI : échec sur CVE (rouge) → correction (vert)

Le sujet demande de faire **échouer volontairement** le pipeline sur une
vulnérabilité, puis de le **corriger**. Deux méthodes au choix.

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
