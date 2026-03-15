# 🌸 Sayuri Games

Site et bot Discord pour **Sayuri Games** : connexion Discord, jeux, Sayucoins, classement et roulette à rôles.

## Déploiement sur Vercel

1. **Projet**
   - Lie le repo à Vercel (ou `vercel` en CLI).
   - Le build utilise Next.js automatiquement.

2. **Variables d’environnement (Vercel)**
   - `NEXTAUTH_URL` : URL du site (ex. `https://sayuri-games.vercel.app`)
   - `NEXTAUTH_SECRET` : une chaîne aléatoire (ex. `openssl rand -base64 32`)
   - `DISCORD_CLIENT_ID` et `DISCORD_CLIENT_SECRET` : application Discord (Portail développeur)
   - Optionnel : **Vercel KV** (Storage) pour garder classement et Sayucoins en production.
     - Créer une base KV dans l’onglet Storage du projet Vercel.
     - Ajouter `KV_REST_API_URL` et `KV_REST_API_TOKEN` (ajoutés automatiquement si tu lies la base au projet).

3. **Discord (application + bot)**
   - Créer une application sur [Discord Developer Portal](https://discord.com/developers/applications).
   - Onglet **OAuth2** : Redirects = `https://ton-domaine.vercel.app/api/auth/callback/discord`.
   - Créer un **Bot** dans la même application, copier le token → `DISCORD_BOT_TOKEN`.
   - Inviter le bot avec les scopes `bot` et les permissions « Gérer les rôles », « Voir les salons », « Envoyer des messages ».

## Bot Discord (préfixe `-`)

Le bot tourne **en dehors de Vercel** (sur ton PC, un VPS ou un service comme Railway).

1. **Variables d’environnement du bot**
   - `DISCORD_BOT_TOKEN` : token du bot.
   - `DISCORD_GUILD_ID` : ID du serveur.
   - `DISCORD_RANKING_CHANNEL_ID` : ID du salon où poster le classement toutes les heures.
   - `SITE_URL` : URL du site (ex. `https://sayuri-games.vercel.app`) pour appeler les APIs.
   - `SAYURI_BOT_SECRET` : même secret que sur Vercel (`SAYURI_BOT_SECRET`) pour les routes protégées du bot.

2. **Lancer le bot**
   ```bash
   npm run bot
   ```

3. **Commandes**
   - `-argent` / `-balance` / `-sayucoins` : affiche tes Sayucoins (ou ceux de l’utilisateur mentionné).
   - `-ranking` / `-classement` : affiche le top 10.

4. **Automatique**
   - Classement posté dans le salon configuré **toutes les heures**.
   - Toutes les **2 minutes**, le bot récupère les rôles gagnés à la roulette et les attribue aux membres.

## Roulette

- **Coût** : 1000 Sayucoins par tour.
- **Rôles** (IDs dans le code) avec chances : 1% / 3% / 6% / 12% / 20% / 28% (70% au total ; 30% = pas de rôle).

## Lien Discord

Sur le site : **discord.gg/sayuri** (lien vers le serveur).

## Développement local

```bash
cp .env.example .env
# Remplir .env (Discord OAuth + optionnel KV + bot si tu lances le bot en local)
npm install
npm run dev
```

Pour le bot en local : `SITE_URL=http://localhost:3000` et lancer `npm run bot` dans un second terminal.
