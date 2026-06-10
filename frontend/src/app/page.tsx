'use client';
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
