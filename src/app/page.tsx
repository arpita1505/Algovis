'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/layout/Hero'
import SortingVisualizer from '@/components/visualizers/SortingVisualizer'
import GraphVisualizer from '@/components/visualizers/GraphVisualizer'
import TreeVisualizer from '@/components/visualizers/TreeVisualizer'
import SearchVisualizer from '@/components/visualizers/SearchVisualizer'
import CompareMode from '@/components/visualizers/CompareMode'
import Dashboard from '@/components/ui/Dashboard'
import Problems from '@/components/ui/Problems'

type Section = 'home' | 'sorting' | 'graph' | 'tree' | 'search' | 'compare' | 'dashboard' | 'problems'

const pageTitles: Record<Section, string> = {
  home:      'AlgoVis — Interactive Algorithm Visualizer',
  sorting:   'AlgoVis — Sorting Visualizer',
  graph:     'AlgoVis — Graph Visualizer',
  tree:      'AlgoVis — BST Visualizer',
  search:    'AlgoVis — Search Visualizer',
  compare:   'AlgoVis — Algorithm Race',
  dashboard: 'AlgoVis — Reference',
  problems:  'AlgoVis — DSA Problems',
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

export default function Home() {
  const [active, setActive] = useState<Section>('home')

  useEffect(() => {
    document.title = pageTitles[active]
  }, [active])

  return (
    <main className="min-h-screen grid-bg" style={{ background: 'var(--bg-primary)' }}>
      <Navbar active={active} setActive={setActive} />
      <AnimatePresence mode="wait">
        <motion.div key={active} variants={pageVariants} initial="initial" animate="animate" exit="exit">
          {active === 'home'      && <Hero setActive={setActive} />}
          {active === 'sorting'   && <SortingVisualizer />}
          {active === 'graph'     && <GraphVisualizer />}
          {active === 'tree'      && <TreeVisualizer />}
          {active === 'search'    && <SearchVisualizer />}
          {active === 'compare'   && <CompareMode />}
          {active === 'dashboard' && <Dashboard />}
          {active === 'problems'  && <Problems />}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
