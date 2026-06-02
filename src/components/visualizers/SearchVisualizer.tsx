'use client'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

type CellState = 'default' | 'searching' | 'found' | 'eliminated' | 'low' | 'high' | 'mid'

interface Cell { value: number; state: CellState; index: number }

function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

function randomSortedArray(size: number): Cell[] {
  const arr: number[] = []
  let val = Math.floor(Math.random() * 10) + 1
  for (let i = 0; i < size; i++) {
    arr.push(val)
    val += Math.floor(Math.random() * 15) + 1
  }
  return arr.map((v, i) => ({ value: v, state: 'default', index: i }))
}

function randomUnsortedArray(size: number): Cell[] {
  return Array.from({ length: size }, (_, i) => ({
    value: Math.floor(Math.random() * 99) + 1,
    state: 'default' as CellState,
    index: i
  }))
}

function getCellColor(state: CellState) {
  if (state === 'searching')  return { bg: '#ffb80022', border: '#ffb800', text: '#ffb800' }
  if (state === 'found')      return { bg: '#00ff8833', border: '#00ff88', text: '#00ff88' }
  if (state === 'eliminated') return { bg: '#ffffff05', border: 'var(--border)', text: 'var(--text-faint)' }
  if (state === 'low')        return { bg: '#00d4ff22', border: '#00d4ff', text: '#00d4ff' }
  if (state === 'high')       return { bg: '#ff446622', border: '#ff4466', text: '#ff4466' }
  if (state === 'mid')        return { bg: '#7c3aed33', border: '#7c3aed', text: '#a78bfa' }
  return { bg: 'var(--bg-card)', border: 'var(--border)', text: 'var(--text-muted)' }
}

