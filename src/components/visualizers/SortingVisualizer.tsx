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
  const [comparisons, setComparisons] = useState(0)
  const [swaps, setSwaps] = useState(0)
  const [arraySize, setArraySize] = useState(20)
  const [customInput, setCustomInput] = useState('')
  const [customError, setCustomError] = useState('')
  const [status, setStatus] = useState('')
  const pausedRef = useRef(false)
  const stopRef = useRef(false)

  const showValues = bars.length <= 30
  const getDelay = () => Math.max(5, 200 - speed * 1.9)

  const waitIfPaused = async () => {
    while (pausedRef.current) {
      await sleep(100)
      if (stopRef.current) return
    }
  }

  const reset = useCallback(() => {
    stopRef.current = true
    pausedRef.current = false
    setPaused(false); setRunning(false)
    setComparisons(0); setSwaps(0); setStatus('')
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

  async function bubbleSort(arr: Bar[]) {
    let c = 0, s = 0
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (stopRef.current) return
        await waitIfPaused()
        arr[j].state = 'comparing'; arr[j+1].state = 'comparing'
        setStatus('Comparing ' + arr[j].display + ' and ' + arr[j+1].display)
        update(arr); c++; setComparisons(c)
        await sleep(getDelay())
        if (arr[j].value > arr[j+1].value) {
          setStatus('Swapping ' + arr[j].display + ' and ' + arr[j+1].display + ' (wrong order!)')
          ;[arr[j], arr[j+1]] = [arr[j+1], arr[j]]
          s++; setSwaps(s)
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
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: '#e8e8f0' }}>▦ Sorting Visualizer</h1>
          <p className="text-sm" style={{ color: '#666' }}>Watch algorithms sort in real time — every comparison and swap explained</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {(['bubble','quick','merge','heap'] as Algorithm[]).map(algo => (
            <button key={algo} onClick={() => { if (!running) setAlgorithm(algo) }}
              className="glass-card p-4 text-left transition-all"
              style={{ border: algorithm === algo ? '1px solid #00d4ff44' : '1px solid transparent', background: algorithm === algo ? '#00d4ff0a' : undefined }}>
              <div className="text-sm font-semibold capitalize mb-1" style={{ color: algorithm === algo ? '#00d4ff' : '#888', fontFamily: 'Syne, sans-serif' }}>{algo} Sort</div>
              <div className="text-xs" style={{ color: '#555', fontFamily: 'JetBrains Mono, monospace' }}>{algoInfo[algo].time}</div>
            </button>
          ))}
        </div>

        <div className="glass-card p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div><div className="text-xs mb-1" style={{ color: '#555' }}>Description</div>
            <div className="text-sm" style={{ color: '#aaa' }}>{algoInfo[algorithm].desc}</div></div>
          <div className="flex gap-6">
            {[{label:'Time', val:algoInfo[algorithm].time, color:'#00d4ff'},
              {label:'Space', val:algoInfo[algorithm].space, color:'#7c3aed'},
              {label:'Comparisons', val:String(comparisons), color:'#ffb800'},
              {label:'Swaps', val:String(swaps), color:'#ff4466'}].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xs mb-1" style={{ color: '#555' }}>{s.label}</div>
                <div className="text-sm font-bold" style={{ color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card px-4 py-3 mb-4 flex items-center gap-3" style={{ minHeight: '44px' }}>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: running ? '#00ff88' : '#555', boxShadow: running ? '0 0 8px #00ff8888' : 'none' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: status ? '#e8e8f0' : '#444' }}>
            {status || 'Press Start Sort to begin...'}
          </span>
        </div>

        <div className="glass-card p-6 mb-4" style={{ height: '320px' }}>
          <div className="flex items-end justify-center gap-0.5 h-full">
            {bars.map((bar, i) => (
              <div key={i} className="relative flex flex-col items-center justify-end h-full"
                style={{ width: Math.max(2, 100 / bars.length - 0.5) + '%', minWidth: '2px' }}>
                {showValues && (
                  <span style={{
                    position: 'absolute',
                    bottom: 'calc(' + bar.value + '% + 4px)',
                    fontSize: bars.length <= 15 ? '11px' : '9px',
                    color: getBarColor(bar.state),
                    fontFamily: 'JetBrains Mono, monospace',
                    whiteSpace: 'nowrap',
                    transition: 'bottom 0.05s',
                  }}>{bar.display}</span>
                )}
                <div style={{
                  height: bar.value + '%',
                  width: '100%',
                  background: getBarColor(bar.state),
                  borderRadius: '2px 2px 0 0',
                  transition: 'height 0.05s, background 0.1s',
                  boxShadow: bar.state !== 'default' ? '0 0 8px ' + getBarColor(bar.state) + '88' : 'none',
                }} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mb-4 flex-wrap">
          {[{color:'#00d4ff',label:'Unsorted'},{color:'#ffb800',label:'Comparing — deciding if swap needed'},
            {color:'#ff4466',label:'Swapping — wrong order, fixing it'},{color:'#7c3aed',label:'Pivot (QuickSort)'},{color:'#00ff88',label:'Sorted — final position'}].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: l.color, boxShadow: '0 0 6px ' + l.color + '66' }} />
              <span className="text-xs" style={{ color: '#666' }}>{l.label}</span>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 mb-4">
          <div className="text-sm font-semibold mb-3" style={{ color: '#e8e8f0', fontFamily: 'Syne, sans-serif' }}>✏️ Custom Array Input</div>
          <div className="flex gap-3 flex-wrap items-start">
            <div className="flex-1 min-w-60">
              <input type="text" value={customInput} onChange={e => setCustomInput(e.target.value)}
                placeholder="e.g. 64, 34, 25, 12, 22, 11, 90" disabled={running}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px',
                  background: '#0a0a0f', border: '1px solid #2a2a3e',
                  color: '#e8e8f0', fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '13px', outline: 'none' }} />
              {customError && <p className="text-xs mt-1" style={{ color: '#ff4466' }}>{customError}</p>}
              <p className="text-xs mt-1" style={{ color: '#555' }}>Enter numbers separated by commas (2–80 values, 1–999 each)</p>
            </div>
            <button onClick={applyCustomArray} disabled={running} className="btn btn-violet">Apply Array</button>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex-1 min-w-40">
              <div className="flex justify-between text-xs mb-2" style={{ color: '#666' }}>
                <span>Speed</span><span style={{ color: '#00d4ff' }}>{speed}%</span>
              </div>
              <input type="range" min="1" max="100" value={speed} onChange={e => setSpeed(Number(e.target.value))} disabled={running} />
            </div>
            <div className="flex-1 min-w-40">
              <div className="flex justify-between text-xs mb-2" style={{ color: '#666' }}>
                <span>Array Size</span><span style={{ color: '#00d4ff' }}>{arraySize}</span>
              </div>
              <input type="range" min="5" max="80" value={arraySize} onChange={e => setArraySize(Number(e.target.value))} disabled={running} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={startSort} disabled={running} className="btn btn-green">{running ? '⟳ Sorting...' : '▶ Start Sort'}</button>
            {running && <button onClick={togglePause} className="btn btn-amber">{paused ? '▶ Resume' : '⏸ Pause'}</button>}
            <button onClick={reset} className="btn btn-danger">↺ Reset</button>
            <button onClick={() => { if (!running) { setBars(randomArray(arraySize)); setComparisons(0); setSwaps(0); setStatus('') } }} disabled={running} className="btn btn-primary">⚄ Random Array</button>
          </div>
        </div>

      </div>
    </div>
  )
}
