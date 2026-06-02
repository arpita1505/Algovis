'use client'
import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

type BarState = 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot'
interface Bar { value: number; display: number; state: BarState }
type Algorithm = 'bubble' | 'merge' | 'quick' | 'heap'

function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }
function randomArray(size: number): Bar[] {
  return Array.from({ length: size }, () => {
    const v = Math.floor(Math.random() * 90) + 10
    return { value: v, display: v, state: 'default' as BarState }
  })
}

const algoInfo = {
  bubble: { time: 'O(n²)',      space: 'O(1)',     desc: 'Simple comparison-based sort. Best for learning.' },
  quick:  { time: 'O(n log n)', space: 'O(log n)', desc: 'Divide and conquer with pivot. Fast in practice.' },
  merge:  { time: 'O(n log n)', space: 'O(n)',     desc: 'Stable divide and conquer. Guaranteed performance.' },
  heap:   { time: 'O(n log n)', space: 'O(1)',     desc: 'Uses heap data structure. In-place and efficient.' },
}


const pseudocode: Record<Algorithm, string[]> = {
  bubble: [
    'for i from 0 to n-1:',
    '  for j from 0 to n-i-2:',
    '    if arr[j] > arr[j+1]:',
    '      swap(arr[j], arr[j+1])',
    '  mark arr[n-i-1] as sorted',
  ],
  quick: [
    'quickSort(arr, lo, hi):',
    '  pivot = arr[hi]',
    '  i = lo - 1',
    '  for j from lo to hi-1:',
    '    if arr[j] <= pivot:',
    '      i++; swap(arr[i], arr[j])',
    '  swap(arr[i+1], arr[hi])',
    '  recurse left and right halves',
  ],
  merge: [
    'mergeSort(arr, l, r):',
    '  if l >= r: return',
    '  mid = (l + r) / 2',
    '  mergeSort(arr, l, mid)',
    '  mergeSort(arr, mid+1, r)',
    '  merge(arr, l, mid, r)',
    '  compare and place elements',
  ],
  heap: [
    'heapSort(arr):',
    '  build max heap from arr',
    '  for i from n-1 to 1:',
    '    swap(arr[0], arr[i])',
    '    heapify(arr, i, 0)',
    '  heapify: find largest child',
    '  swap if parent < child',
  ],
}

function getBarColor(state: BarState) {
  if (state === 'comparing') return '#ffb800'
  if (state === 'swapping')  return '#ff4466'
  if (state === 'sorted')    return '#00ff88'
  if (state === 'pivot')     return '#7c3aed'
  return '#00d4ff'
}

