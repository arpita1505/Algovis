'use client'
import { motion } from 'framer-motion'

type Section = 'home' | 'sorting' | 'graph' | 'tree' | 'search' | 'compare' | 'dashboard' | 'problems'

const cards = [
  { id: 'sorting'   as Section, title: 'Sorting',   desc: 'Bubble · Merge · Quick · Heap',  tag: 'Step-by-step animation',  icon: '⟤' },
  { id: 'graph'     as Section, title: 'Graph',     desc: 'BFS · DFS · Dijkstra',           tag: 'Custom graph builder',    icon: '◎' },
  { id: 'tree'      as Section, title: 'BST',       desc: 'Insert · Delete · Search',       tag: 'Balance indicator',       icon: '⋔' },
  { id: 'search'    as Section, title: 'Search',    desc: 'Binary · Linear',                tag: 'Live complexity compare', icon: '⌕' },
  { id: 'compare'   as Section, title: 'Race Mode', desc: 'Two algorithms, same array',     tag: 'See who wins',            icon: '⇌' },
  { id: 'dashboard' as Section, title: 'Reference', desc: 'Complexity charts · Tips',       tag: 'Interview prep guide',    icon: '▤' },
]

export default function Hero({ setActive }: { setActive: (s: Section) => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 relative">
      <div className="hero-blob-1" />
      <div className="hero-blob-2" />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }} className="text-center mb-14 max-w-2xl relative z-10">

        {/* Heading */}
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: '1.25rem', letterSpacing: '-0.04em', fontWeight: 700 }}>
          The visual way to
          <br />
          <span style={{ color: 'var(--accent-primary)' }}>master algorithms</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text-muted)', fontFamily: 'Inter', maxWidth: '420px', margin: '0 auto 2.5rem', fontWeight: 400 }}>
          Watch every comparison, swap and traversal in real time.
          10+ algorithms, custom inputs, step-by-step controls.
        </motion.p>

        {/* CTA buttons */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 flex-wrap">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setActive('sorting')}
            style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 28px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter', boxShadow: '0 4px 14px rgba(37,99,235,0.3)', letterSpacing: '-0.01em' }}>
            Start visualizing →
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setActive('compare')}
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '11px 28px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter', letterSpacing: '-0.01em' }}>
            ⇌ Race algorithms
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Cards */}
      <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-3xl relative z-10">
        {cards.map((card, i) => (
          <motion.button key={card.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 * i + 0.25 }}
            whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(37,99,235,0.12)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActive(card.id)}
            className="glass-card p-5 text-left cursor-pointer">
            <div className="text-xl mb-3" style={{ color: 'var(--accent-primary)' }}>{card.icon}</div>
            <div className="text-sm font-semibold mb-1 tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Inter', letterSpacing: '-0.02em' }}>
              {card.title}
            </div>
            <div className="text-xs mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>
              {card.desc}
            </div>
            <div className="tag">{card.tag}</div>
          </motion.button>
        ))}
      </motion.div>

    </div>
  )
}