export default function SearchVisualizer() {
  const [cells, setCells] = useState<Cell[]>(() => randomSortedArray(20))
  const [algorithm, setAlgorithm] = useState<'binary' | 'linear'>('binary')
  const [target, setTarget] = useState('')
  const [customInput, setCustomInput] = useState('')
  const [customError, setCustomError] = useState('')
  const [speed, setSpeed] = useState(50)
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState('')
  const [steps, setSteps] = useState(0)
  const [arraySize, setArraySize] = useState(20)
  const stopRef = useRef(false)

  const delay = () => Math.max(100, 800 - speed * 7)

  const update = (arr: Cell[]) => setCells([...arr])

  const resetCells = () => {
    stopRef.current = true
    setRunning(false); setStatus(''); setSteps(0)
    setTimeout(() => {
      stopRef.current = false
      setCells(algorithm === 'binary' ? randomSortedArray(arraySize) : randomUnsortedArray(arraySize))
    }, 100)
  }

  const applyCustom = () => {
    const nums = customInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    if (nums.length < 2) { setCustomError('Enter at least 2 numbers'); return }
    if (nums.length > 40) { setCustomError('Max 40 numbers'); return }
    setCustomError('')
    const sorted = algorithm === 'binary' ? [...nums].sort((a,b) => a-b) : nums
    setCells(sorted.map((v,i) => ({ value: v, state: 'default', index: i })))
    setStatus(algorithm === 'binary' ? 'Custom array applied (sorted for binary search)' : 'Custom array applied')
    setSteps(0)
  }

  async function linearSearch(arr: Cell[], t: number) {
    let s = 0
    for (let i = 0; i < arr.length; i++) {
      if (stopRef.current) return
      arr[i].state = 'searching'; update(arr)
      s++; setSteps(s)
      setStatus('Checking index ' + i + ' — value is ' + arr[i].value + (arr[i].value === t ? ' — MATCH!' : ' — not ' + t))
      await sleep(delay())
      if (arr[i].value === t) {
        arr[i].state = 'found'; update(arr)
        setStatus('✓ Found ' + t + ' at index ' + i + ' in ' + s + ' steps!')
        return
      }
      arr[i].state = 'eliminated'; update(arr)
    }
    setStatus('✗ ' + t + ' not found — checked all ' + arr.length + ' elements (' + s + ' steps)')
  }

  async function binarySearch(arr: Cell[], t: number) {
    let lo = 0, hi = arr.length - 1, s = 0
    arr.forEach(c => c.state = 'default'); update(arr)
    while (lo <= hi) {
      if (stopRef.current) return
      const mid = Math.floor((lo + hi) / 2)
      s++; setSteps(s)
      // Mark low, mid, high
      arr.forEach((c, i) => {
        if (i < lo || i > hi) c.state = 'eliminated'
        else if (i === lo) c.state = 'low'
        else if (i === hi) c.state = 'high'
        else c.state = 'default'
      })
      arr[mid].state = 'mid'; update(arr)
      setStatus('Low=' + lo + ' Mid=' + mid + ' High=' + hi + ' — checking arr[' + mid + ']=' + arr[mid].value)
      await sleep(delay())
      if (arr[mid].value === t) {
        arr[mid].state = 'found'; update(arr)
        setStatus('✓ Found ' + t + ' at index ' + mid + ' in just ' + s + ' steps! (Binary search is O(log n))')
        return
      } else if (arr[mid].value < t) {
        setStatus(arr[mid].value + ' < ' + t + ' — target is in RIGHT half → lo = ' + (mid+1))
        await sleep(delay())
        lo = mid + 1
      } else {
        setStatus(arr[mid].value + ' > ' + t + ' — target is in LEFT half → hi = ' + (mid-1))
        await sleep(delay())
        hi = mid - 1
      }
    }
    arr.forEach(c => { if (c.state !== 'eliminated') c.state = 'default' })
    update(arr)
    setStatus('✗ ' + t + ' not found in ' + s + ' steps (searched entire array!)')
  }

  const startSearch = async () => {
    const t = parseInt(target)
    if (isNaN(t)) { setStatus('Enter a valid number to search'); return }
    if (running) return
    setRunning(true); stopRef.current = false; setSteps(0)
    const arr = cells.map(c => ({ ...c, state: 'default' as CellState }))
    if (algorithm === 'linear') await linearSearch(arr, t)
    else await binarySearch(arr, t)
    setRunning(false)
  }

  const switchAlgorithm = (algo: 'binary' | 'linear') => {
    if (running) return
    setAlgorithm(algo)
    setStatus(''); setSteps(0)
    setCells(algo === 'binary' ? randomSortedArray(arraySize) : randomUnsortedArray(arraySize))
  }

  const pickRandomTarget = () => {
    if (cells.length === 0) return
    const idx = Math.floor(Math.random() * cells.length)
    setTarget(String(cells[idx].value))
  }

  return (
    <div className="min-h-screen pt-20 px-6 pb-10">
      <div className="max-w-6xl mx-auto">

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-8">
          <h1 className="text-2xl font-semibold mb-2" style={{fontFamily:'Inter, sans-serif',color:'var(--text-primary)'}}>⌕ Search Visualizer</h1>
          <p className="text-sm" style={{color:'var(--text-muted)'}}>See exactly how Binary Search eliminates half the array each step vs Linear Search checking one by one</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {([
            {id:'binary', label:'Binary Search', time:'O(log n)', desc:'Array must be sorted. Eliminates half each step.'},
            {id:'linear', label:'Linear Search', time:'O(n)',     desc:'Works on any array. Checks every element.'},
          ] as {id:'binary'|'linear',label:string,time:string,desc:string}[]).map(a => (
            <button key={a.id} onClick={()=>switchAlgorithm(a.id)}
              className="glass-card p-4 text-left transition-all"
              style={{border:algorithm===a.id?'1px solid #00d4ff44':'1px solid transparent',background:algorithm===a.id?'#00d4ff0a':undefined}}>
              <div className="text-sm font-semibold mb-1" style={{color:algorithm===a.id?'#00d4ff':'var(--text-muted)',fontFamily:'Inter, sans-serif'}}>{a.label}</div>
              <div className="text-xs mb-1" style={{color:'var(--text-faint)',fontFamily:'JetBrains Mono, monospace'}}>{a.time}</div>
              <div className="text-xs" style={{color:'var(--text-faint)'}}>{a.desc}</div>
            </button>
          ))}
        </div>

        <div className="glass-card p-4 mb-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <div className="text-xs mb-2" style={{color:'var(--text-faint)'}}>Search Target</div>
            <div className="flex gap-2">
              <input type="number" value={target} onChange={e=>setTarget(e.target.value)}
                placeholder="Enter number..." disabled={running}
                onKeyDown={e=>e.key==='Enter'&&startSearch()}
                style={{flex:1,padding:'10px 14px',borderRadius:'8px',background:'var(--bg-primary)',
                  border:'1px solid #2a2a3e',color:'var(--text-primary)',fontFamily:'JetBrains Mono, monospace',
                  fontSize:'13px',outline:'none'}} />
              <button onClick={pickRandomTarget} disabled={running} className="btn btn-amber text-xs">🎲 Random</button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={startSearch} disabled={running} className="btn btn-green">{running?'⟳ Searching...':'⌕ Start Search'}</button>
            <button onClick={resetCells} disabled={running} className="btn btn-danger">↺ New Array</button>
          </div>
        </div>

        <div className="glass-card p-4 mb-4">
          <div className="text-sm font-semibold mb-3" style={{color:'var(--text-muted)',fontFamily:'Inter, sans-serif'}}>CUSTOM ARRAY</div>
          <div className="flex gap-2 flex-wrap items-start">
            <div className="flex-1 min-w-48">
              <input type="text" value={customInput} onChange={e=>setCustomInput(e.target.value)}
                placeholder="e.g. 3, 7, 15, 23, 42, 56, 78" disabled={running}
                style={{width:'100%',padding:'10px 14px',borderRadius:'8px',background:'var(--bg-primary)',
                  border:'1px solid #2a2a3e',color:'var(--text-primary)',fontFamily:'JetBrains Mono, monospace',
                  fontSize:'13px',outline:'none'}} />
              {customError && <p className="text-xs mt-1" style={{color:'#ff4466'}}>{customError}</p>}
              {algorithm==='binary' && <p className="text-xs mt-1" style={{color:'var(--text-faint)'}}>Array will be auto-sorted for binary search</p>}
            </div>
            <button onClick={applyCustom} disabled={running} className="btn btn-violet">Apply</button>
          </div>
        </div>

        <div className="glass-card px-4 py-3 mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{background:running?'#00ff88':'var(--text-faint)',boxShadow:running?'0 0 8px #00ff8888':'none'}} />
            <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:'13px',color:status?'var(--text-primary)':'var(--text-faint)'}}>
              {status || 'Enter a target and press Start Search...'}
            </span>
          </div>
          <div className="text-xs flex-shrink-0" style={{color:'var(--text-faint)',fontFamily:'JetBrains Mono, monospace'}}>
            Steps: <span style={{color:'#ffb800'}}>{steps}</span>
          </div>
        </div>

        {(steps > 0 || running) && (
          <div className="glass-card p-4 mb-4">
            <div className="text-xs font-semibold mb-3" style={{color:'var(--text-faint)',fontFamily:'Inter, sans-serif'}}>LIVE COMPLEXITY COMPARISON</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg" style={{background: algorithm==='binary'?'rgba(0,212,255,0.08)':'var(--bg-primary)', border: algorithm==='binary'?'1px solid rgba(0,212,255,0.2)':'1px solid var(--border)'}}>
                <div className="text-xs font-semibold mb-2" style={{color:'var(--accent-primary)'}}>Binary Search — O(log n)</div>
                <div className="text-xl font-semibold" style={{color:'var(--accent-green)',fontFamily:'JetBrains Mono, monospace'}}>
                  {algorithm==='binary' ? steps : Math.ceil(Math.log2(cells.length))} steps
                </div>
                <div className="text-xs mt-1" style={{color:'var(--text-faint)'}}>Max possible: {Math.ceil(Math.log2(cells.length))} steps</div>
                <div className="mt-2 h-1.5 rounded-full" style={{background:'var(--border)'}}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: Math.min(100, ((algorithm==='binary'?steps:0) / Math.ceil(Math.log2(cells.length)))*100)+'%',
                    background:'var(--accent-cyan)'
                  }} />
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{background: algorithm==='linear'?'rgba(255,68,102,0.08)':'var(--bg-primary)', border: algorithm==='linear'?'1px solid rgba(255,68,102,0.2)':'1px solid var(--border)'}}>
                <div className="text-xs font-semibold mb-2" style={{color:'var(--accent-red)'}}>Linear Search — O(n)</div>
                <div className="text-xl font-semibold" style={{color:'var(--accent-amber)',fontFamily:'JetBrains Mono, monospace'}}>
                  {algorithm==='linear' ? steps : cells.length} steps
                </div>
                <div className="text-xs mt-1" style={{color:'var(--text-faint)'}}>Max possible: {cells.length} steps</div>
                <div className="mt-2 h-1.5 rounded-full" style={{background:'var(--border)'}}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: Math.min(100, ((algorithm==='linear'?steps:0) / cells.length)*100)+'%',
                    background:'var(--accent-red)'
                  }} />
                </div>
              </div>
            </div>
            {steps > 0 && (
              <div className="mt-3 text-xs text-center" style={{color:'var(--text-muted)'}}>
                Binary Search would solve this in <span style={{color:'var(--accent-green)',fontWeight:'bold'}}>{Math.ceil(Math.log2(cells.length))} steps</span> vs Linear Search worst case of <span style={{color:'var(--accent-red)',fontWeight:'bold'}}>{cells.length} steps</span> — that is <span style={{color:'var(--accent-primary)',fontWeight:'bold'}}>{Math.round(cells.length/Math.ceil(Math.log2(cells.length)))}x faster!</span>
              </div>
            )}
          </div>
        )}

        <div className="glass-card p-6 mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {cells.map((cell, i) => {
              const colors = getCellColor(cell.state)
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div style={{
                    width: '52px', height: '52px',
                    background: colors.bg,
                    border: '1px solid ' + colors.border,
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px', fontWeight: '600',
                    color: colors.text,
                    transition: 'all 0.2s',
                    boxShadow: cell.state !== 'default' && cell.state !== 'eliminated' ? '0 0 10px ' + colors.border + '44' : 'none',
                  }}>
                    {cell.value}
                  </div>
                  <div style={{fontSize:'10px',color:'var(--text-faint)',fontFamily:'JetBrains Mono, monospace'}}>{i}</div>
                  {cell.state === 'low'  && <div style={{fontSize:'9px',color:'#00d4ff'}}>LOW</div>}
                  {cell.state === 'high' && <div style={{fontSize:'9px',color:'#ff4466'}}>HIGH</div>}
                  {cell.state === 'mid'  && <div style={{fontSize:'9px',color:'#a78bfa'}}>MID</div>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          {(algorithm === 'binary'
            ? [{c:'#00d4ff',lb:'Low pointer'},{c:'#7c3aed',lb:'Mid — being checked'},{c:'#ff4466',lb:'High pointer'},
               {c:'#ffffff22',lb:'Eliminated half'},{c:'#00ff88',lb:'Found!'}]
            : [{c:'#ffb800',lb:'Currently checking'},{c:'#ffffff22',lb:'Already checked'},{c:'#00ff88',lb:'Found!'}]
          ).map(item => (
            <div key={item.lb} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{background:item.c,boxShadow:'0 0 6px '+item.c+'44'}} />
              <span className="text-xs" style={{color:'var(--text-muted)'}}>{item.lb}</span>
            </div>
          ))}
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-wrap items-center gap-6 mb-4">
            <div className="flex-1 min-w-40">
              <div className="flex justify-between text-xs mb-2" style={{color:'var(--text-muted)'}}>
                <span>Speed</span><span style={{color:'#00d4ff'}}>{speed}%</span>
              </div>
              <input type="range" min="1" max="100" value={speed} onChange={e=>setSpeed(Number(e.target.value))} disabled={running} />
            </div>
            <div className="flex-1 min-w-40">
              <div className="flex justify-between text-xs mb-2" style={{color:'var(--text-muted)'}}>
                <span>Array Size</span><span style={{color:'#00d4ff'}}>{arraySize}</span>
              </div>
              <input type="range" min="5" max="40" value={arraySize} onChange={e=>setArraySize(Number(e.target.value))} disabled={running} />
            </div>
          </div>
          <div className="glass-card p-4" style={{background:'#0a0a0f11'}}>
            <div className="text-xs font-semibold mb-2" style={{color:'var(--text-faint)'}}>WHY BINARY SEARCH IS FASTER</div>
            <div className="text-xs" style={{color:'var(--text-faint)',lineHeight:1.7}}>
              For an array of <span style={{color:'#00d4ff'}}>{cells.length} elements</span>:
              Linear search worst case = <span style={{color:'#ff4466'}}>{cells.length} steps</span> |
              Binary search worst case = <span style={{color:'#00ff88'}}>{Math.ceil(Math.log2(cells.length))} steps</span> (log₂{cells.length})
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
