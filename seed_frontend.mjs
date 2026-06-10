import fs from 'fs';
import path from 'path';

const base = 'C:\\Users\\Olivier Robert-Duboi\\Downloads\\search-helix-main\\search-helix-main';

const files = {};

files['frontend/package.json'] = JSON.stringify({
  name: 'search-helix-frontend',
  version: '0.1.0',
  private: true,
  scripts: {
    dev: 'next dev -p 3000',
    build: 'next build',
    start: 'next start -p 3000',
    lint: 'next lint'
  },
  dependencies: {
    next: '14.2.28',
    react: '18.3.1',
    'react-dom': '18.3.1'
  },
  devDependencies: {
    typescript: '5.7.2',
    '@types/react': '18.3.5',
    '@types/node': '20.11.30',
    tailwindcss: '3.4.17',
    postcss: '8.4.49',
    autoprefixer: '10.4.20',
    eslint: '8.57.0',
    'eslint-config-next': '14.2.6'
  }
}, null, 2);

files['frontend/tsconfig.json'] = JSON.stringify({
  compilerOptions: {
    target: 'ES2022',
    lib: ['dom', 'dom.iterable', 'ES2022'],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: 'ESNext',
    moduleResolution: 'bundler',
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: 'preserve',
    baseUrl: '.',
    paths: { '@/*': ['./src/*'] }
  },
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
  exclude: ['node_modules']
}, null, 2);

files['frontend/next.config.ts'] = `const nextConfig = { reactStrictMode: true };
export default nextConfig;
`;

files['frontend/tailwind.config.ts'] = `module.exports = { content: ['./src/**/*.{ts,tsx}'], theme: { extend: { colors: { brand: { 900: '#0B0F19', 800: '#111827', 700: '#1F2937' } } } }, plugins: [] };
`;

files['frontend/postcss.config.js'] = `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
`;

files['frontend/src/app/globals.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;
:root { --background: #0B0F19; --foreground: #E2E8F0; }
body { font-family: Inter, system-ui, sans-serif; background: var(--background); color: var(--foreground); }
`;

files['frontend/src/app/layout.tsx'] = `import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Search Helix', description: 'Infrastructure de recherche' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] antialiased">{children}</body>
    </html>
  );
}
`;

files['frontend/src/app/page.tsx'] = `'use client';
import { motion } from 'framer-motion';
import { Search, Zap, Shield, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
      <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mx-auto max-w-5xl px-6 pt-28 pb-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white">
          Search <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Helix</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300/90">
          Indexation, ranking et diagnostic de pertinence à haute performance pour des expériences de recherche au niveau des plus grands moteurs.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a href="/dashboard" className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-500">Ouvrir le dashboard</a>
          <a href="/docs" className="rounded-full border border-white/10 px-6 py-3 font-semibold text-slate-200 backdrop-blur transition hover:border-white/20">Documentation</a>
        </div>
      </motion.section>
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mx-auto max-w-6xl px-6 pb-28">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Search className="h-6 w-6" />, title: 'Recherche hybride', desc: 'BM25, synonymes, fuzzy matching, facets et géotemps.' },
            { icon: <Zap className="h-6 w-6" />, title: 'Indexation rapide', desc: 'Pipeline Tantivy optimisé : 100k docs en <30s.' },
            { icon: <Shield className="h-6 w-6" />, title: 'Qualité mesurable', desc: 'Diagnostics temps réel : P95/P99, nDCG, MAP.' },
            { icon: <BarChart3 className="h-6 w-6" />, title: 'Analytics intégrés', desc: 'Traçabilité, A/B testing, relevancy scoring automatique.' },
          ].map((item, idx) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm">
              <div className="mb-3 inline-flex rounded-lg bg-blue-500/10 p-2 text-blue-400">{item.icon}</div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300/80">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </main>
  );
}
`;

files['frontend/src/app/dashboard/page.tsx'] = `'use client';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const cards = [
    { label: 'Documents indexés', value: '128 450', hint: 'index actif', color: 'from-blue-500/20 to-blue-600/20' },
    { label: 'Latence P95', value: '42 ms', hint: 'dernière heure', color: 'from-emerald-500/20 to-emerald-600/20' },
    { label: 'Requêtes / min', value: '1 204', hint: 'moyenne glissante', color: 'from-violet-500/20 to-violet-600/20' },
  ];
  return (
    <main className="min-h-screen bg-[#0B0F19] text-[#E2E8F0]">
      <header className="border-b border-white/10 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Dashboard — Search Helix</h1>
          <span className="text-slate-300/80 text-sm">Statut: opérationnel</span>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((item, idx) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className={\`rounded-2xl border border-white/10 bg-gradient-to-br \${item.color} p-6 backdrop-blur-sm\`}>
              <p className="text-sm text-slate-300/80">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
              <p className="mt-1 text-xs text-slate-400">{item.hint}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white">Test de recherche</h2>
          <form className="mt-4 flex gap-3" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Rechercher dans l'index..." className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-blue-500/60" />
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500">Rechercher</button>
          </form>
        </div>
      </section>
    </main>
  );
}
`;

let created = 0;
for (const [rel, content] of Object.entries(files)) {
  const full = path.join(base, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  created++;
}
console.log(`Wrote ${created} frontend files.`);
