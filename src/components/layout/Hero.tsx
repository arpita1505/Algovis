'use client'
import { motion } from 'framer-motion'

type Section = 'home' | 'sorting' | 'graph' | 'tree' | 'search' | 'compare' | 'dashboard'

const cards = [
  { id: 'sorting'   as Section, icon: '▦', title: 'Sorting',   desc: 'Bubble · Merge · Quick · Heap',    color: '#00d4ff' },
  { id: 'graph'     as Section, icon: '◎', title: 'Graph',     desc: 'BFS · DFS · Dijkstra',             color: '#7c3aed' },
  { id: 'tree'      as Section, icon: '⟁', title: 'Tree',      desc: 'BST · Insert · Delete · Search',   color: '#00ff88' },
  { id: 'search'    as Section, icon: '⌕', title: 'Search',    desc: 'Binary Search · Linear Search',    color: '#ffb800' },
  { id: 'compare'   as Section, icon: '⇌', title: 'Compare',   desc: 'Race algorithms side by side',     color: '#ff2d78' },
  { id: 'dashboard' as Section, icon: '▤', title: 'Dashboard', desc: 'Track your progress & weak spots', color: '#ff4466' },
]

export default function Hero({ setActive }: { setActive: (s: Section) => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16">
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00d4ff08 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed08 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16 max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-6"
          style={{ background: '#00d4ff0a', border: '1px solid #00d4ff22', color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Interactive · Visual · Educational
        </div>

        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight"
          style={{ fontFamily: 'Syne, sans-serif' }}>
          <span style={{ color: '#e8e8f0' }}>Learn </span>
          <span style={{ color: '#00d4ff', textShadow: '0 0 20px #00d4ff66' }}>Algorithms</span>
          <br />
          <span style={{ color: '#e8e8f0' }}>by </span>
          <span style={{ color: '#7c3aed', textShadow: '0 0 20px #7c3aed66' }}>Seeing</span>
          <span style={{ color: '#e8e8f0' }}> Them</span>
        </h1>

        <p className="text-lg mb-8 max-w-xl mx-auto"
          style={{ color: '#888', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.7 }}>
          Step through every comparison, swap, and traversal in real time.
          Built for students who want to truly understand DSA.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActive('sorting')}
            className="btn btn-primary px-8 py-3 text-base"
            style={{ borderRadius: '12px' }}
          >
            Start Visualizing →
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActive('compare')}
            className="btn btn-violet px-8 py-3 text-base"
            style={{ borderRadius: '12px' }}
          >
            ⇌ Compare Algorithms
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl"
      >
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.3 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActive(card.id)}
            className="glass-card p-6 text-left cursor-pointer"
            style={{ border: `1px solid ${card.color}22` }}
          >
            <div className="text-3xl mb-3" style={{ color: card.color }}>{card.icon}</div>
            <div className="text-base font-semibold mb-1"
              style={{ fontFamily: 'Syne, sans-serif', color: '#e8e8f0' }}>
              {card.title}
            </div>
            <div className="text-xs" style={{ color: '#666' }}>{card.desc}</div>
            <div className="mt-4 text-xs font-medium"
              style={{ color: card.color, fontFamily: 'JetBrains Mono, monospace' }}>
              Open →
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex items-center gap-8 mt-16 flex-wrap justify-center"
      >
        {[
          { val: '10+',          label: 'Algorithms' },
          { val: 'Real-time',    label: 'Step Control' },
          { val: 'Side-by-side', label: 'Compare Mode' },
          { val: '100%',         label: 'Free & Open' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-xl font-bold"
              style={{ fontFamily: 'Syne, sans-serif', color: '#00d4ff', textShadow: '0 0 20px #00d4ff66' }}>{s.val}</div>
            <div className="text-xs mt-1" style={{ color: '#555' }}>{s.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
