/**
 * PM2 Ecosystem — Dashboard Koursier (Next.js 15)
 *
 * Ce dépôt sert trois espaces dans une seule application Next :
 *   - le site public et l'espace client   (/, /commander)
 *   - l'espace super-admin                (/dashboard)
 *   - l'espace restaurateur               (/restaurant)
 *
 * ATTENTION AU BUILD : `NEXT_PUBLIC_API_URL` est figée dans le bundle client au
 * moment de `next build`, pas au démarrage. La définir ici ne suffit donc PAS :
 * elle doit être présente dans l'environnement AVANT le build (fichier
 * .env.production sur le serveur). La changer impose de rebuilder.
 *
 * Usage :
 *   pm2 start ecosystem.config.js --env production
 *   pm2 reload dashbord-next --update-env
 *   pm2 logs dashbord-next
 */

module.exports = {
  apps: [
    {
      name: 'dashbord-next',
      // On appelle le binaire Next directement plutôt que `npm start` : un
      // wrapper npm intercale un shell qui ne relaie pas proprement SIGTERM,
      // et PM2 finirait par tuer le process au lieu de l'arrêter.
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/dashbord-next',

      // Next `start` est sans état : le mode cluster serait possible. On reste
      // en fork à 1 instance, suffisant pour un dashboard et sans surprise.
      // Pour monter en charge : instances: 2, exec_mode: 'cluster'.
      instances: 1,
      exec_mode: 'fork',

      // ── Limite mémoire ─────────────────────────────────────────────────
      // Le serveur Next garde en mémoire le cache de rendu et les chunks.
      // Vérifier la RAM de la machine (`free -m`) avant de monter ce plafond :
      // il doit rester nettement sous la RAM libre, sinon c'est le noyau qui
      // tue le process (OOM killer), sans redémarrage propre.
      max_memory_restart: '1024M',

      // ── Redémarrages ───────────────────────────────────────────────────
      autorestart: true,
      // Au-delà de max_restarts, PM2 marque l'app « errored » et cesse de la
      // relancer : le site resterait éteint jusqu'à une intervention manuelle.
      max_restarts: 1000,
      min_uptime: '10s',
      restart_delay: 1000,

      // ── Logs ───────────────────────────────────────────────────────────
      // Créer le dossier une fois : mkdir -p /var/www/dashbord-next/logs
      error_file: '/var/www/dashbord-next/logs/error.log',
      out_file: '/var/www/dashbord-next/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      time: true,

      // ── Env production ─────────────────────────────────────────────────
      // PORT est bien lu au démarrage par `next start`. 3000 pour le front,
      // l'API occupant déjà 3001 sur la même machine.
      // TZ aligne les dates affichées sur l'heure du Cameroun, comme l'API.
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        TZ: 'Africa/Douala',
      },

      // ── Env staging ────────────────────────────────────────────────────
      env_staging: {
        NODE_ENV: 'production', // Next exige NODE_ENV=production pour `start`
        PORT: 3010,
        TZ: 'Africa/Douala',
      },

      watch: false,

      // ── Arrêt ──────────────────────────────────────────────────────────
      // Next ferme son serveur HTTP sur SIGTERM ; 5 s suffisent largement.
      kill_timeout: 5000,

      // `next start` n'émet pas process.send('ready') : activer wait_ready
      // ferait attendre listen_timeout en entier à chaque reload, pour rien.
      wait_ready: false,
      listen_timeout: 15000,
    },
  ],
};
