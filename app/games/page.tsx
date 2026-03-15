'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

type Difficulty = 'facile' | 'moyen' | 'difficile';

const DIFFICULTIES: { id: Difficulty; label: string; emoji: string }[] = [
  { id: 'facile', label: 'Facile', emoji: '🌸' },
  { id: 'moyen', label: 'Moyen', emoji: '🌺' },
  { id: 'difficile', label: 'Difficile', emoji: '💮' },
];

export default function GamesPage() {
  const { data: session, status } = useSession();
  const [result, setResult] = useState<{ reward: number; sayucoins: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function play(difficulty: Difficulty) {
    if (!session) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/games/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setResult({ reward: data.reward, sayucoins: data.sayucoins });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="py-12 text-center text-sayuri-dark">
        Chargement...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="glass-panel mx-auto max-w-lg p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-sayuri-dark">Connexion requise</h2>
        <p className="mb-6 text-sayuri-dark/90">
          Connecte-toi avec Discord pour jouer et gagner des Sayucoins.
        </p>
        <Link href="/" className="btn-sayuri">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-sayuri-dark">
        🎮 Jeux
      </h1>
      <p className="mb-6 text-center text-sayuri-dark/90">
        Choisis une difficulté. Plus c&apos;est difficile, plus tu gagnes de Sayucoins !
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.id}
            onClick={() => play(d.id)}
            disabled={loading}
            className="glass-panel flex flex-col items-center gap-2 p-6 transition hover:scale-105 disabled:opacity-50"
          >
            <span className="text-4xl">{d.emoji}</span>
            <span className="font-bold text-sayuri-dark">{d.label}</span>
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-4 text-center text-red-600">{error}</p>
      )}
      {result && (
        <div className="glass-panel mt-6 p-6 text-center">
          <p className="text-lg text-sayuri-dark">
            +{result.reward} Sayucoins ! Tu as maintenant <strong>{result.sayucoins}</strong> Sayucoins.
          </p>
        </div>
      )}
    </div>
  );
}
