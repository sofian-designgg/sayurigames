import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl py-12 text-center">
      <h1 className="mb-4 text-5xl font-bold text-sayuri-dark drop-shadow-sm md:text-6xl">
        🌸 Sayuri Games
      </h1>
      <p className="mb-8 text-lg text-sayuri-dark/90">
        Connecte-toi avec Discord, joue à des jeux, gagne des Sayucoins et monte dans le classement.
        Tente ta chance à la roulette pour gagner des rôles exclusifs !
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/games" className="btn-sayuri">
          Jouer aux jeux
        </Link>
        <Link href="/roulette" className="rounded-xl border-2 border-sayuri-dark bg-white/80 px-6 py-3 font-bold text-sayuri-dark transition hover:scale-105 hover:bg-white">
          Roulette (1000 Sayucoins)
        </Link>
        <Link href="/ranking" className="rounded-xl border-2 border-sayuri-manga bg-white/80 px-6 py-3 font-bold text-sayuri-manga transition hover:scale-105 hover:bg-white">
          Voir le classement
        </Link>
      </div>
      <p className="mt-12 text-sayuri-dark/80">
        Le classement est mis à jour toutes les heures sur le serveur Discord.
      </p>
      <a
        href="https://discord.gg/sayuri"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block link-discord"
      >
        discord.gg/sayuri
      </a>
    </div>
  );
}
