import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Sayuri Games',
  description: 'Joue, gagne des Sayucoins et monte dans le classement ! Rejoins le serveur Discord.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-sayuri-hero min-h-screen">
        <div className="bg-sayuri-overlay min-h-screen">
          <SessionProvider>
            <Header />
            <main className="container mx-auto px-4 pb-12">{children}</main>
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
