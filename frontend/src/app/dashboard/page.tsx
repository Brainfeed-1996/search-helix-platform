'use client';
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
            <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className={`rounded-2xl border border-white/10 bg-gradient-to-br ${item.color} p-6 backdrop-blur-sm`}>
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
