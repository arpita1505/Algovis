'use client'
import { motion } from 'framer-motion'

type Section = 'home' | 'sorting' | 'graph' | 'tree' | 'search' | 'compare' | 'dashboard'

const links: { id: Section; label: string; icon: string }[] = [
  { id: 'home',      label: 'Home',      icon: '⌂' },
  { id: 'sorting',   label: 'Sorting',   icon: '▦' },
  { id: 'graph',     label: 'Graph',     icon: '◎' },
  { id: 'tree',      label: 'Tree',      icon: '⟁' },
  { id: 'search',    label: 'Search',    icon: '⌕' },
  { id: 'compare',   label: 'Compare',   icon: '⇌' },
  { id: 'dashboard', label: 'Dashboard', icon: '▤' },
]

export default function Navbar({
  active,
  setActive,
}: {
  active: Section
  setActive: (s: Section) => void
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
      style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setActive('home')}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #00d4ff22, #7c3aed22)', border: '1px solid #00d4ff44', color: '#00d4ff', fontFamily: 'Syne, sans-serif' }}>
          AV
        </div>
        <span className="text-lg font-bold"
          style={{ fontFamily: 'Syne, sans-serif', color: '#00d4ff', textShadow: '0 0 20px #00d4ff66' }}>
          AlgoVis
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="hidden md:flex items-center gap-1"
      >
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => setActive(link.id)}
            className="relative px-4 py-2 rounded-lg text-sm transition-all duration-200"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              color: active === link.id ? '#00d4ff' : '#888',
              background: active === link.id ? '#00d4ff11' : 'transparent',
            }}
          >
            {active === link.id && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 rounded-lg"
                style={{ background: '#00d4ff11', border: '1px solid #00d4ff33' }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span>{link.icon}</span>
              {link.label}
            </span>
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xs px-3 py-1.5 rounded-full"
        style={{ background: '#00ff8811', border: '1px solid #00ff8833', color: '#00ff88', fontFamily: 'JetBrains Mono, monospace' }}
      >
        v1.0 live
      </motion.div>
    </nav>
  )
}
