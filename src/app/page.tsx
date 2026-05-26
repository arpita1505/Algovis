'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/layout/Hero'
import SortingVisualizer from '@/components/visualizers/SortingVisualizer'
import GraphVisualizer from '@/components/visualizers/GraphVisualizer'
import TreeVisualizer from '@/components/visualizers/TreeVisualizer'
import SearchVisualizer from '@/components/visualizers/SearchVisualizer'
import CompareMode from '@/components/visualizers/CompareMode'
import Dashboard from '@/components/ui/Dashboard'

type Section = 'home' | 'sorting' | 'graph' | 'tree' | 'search' | 'compare' | 'dashboard'

export default function Home() {
  const [active, setActive] = useState<Section>('home')
  return (
    <main className="min-h-screen" style={{background:'#0a0a0f'}}>
      <Navbar active={active} setActive={setActive} />
      {active === 'home'      && <Hero setActive={setActive} />}
      {active === 'sorting'   && <SortingVisualizer />}
      {active === 'graph'     && <GraphVisualizer />}
      {active === 'tree'      && <TreeVisualizer />}
      {active === 'search'    && <SearchVisualizer />}
      {active === 'compare'   && <CompareMode />}
      {active === 'dashboard' && <Dashboard />}
    </main>
  )
}
