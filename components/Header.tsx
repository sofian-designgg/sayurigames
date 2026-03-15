'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

const DISCORD_INVITE = 'https://discord.gg/sayuri';

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 glass-panel mx-4 mt-4 flex items-center justify-between px-6 py-4">
      <Link href="/" className="text-2xl font-bold text-sayuri-dark drop-shadow-sm">
        🌸 Sayuri Games
      </Link>
      <nav className="flex items-center gap-4">
        <Link href="/games" className="text-sayuri-dark font-medium hover:underline">
          Jeux
        </Link>
        <Link href="/ranking" className="text-sayuri-dark font-medium hover:underline">
          Classement
        </Link>
        <Link href="/roulette" className="text-sayuri-dark font-medium hover:underline">
          Roulette
        </Link>
        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="link-discord"
        >
          Rejoindre Discord
        </a>
        {status === 'loading' ? (
          <span className="text-sayuri-dark/70">Chargement...</span>
        ) : session ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-sayuri-dark">
              {session.user?.name}
            </span>
            <button
              onClick={() => signOut()}
              className="rounded-lg bg-white/80 px-3 py-1.5 text-sm font-medium text-sayuri-dark hover:bg-white"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <button onClick={() => signIn('discord')} className="btn-sayuri">
            Connexion Discord
          </button>
        )}
      </nav>
    </header>
  );
}
