import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Search Helix', description: 'Infrastructure de recherche' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] antialiased">{children}</body>
    </html>
  );
}
