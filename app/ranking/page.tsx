'use client';

import { useEffect, useState } from 'react';

type RankEntry = {
  discordId: string;
  sayucoins: number;
  username?: string;
  avatar?: string;
};

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ranking')
      .then((r) => r.json())
      .then(setRanking)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-sayuri-dark">
        Chargement du classement...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-2 text-center text-3xl font-bold text-sayuri-dark">
        🏆 Classement
      </h1>
      <p className="mb-6 text-center text-sayuri-dark/80">
        Mis à jour toutes les heures sur le serveur Discord.
      </p>
      <div className="glass-panel overflow-hidden">
        <ul className="divide-y divide-pink-200/60">
          {ranking.length === 0 ? (
            <li className="p-6 text-center text-sayuri-dark/70">
              Aucun joueur pour le moment.
            </li>
          ) : (
            ranking.map((entry, i) => (
              <li
                key={entry.discordId}
                className="flex items-center justify-between px-6 py-4"
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 text-xl font-bold text-sayuri-dark">
                    #{i + 1}
                  </span>
                  <span className="font-medium text-sayuri-dark">
                    {entry.username || `User ${entry.discordId.slice(-6)}`}
                  </span>
                </span>
                <span className="font-bold text-sayuri-manga">
                  {entry.sayucoins} Sayucoins
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
