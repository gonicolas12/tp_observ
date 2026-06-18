# --- Étape 1 : installation des dépendances de production -------------------
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# --- Étape 2 : image finale exécutée en production --------------------------
FROM node:20-alpine

# Mise à jour des paquets système Alpine : corrige les CVE OS
# (ex. libssl3 / libcrypto3) signalées par Trivy.
RUN apk upgrade --no-cache

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY .env.example ./.env.example
COPY package*.json ./

# Durcissement : on retire le CLI npm de l'image finale. Il n'est pas
# nécessaire pour exécuter l'application (lancée par "node") et ses
# dépendances embarquées (glob, minimatch, tar, cross-spawn) traînent des
# CVE HIGH. Les supprimer réduit la surface d'attaque et fait passer Trivy.
RUN rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/bin/npm \
           /usr/local/bin/npx

USER node

EXPOSE 3000

CMD ["node", "src/app.js"]
