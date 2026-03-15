'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useCallback } from 'react';

const ROULETTE_COST = 1000;

export default function RoulettePage() {
  const { data: session, status } = useSession();
  const [sayucoins, setSayucoins] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ won: boolean; tier?: number; sayucoins: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(() => {
    if (!session?.user?.id) return;
    fetch('/api/users')
      .then((r) => r.json())
      .then((u) => setSayucoins(u.sayucoins))
      .catch(() => setSayucoins(0));
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) fetchUser();
  }, [session?.user?.id, fetchUser]);

  async function spin() {
    if (!session) return;
    setSpinning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/roulette/spin', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setResult({ won: data.won, tier: data.tier, sayucoins: data.sayucoins });
      setSayucoins(data.sayucoins);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSpinning(false);
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
          Connecte-toi avec Discord pour tourner la roulette.
        </p>
        <Link href="/" className="btn-sayuri">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const canSpin = sayucoins !== null && sayucoins >= ROULETTE_COST && !spinning;

  return (
    <div className="mx-auto max-w-lg py-8">
      <h1 className="mb-2 text-center text-3xl font-bold text-sayuri-dark">
        🎡 Roulette
      </h1>
      <p className="mb-6 text-center text-sayuri-dark/90">
        Coût : <strong>{ROULETTE_COST} Sayucoins</strong>. Tu peux gagner un rôle exclusif sur le serveur !
      </p>
      <div className="glass-panel mb-6 p-6 text-center">
        <p className="text-sayuri-dark">
          Ton solde : <strong>{sayucoins ?? '...'}</strong> Sayucoins
        </p>
      </div>
      <div className="flex justify-center">
        <button
          onClick={spin}
          disabled={!canSpin}
          className="btn-sayuri disabled:opacity-50 disabled:hover:scale-100"
        >
          {spinning ? 'Rotation...' : `Tourner la roulette (${ROULETTE_COST} Sayucoins)`}
        </button>
      </div>
      {error && (
        <p className="mt-4 text-center text-red-600">{error}</p>
      )}
      {result && (
        <div className="glass-panel mt-6 p-6 text-center">
          {result.won ? (
            <p className="text-lg font-bold text-sayuri-dark">
              🎉 Félicitations ! Tu as gagné un rôle (niveau {result.tier}). Il te sera attribué sur Discord sous peu.
            </p>
          ) : (
            <p className="text-lg text-sayuri-dark/90">
              Pas de rôle cette fois. Reviens quand tu auras plus de Sayucoins !
            </p>
          )}
          <p className="mt-2 text-sayuri-dark/80">
            Solde actuel : <strong>{result.sayucoins}</strong> Sayucoins
          </p>
        </div>
      )}
    </div>
  );
}