export default function SortingVisualizer() {
  const [bars, setBars] = useState<Bar[]>(() => randomArray(20))
  const [algorithm, setAlgorithm] = useState<Algorithm>('bubble')
  const [speed, setSpeed] = useState(50)
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [stepMode, setStepMode] = useState(false)
  const [stepReady, setStepReady] = useState(false)
  const stepRef = useRef(false)
  const [comparisons, setComparisons] = useState(0)
  const [swaps, setSwaps] = useState(0)
  const [arraySize, setArraySize] = useState(20)
  const [customInput, setCustomInput] = useState('')
  const [customError, setCustomError] = useState('')
  const [status, setStatus] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [tooltip, setTooltip] = useState<{x:number,y:number,bar:any}|null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const pausedRef = useRef(false)
  const stopRef = useRef(false)
  const stepResolveRef = useRef<(() => void) | null>(null)

  const showValues = bars.length <= 30
  const getDelay = () => Math.max(5, 200 - speed * 1.9)

  const waitIfPaused = async () => {
    while (pausedRef.current) {
      await sleep(100)
      if (stopRef.current) return
    }
  }

  const waitForStep = async () => {
    if (!stepMode) return
    await new Promise<void>(resolve => {
      stepResolveRef.current = resolve
    })
  }

  const doStep = () => {
    if (stepResolveRef.current) {
      stepResolveRef.current()
      stepResolveRef.current = null
    }
  }

  const reset = useCallback(() => {
    stopRef.current = true
    pausedRef.current = false
    setPaused(false); setRunning(false)
    setComparisons(0); setSwaps(0); setStatus(''); setHistory([])
    setTimeout(() => { stopRef.current = false; setBars(randomArray(arraySize)) }, 100)
  }, [arraySize])

  const applyCustomArray = () => {
    const nums = customInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    if (nums.length < 2) { setCustomError('Enter at least 2 numbers separated by commas'); return }
    if (nums.length > 80) { setCustomError('Max 80 numbers allowed'); return }
    if (nums.some(n => n < 1 || n > 999)) { setCustomError('Numbers must be between 1 and 999'); return }
    setCustomError('')
    const max = Math.max(...nums)
    setBars(nums.map(v => ({ value: Math.round((v / max) * 95) + 5, display: v, state: 'default' as BarState })))
    setArraySize(nums.length); setComparisons(0); setSwaps(0); setStatus('')
  }

  const update = (arr: Bar[]) => setBars([...arr])
  const addLog = (msg: string) => setHistory(prev => [msg, ...prev].slice(0, 100))

  async function bubbleSort(arr: Bar[]) {
    let c = 0, s = 0
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (stopRef.current) return
        await waitIfPaused()
        arr[j].state = 'comparing'; arr[j+1].state = 'comparing'
        addLog('Compare arr['+j+']='+arr[j].display+' vs arr['+(j+1)+']='+arr[j+1].display)
        setStatus('Comparing ' + arr[j].display + ' and ' + arr[j+1].display)
        update(arr); c++; setComparisons(c)
        await sleep(getDelay())
        if (arr[j].value > arr[j+1].value) {
          setStatus('Swapping ' + arr[j].display + ' and ' + arr[j+1].display + ' (wrong order!)')
          ;[arr[j], arr[j+1]] = [arr[j+1], arr[j]]
          s++; setSwaps(s)
          addLog('  → SWAP arr['+j+']='+arr[j].display+' ↔ arr['+(j+1)+']='+arr[j+1].display)
          arr[j].state = 'swapping'; arr[j+1].state = 'swapping'; update(arr)
          await sleep(getDelay())
        } else {
          setStatus('No swap needed — ' + arr[j].display + ' < ' + arr[j+1].display)
        }
        arr[j].state = 'default'; arr[j+1].state = 'default'
      }
      arr[arr.length - i - 1].state = 'sorted'; update(arr)
    }
    setStatus('Sorted!')
  }

  async function quickSort(arr: Bar[], lo: number, hi: number, s: {v:number}, c: {v:number}) {
    if (lo >= hi || stopRef.current) return
    const pivot = arr[hi]; pivot.state = 'pivot'
    setStatus('Pivot selected: ' + pivot.display)
    update(arr)
    let i = lo - 1
    for (let j = lo; j < hi; j++) {
      if (stopRef.current) return
      await waitIfPaused()
      arr[j].state = 'comparing'
      setStatus('Comparing ' + arr[j].display + ' with pivot ' + pivot.display)
      update(arr); c.v++; setComparisons(c.v)
      await sleep(getDelay())
      if (arr[j].value <= pivot.value) {
        i++; [arr[i], arr[j]] = [arr[j], arr[i]]
        s.v++; setSwaps(s.v)
        setStatus(arr[i].display + ' <= pivot, moving left')
        arr[i].state = 'swapping'; update(arr)
        await sleep(getDelay())
        arr[i].state = 'default'
      }
      arr[j].state = 'default'
    }
    ;[arr[i+1], arr[hi]] = [arr[hi], arr[i+1]]
    arr[i+1].state = 'sorted'; pivot.state = 'default'; update(arr)
    await quickSort(arr, lo, i, s, c)
    await quickSort(arr, i+2, hi, s, c)
  }

  async function merge(arr: Bar[], l: number, m: number, r: number, s: {v:number}, c: {v:number}) {
    const L = arr.slice(l, m+1).map(b => ({...b}))
    const R = arr.slice(m+1, r+1).map(b => ({...b}))
    let i = 0, j = 0, k = l
    while (i < L.length && j < R.length) {
      if (stopRef.current) return
      await waitIfPaused()
      c.v++; setComparisons(c.v)
      setStatus('Merging — comparing ' + L[i].display + ' and ' + R[j].display)
      if (L[i].value <= R[j].value) {
        arr[k] = {...L[i], state: 'swapping'}; i++
      } else {
        arr[k] = {...R[j], state: 'swapping'}; j++
      }
      s.v++; setSwaps(s.v); update(arr)
      await sleep(getDelay())
      arr[k].state = 'default'; k++
    }
    while (i < L.length) { arr[k++] = {...L[i++], state: 'sorted'}; update(arr); await sleep(getDelay()/2) }
    while (j < R.length) { arr[k++] = {...R[j++], state: 'sorted'}; update(arr); await sleep(getDelay()/2) }
  }

  async function mergeSort(arr: Bar[], l: number, r: number, s: {v:number}, c: {v:number}) {
    if (l >= r || stopRef.current) return
    const m = Math.floor((l+r)/2)
    await mergeSort(arr, l, m, s, c)
    await mergeSort(arr, m+1, r, s, c)
    await merge(arr, l, m, r, s, c)
  }

  async function heapify(arr: Bar[], n: number, i: number, s: {v:number}, c: {v:number}) {
    if (stopRef.current) return
    await waitIfPaused()
    let largest = i
    const l = 2*i+1, r = 2*i+2
    if (l < n) { c.v++; setComparisons(c.v); if (arr[l].value > arr[largest].value) largest = l }
    if (r < n) { c.v++; setComparisons(c.v); if (arr[r].value > arr[largest].value) largest = r }
    if (largest !== i) {
      setStatus('Heapify — swapping ' + arr[i].display + ' and ' + arr[largest].display)
      arr[i].state = 'comparing'; arr[largest].state = 'swapping'; update(arr)
      await sleep(getDelay())
      ;[arr[i], arr[largest]] = [arr[largest], arr[i]]
      s.v++; setSwaps(s.v)
      arr[i].state = 'default'; arr[largest].state = 'default'; update(arr)
      await heapify(arr, n, largest, s, c)
    }
  }

  async function heapSort(arr: Bar[], s: {v:number}, c: {v:number}) {
    const n = arr.length
    setStatus('Building max heap...')
    for (let i = Math.floor(n/2)-1; i >= 0; i--) await heapify(arr, n, i, s, c)
    for (let i = n-1; i > 0; i--) {
      if (stopRef.current) return
      setStatus('Placing ' + arr[0].display + ' at position ' + i)
      ;[arr[0], arr[i]] = [arr[i], arr[0]]
      arr[i].state = 'sorted'; s.v++; setSwaps(s.v); update(arr)
      await sleep(getDelay())
      await heapify(arr, i, 0, s, c)
    }
    arr[0].state = 'sorted'; update(arr); setStatus('Sorted!')
  }

  const startSort = async () => {
    if (running) return
    setRunning(true); setPaused(false)
    pausedRef.current = false; stopRef.current = false
    setComparisons(0); setSwaps(0)
    setStatus('Starting ' + algorithm + ' sort...')
    const arr = bars.map(b => ({...b, state: 'default' as BarState}))
    const s = {v:0}, c = {v:0}
    if (algorithm === 'bubble') await bubbleSort(arr)
    else if (algorithm === 'quick') await quickSort(arr, 0, arr.length-1, s, c)
    else if (algorithm === 'merge') await mergeSort(arr, 0, arr.length-1, s, c)
    else if (algorithm === 'heap') await heapSort(arr, s, c)
    if (!stopRef.current) { arr.forEach(b => b.state = 'sorted'); update(arr); setStatus('All done! Array is sorted.') }
    setRunning(false)
  }

  const togglePause = () => { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current) }

  return (
    <div className="min-h-screen pt-20 px-6 pb-10">
      <div className="max-w-6xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)' }}>▦ Sorting Visualizer</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Watch algorithms sort in real time — every comparison and swap explained</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {(['bubble','quick','merge','heap'] as Algorithm[]).map(algo => (
            <button key={algo} onClick={() => { if (!running) setAlgorithm(algo) }}
              className="glass-card p-4 text-left transition-all"
              style={{ border: algorithm === algo ? '1px solid #00d4ff44' : '1px solid transparent', background: algorithm === algo ? '#00d4ff0a' : undefined }}>
              <div className="text-sm font-semibold capitalize mb-1" style={{ color: algorithm === algo ? '#00d4ff' : 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>{algo} Sort</div>
              <div className="text-xs" style={{ color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace' }}>{algoInfo[algo].time}</div>
            </button>
          ))}
        </div>

        <div className="glass-card p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div><div className="text-xs mb-1" style={{ color: 'var(--text-faint)' }}>Description</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{algoInfo[algorithm].desc}</div></div>
          <div className="flex gap-6">
            {[{label:'Time', val:algoInfo[algorithm].time, color:'#00d4ff'},
              {label:'Space', val:algoInfo[algorithm].space, color:'#7c3aed'},
              {label:'Comparisons', val:String(comparisons), color:'#ffb800'},
              {label:'Swaps', val:String(swaps), color:'#ff4466'}].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xs mb-1" style={{ color: 'var(--text-faint)' }}>{s.label}</div>
                <div className="text-sm font-bold" style={{ color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card px-4 py-3 mb-4 flex items-center gap-3" style={{ minHeight: '44px' }}>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: running ? '#00ff88' : 'var(--text-faint)', boxShadow: running ? '0 0 8px #00ff8888' : 'none' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: status ? 'var(--text-primary)' : 'var(--text-faint)' }}>
            {status || 'Press Start Sort to begin...'}
          </span>
        </div>

        <div className="glass-card p-4 mb-4">
          <div className="text-xs font-semibold mb-2" style={{color:'var(--text-faint)',fontFamily:'Inter, sans-serif'}}>PSEUDOCODE</div>
          <div className="flex flex-col gap-1">
            {pseudocode[algorithm].map((line, i) => (
              <div key={i} className="text-xs px-3 py-1 rounded"
                style={{
                  fontFamily:'JetBrains Mono, monospace',
                  color: line.trim().startsWith('if') || line.trim().startsWith('for') ? '#ffb800'
                    : line.trim().startsWith('swap') ? '#ff4466'
                    : line.trim().startsWith('//') ? 'var(--text-faint)'
                    : 'var(--text-muted)',
                  background: 'var(--bg-primary)',
                  borderLeft: line.includes('swap') ? '2px solid #ff446644'
                    : line.includes('if') ? '2px solid #ffb80044'
                    : '2px solid transparent',
                }}>
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 mb-4 relative" style={{ height: '360px' }}>
          <div className="flex items-end justify-center gap-0.5 h-full pb-5">
            {bars.map((bar, i) => (
              <div key={i} className="relative flex flex-col items-center justify-end h-full"
                style={{ width: Math.max(2, 100 / bars.length - 0.5) + '%', minWidth: '2px' }}
                onMouseEnter={e => setTooltip({x: e.clientX, y: e.clientY, bar: {...bar, index: i}})}
                onMouseLeave={() => setTooltip(null)}
              >
                {showValues && bars.length <= 30 && (
                  <span style={{
                    position: 'absolute',
                    bottom: 'calc(' + bar.value + '% + 4px)',
                    fontSize: bars.length <= 15 ? '11px' : '9px',
                    color: getBarColor(bar.state),
                    fontFamily: 'JetBrains Mono, monospace',
                    whiteSpace: 'nowrap',
                    transition: 'bottom 0.05s',
                    zIndex: 2,
                  }}>{bar.display}</span>
                )}
                <div style={{
                  height: bar.value + '%',
                  width: '100%',
                  background: getBarColor(bar.state),
                  borderRadius: '2px 2px 0 0',
                  transition: 'height 0.05s, background 0.1s',
                  boxShadow: bar.state !== 'default' ? '0 0 8px ' + getBarColor(bar.state) + '88' : 'none',
                  cursor: 'pointer',
                }} />
                {bars.length <= 20 && (
                  <span style={{
                    position: 'absolute', bottom: '-18px',
                    fontSize: '8px', color: 'var(--text-faint)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{i}</span>
                )}
              </div>
            ))}
          </div>
          {tooltip && (
            <div style={{
              position: 'fixed', left: tooltip.x + 12, top: tooltip.y - 60,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '8px 12px', zIndex: 999,
              fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)', pointerEvents: 'none',
            }}>
              <div style={{color:'var(--text-primary)'}}>Index: <span style={{color:'var(--accent-primary)'}}>{tooltip.bar.index}</span></div>
              <div style={{color:'var(--text-primary)'}}>Value: <span style={{color:'var(--accent-green)'}}>{tooltip.bar.display}</span></div>
              <div style={{color:'var(--text-primary)'}}>State: <span style={{color: getBarColor(tooltip.bar.state)}}>{tooltip.bar.state}</span></div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mb-4 flex-wrap">
          {[{color:'#00d4ff',label:'Unsorted'},{color:'#ffb800',label:'Comparing — deciding if swap needed'},
            {color:'#ff4466',label:'Swapping — wrong order, fixing it'},{color:'#7c3aed',label:'Pivot (QuickSort)'},{color:'#00ff88',label:'Sorted — final position'}].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: l.color, boxShadow: '0 0 6px ' + l.color + '66' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.label}</span>
            </div>
          ))}
        </div>

        <div className="glass-card p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold" style={{color:'var(--text-faint)',fontFamily:'Inter, sans-serif'}}>OPERATION LOG</div>
            <button onClick={()=>setShowHistory(!showHistory)} className="btn text-xs py-1 px-2"
              style={{background:'transparent',border:'1px solid var(--border)',color:'var(--text-muted)'}}>
              {showHistory ? 'Hide' : 'Show'} Log ({history.length})
            </button>
          </div>
          {showHistory && (
            <div style={{maxHeight:'140px',overflowY:'auto',fontFamily:'JetBrains Mono, monospace',fontSize:'11px'}}>
              {history.length === 0
                ? <div style={{color:'var(--text-faint)'}}>No operations yet — start sorting to see the log</div>
                : history.map((h,i) => (
                  <div key={i} style={{
                    color: h.includes('SWAP') ? 'var(--accent-red)' : h.includes('Compare') ? 'var(--accent-amber)' : 'var(--text-muted)',
                    padding: '1px 0',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}>{h}</div>
                ))
              }
            </div>
          )}
        </div>

        <div className="glass-card p-6 mb-4">
          <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>✏️ Custom Array Input</div>
          <div className="flex gap-3 flex-wrap items-start">
            <div className="flex-1 min-w-60">
              <input type="text" value={customInput} onChange={e => setCustomInput(e.target.value)}
                placeholder="e.g. 64, 34, 25, 12, 22, 11, 90" disabled={running}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px',
                  background: 'var(--bg-primary)', border: '1px solid #2a2a3e',
                  color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '13px', outline: 'none' }} />
              {customError && <p className="text-xs mt-1" style={{ color: '#ff4466' }}>{customError}</p>}
              <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Enter numbers separated by commas (2–80 values, 1–999 each)</p>
            </div>
            <button onClick={applyCustomArray} disabled={running} className="btn btn-violet">Apply Array</button>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex-1 min-w-40">
              <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                <span>Speed</span><span style={{ color: '#00d4ff' }}>{speed}%</span>
              </div>
              <input type="range" min="1" max="100" value={speed} onChange={e => setSpeed(Number(e.target.value))} disabled={running} />
            </div>
            <div className="flex-1 min-w-40">
              <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                <span>Array Size</span><span style={{ color: '#00d4ff' }}>{arraySize}</span>
              </div>
              <input type="range" min="5" max="80" value={arraySize} onChange={e => setArraySize(Number(e.target.value))} disabled={running} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mb-3">
            <button onClick={startSort} disabled={running} className="btn btn-green">{running ? '⟳ Sorting...' : '▶ Start Sort'}</button>
            {running && !stepMode && <button onClick={togglePause} className="btn btn-amber">{paused ? '▶ Resume' : '⏸ Pause'}</button>}
            {running && stepMode && <button onClick={doStep} className="btn btn-amber">⏭ Next Step</button>}
            <button onClick={reset} className="btn btn-danger">↺ Reset</button>
            <button onClick={() => { if (!running) { setBars(randomArray(arraySize)); setComparisons(0); setSwaps(0); setStatus('') } }} disabled={running} className="btn btn-primary">⚄ Random Array</button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>setStepMode(!stepMode)} disabled={running}
              className="btn text-xs"
              style={{background:stepMode?'#ffb80022':'var(--bg-card)',border:stepMode?'1px solid #ffb80044':'1px solid #2a2a3e',color:stepMode?'#ffb800':'var(--text-faint)'}}>
              {stepMode ? '⏭ Step Mode ON' : '⏭ Step Mode OFF'}
            </button>
            <span className="text-xs" style={{color:'var(--text-faint)'}}>
              {stepMode ? 'Press Next Step to advance one comparison at a time' : 'Click to manually step through each comparison'}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
