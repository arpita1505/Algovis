'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'

type Section = 'home' | 'sorting' | 'graph' | 'tree' | 'search' | 'compare' | 'dashboard' | 'problems'

const links: { id: Section; label: string }[] = [
  { id: 'home',      label: 'Home'      },
  { id: 'sorting',   label: 'Sorting'   },
  { id: 'graph',     label: 'Graph'     },
  { id: 'tree',      label: 'Tree'      },
  { id: 'search',    label: 'Search'    },
  { id: 'compare',   label: 'Race'      },
  { id: 'dashboard', label: 'Reference' },
  { id: 'problems',   label: 'Problems'  },
]

export default function Navbar({ active, setActive }: { active: Section; setActive: (s: Section) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.body.classList.toggle('dark')
  }

  const handleNav = (id: Section) => {
    setActive(id)
    setMenuOpen(false)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50"
        style={{ backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">

          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('home')}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #2563eb, #0284c7)', fontFamily: 'Inter', letterSpacing: '-0.02em' }}>
              AV
            </div>
            <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Inter' }}>
              AlgoVis
            </span>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="hidden md:flex items-center gap-0.5">
            {links.map(link => (
              <button key={link.id} onClick={() => handleNav(link.id)}
                className="relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ color: active === link.id ? 'var(--accent-primary)' : 'var(--text-muted)', background: active === link.id ? 'var(--highlight)' : 'transparent', fontFamily: 'Inter' }}>
                {active === link.id && (
                  <motion.div layoutId="nav-pill" className="absolute inset-0 rounded-lg"
                    style={{ background: 'var(--highlight)', border: '1px solid var(--border)' }}
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }} />
                )}
                <span className="relative z-10">{link.label}</span>
              </button>
            ))}
          </motion.div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
              style={{ background: 'var(--highlight)', border: '1px solid var(--border)', color: 'var(--accent-primary)', fontFamily: 'Inter', fontWeight: 500 }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-green)' }} />
              v1.0
            </div>
            <button onClick={toggleTheme} className="px-2.5 py-1.5 rounded-lg text-sm transition-all"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer' }}>
              {isDark ? '☀️' : '🌙'}
            </button>
            <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)}>
              <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }} className="block w-4 h-px" style={{ background: 'var(--text-primary)' }} />
              <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} className="block w-4 h-px" style={{ background: 'var(--text-primary)' }} />
              <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }} className="block w-4 h-px" style={{ background: 'var(--text-primary)' }} />
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="fixed top-13 left-0 right-0 z-40 md:hidden"
          style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-subtle)' }}>
          {links.map((link, i) => (
            <motion.button key={link.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }} onClick={() => handleNav(link.id)}
              className="w-full flex items-center justify-between px-6 py-3.5 text-left text-sm"
              style={{ borderBottom: '1px solid var(--border-subtle)', color: active === link.id ? 'var(--accent-primary)' : 'var(--text-muted)', background: active === link.id ? 'var(--highlight)' : 'transparent', fontFamily: 'Inter', fontWeight: active === link.id ? '500' : '400' }}>
              <span>{link.label}</span>
              {active === link.id && <span style={{ color: 'var(--accent-primary)', fontSize: '10px' }}>●</span>}
            </motion.button>
          ))}
        </motion.div>
      )}
    </>
  )
}
