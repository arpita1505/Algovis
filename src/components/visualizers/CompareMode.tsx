'use client'
import { useState, useRef } from 'react'
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
function fromCustom(nums: number[]): Bar[] {
  const max = Math.max(...nums)
  return nums.map(v => ({ value: Math.round((v/max)*95)+5, display: v, state: 'default' as BarState }))
}
function getBarColor(state: BarState) {
  if (state === 'comparing') return '#ffb800'
  if (state === 'swapping')  return '#ff4466'
  if (state === 'sorted')    return '#00ff88'
  if (state === 'pivot')     return '#7c3aed'
  return '#00d4ff'
}
const algoInfo: Record<Algorithm, { time: string; color: string }> = {
  bubble: { time: 'O(n²)',      color: '#ff4466' },
  quick:  { time: 'O(n log n)', color: '#00d4ff' },
  merge:  { time: 'O(n log n)', color: '#7c3aed' },
  heap:   { time: 'O(n log n)', color: '#00ff88' },
}

async function runBubble(arr: Bar[], upd: (a:Bar[])=>void, dl: ()=>number, stop: {v:boolean}, ops: {v:number}, setOps: (n:number)=>void) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length-i-1; j++) {
      if (stop.v) return
      arr[j].state='comparing'; arr[j+1].state='comparing'; upd(arr); ops.v++; setOps(ops.v)
      await sleep(dl())
      if (arr[j].value > arr[j+1].value) {
        ;[arr[j],arr[j+1]]=[arr[j+1],arr[j]]
        arr[j].state='swapping'; arr[j+1].state='swapping'; upd(arr); await sleep(dl())
      }
      arr[j].state='default'; arr[j+1].state='default'
    }
    arr[arr.length-i-1].state='sorted'; upd(arr)
  }
}
async function runQuick(arr: Bar[], lo: number, hi: number, upd: (a:Bar[])=>void, dl: ()=>number, stop: {v:boolean}, ops: {v:number}, setOps: (n:number)=>void) {
  if (lo >= hi || stop.v) return
  const pivot = arr[hi]; pivot.state='pivot'; upd(arr)
  let i = lo-1
  for (let j = lo; j < hi; j++) {
    if (stop.v) return
    arr[j].state='comparing'; upd(arr); ops.v++; setOps(ops.v); await sleep(dl())
    if (arr[j].value <= pivot.value) {
      i++; [arr[i],arr[j]]=[arr[j],arr[i]]
      arr[i].state='swapping'; upd(arr); await sleep(dl()); arr[i].state='default'
    }
    arr[j].state='default'
  }
  ;[arr[i+1],arr[hi]]=[arr[hi],arr[i+1]]
  arr[i+1].state='sorted'; pivot.state='default'; upd(arr)
  await runQuick(arr,lo,i,upd,dl,stop,ops,setOps)
  await runQuick(arr,i+2,hi,upd,dl,stop,ops,setOps)
}
async function runMerge(arr: Bar[], l: number, r: number, upd: (a:Bar[])=>void, dl: ()=>number, stop: {v:boolean}, ops: {v:number}, setOps: (n:number)=>void) {
  if (l >= r || stop.v) return
  const m = Math.floor((l+r)/2)
  await runMerge(arr,l,m,upd,dl,stop,ops,setOps)
  await runMerge(arr,m+1,r,upd,dl,stop,ops,setOps)
  const L=arr.slice(l,m+1).map(b=>({...b})), R=arr.slice(m+1,r+1).map(b=>({...b}))
  let i=0,j=0,k=l
  while (i<L.length&&j<R.length) {
    if (stop.v) return
    arr[k]=L[i].value<=R[j].value?{...L[i],state:'swapping'}:{...R[j],state:'swapping'}
    if (L[i].value<=R[j].value) i++; else j++
    ops.v++; setOps(ops.v); upd(arr); await sleep(dl()); arr[k].state='default'; k++
  }
  while (i<L.length) { arr[k++]={...L[i++],state:'sorted'}; upd(arr); await sleep(dl()/2) }
  while (j<R.length) { arr[k++]={...R[j++],state:'sorted'}; upd(arr); await sleep(dl()/2) }
}
async function runHeap(arr: Bar[], upd: (a:Bar[])=>void, dl: ()=>number, stop: {v:boolean}, ops: {v:number}, setOps: (n:number)=>void) {
  async function heapify(n: number, i: number) {
    if (stop.v) return
    let lg=i; const l=2*i+1,r=2*i+2
    if (l<n){ops.v++;setOps(ops.v);if(arr[l].value>arr[lg].value)lg=l}
    if (r<n){ops.v++;setOps(ops.v);if(arr[r].value>arr[lg].value)lg=r}
    if (lg!==i){arr[i].state='comparing';arr[lg].state='swapping';upd(arr);await sleep(dl());[arr[i],arr[lg]]=[arr[lg],arr[i]];arr[i].state='default';arr[lg].state='default';upd(arr);await heapify(n,lg)}
  }
  const n=arr.length
  for (let i=Math.floor(n/2)-1;i>=0;i--) await heapify(n,i)
  for (let i=n-1;i>0;i--){if(stop.v)return;[arr[0],arr[i]]=[arr[i],arr[0]];arr[i].state='sorted';upd(arr);await sleep(dl());await heapify(i,0)}
  arr[0].state='sorted';upd(arr)
}

function BarChart({ bars, showVals }: { bars: Bar[], showVals: boolean }) {
  return (
    <div className="flex items-end gap-0.5 w-full" style={{height:'200px'}}>
      {bars.map((bar,i) => (
        <div key={i} className="relative flex flex-col items-center justify-end h-full"
          style={{flex:1, minWidth:'2px'}}>
          {showVals && (
            <span style={{
              position:'absolute',
              bottom:'calc('+bar.value+'% + 3px)',
              fontSize: bars.length <= 20 ? '9px' : '7px',
              color: getBarColor(bar.state),
              fontFamily:'JetBrains Mono, monospace',
              whiteSpace:'nowrap',
              lineHeight:1,
              transition:'bottom 0.05s',
            }}>{bar.display}</span>
          )}
          <div style={{
            height:bar.value+'%', width:'100%',
            background:getBarColor(bar.state),
            borderRadius:'1px 1px 0 0',
            transition:'height 0.05s,background 0.1s',
            boxShadow:bar.state!=='default'?'0 0 6px '+getBarColor(bar.state)+'88':'none',
          }} />
        </div>
      ))}
    </div>
  )
}

export default function CompareMode() {
  const [algoA, setAlgoA] = useState<Algorithm>('bubble')
  const [algoB, setAlgoB] = useState<Algorithm>('quick')
  const [speed, setSpeed] = useState(60)
  const [arraySize, setArraySize] = useState(20)
  const [running, setRunning] = useState(false)
  const [barsA, setBarsA] = useState<Bar[]>(() => randomArray(20))
  const [barsB, setBarsB] = useState<Bar[]>(() => randomArray(20))
  const [opsA, setOpsA] = useState(0)
  const [opsB, setOpsB] = useState(0)
  const [timeA, setTimeA] = useState<number|null>(null)
  const [timeB, setTimeB] = useState<number|null>(null)
  const [winner, setWinner] = useState<'A'|'B'|'tie'|null>(null)
  const [customInput, setCustomInput] = useState('')
  const [customError, setCustomError] = useState('')
  const [showVals, setShowVals] = useState(true)
  const stopRef = useRef({v:false})
  const timesRef = useRef({a:0,b:0,doneA:false,doneB:false})

  const dl = () => Math.max(5, 150 - speed * 1.4)

  const applyCustom = () => {
    const nums = customInput.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n))
    if (nums.length < 2) { setCustomError('Enter at least 2 numbers'); return }
    if (nums.length > 60) { setCustomError('Max 60 numbers'); return }
    if (nums.some(n=>n<1||n>999)) { setCustomError('Numbers must be 1-999'); return }
    setCustomError('')
    const base = fromCustom(nums)
    setBarsA(base.map(b=>({...b}))); setBarsB(base.map(b=>({...b})))
    setOpsA(0); setOpsB(0); setTimeA(null); setTimeB(null); setWinner(null)
    setArraySize(nums.length)
    setShowVals(nums.length <= 30)
  }

  const generateArrays = () => {
    stopRef.current.v=true; setRunning(false); setOpsA(0); setOpsB(0); setTimeA(null); setTimeB(null); setWinner(null)
    setTimeout(() => {
      stopRef.current.v=false
      const base=randomArray(arraySize)
      setBarsA(base.map(b=>({...b}))); setBarsB(base.map(b=>({...b})))
    }, 100)
  }

  const startRace = async () => {
    if (running) return
    stopRef.current.v=false; setRunning(true); setOpsA(0); setOpsB(0); setTimeA(null); setTimeB(null); setWinner(null)
    timesRef.current={a:0,b:0,doneA:false,doneB:false}
    const base=randomArray(arraySize)
    const arrA=base.map(b=>({...b,state:'default' as BarState}))
    const arrB=base.map(b=>({...b,state:'default' as BarState}))
    setBarsA([...arrA]); setBarsB([...arrB])
    const opsAr={v:0}, opsBr={v:0}

    const checkWinner = () => {
      const t=timesRef.current
      if (t.doneA&&t.doneB) {
        if (t.a<t.b) setWinner('A')
        else if (t.b<t.a) setWinner('B')
        else setWinner('tie')
      }
    }
    const doA = async () => {
      const t=Date.now()
      if (algoA==='bubble') await runBubble(arrA,a=>{setBarsA([...a])},dl,stopRef.current,opsAr,setOpsA)
      else if (algoA==='quick') await runQuick(arrA,0,arrA.length-1,a=>{setBarsA([...a])},dl,stopRef.current,opsAr,setOpsA)
      else if (algoA==='merge') await runMerge(arrA,0,arrA.length-1,a=>{setBarsA([...a])},dl,stopRef.current,opsAr,setOpsA)
      else await runHeap(arrA,a=>{setBarsA([...a])},dl,stopRef.current,opsAr,setOpsA)
      if (!stopRef.current.v){arrA.forEach(b=>b.state='sorted');setBarsA([...arrA]);const ms=Date.now()-t;setTimeA(ms);timesRef.current.a=ms;timesRef.current.doneA=true;checkWinner()}
    }
    const doB = async () => {
      const t=Date.now()
      if (algoB==='bubble') await runBubble(arrB,a=>{setBarsB([...a])},dl,stopRef.current,opsBr,setOpsB)
      else if (algoB==='quick') await runQuick(arrB,0,arrB.length-1,a=>{setBarsB([...a])},dl,stopRef.current,opsBr,setOpsB)
      else if (algoB==='merge') await runMerge(arrB,0,arrB.length-1,a=>{setBarsB([...a])},dl,stopRef.current,opsBr,setOpsB)
      else await runHeap(arrB,a=>{setBarsB([...a])},dl,stopRef.current,opsBr,setOpsB)
      if (!stopRef.current.v){arrB.forEach(b=>b.state='sorted');setBarsB([...arrB]);const ms=Date.now()-t;setTimeB(ms);timesRef.current.b=ms;timesRef.current.doneB=true;checkWinner()}
    }
    await Promise.all([doA(), doB()])
    setRunning(false)
  }

  return (
    <div className="min-h-screen pt-20 px-6 pb-10">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{fontFamily:'Syne, sans-serif',color:'#e8e8f0'}}>⇌ Algorithm Race</h1>
          <p className="text-sm" style={{color:'#666'}}>Two algorithms, same array, running simultaneously — may the best win!</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {([
            {side:'A' as const, algo:algoA, setAlgo:setAlgoA, ops:opsA, time:timeA, isWinner:winner==='A'},
            {side:'B' as const, algo:algoB, setAlgo:setAlgoB, ops:opsB, time:timeB, isWinner:winner==='B'},
          ]).map(p => (
            <div key={p.side} className="glass-card p-5"
              style={{border:p.isWinner?'1px solid #00ff8844':'1px solid rgba(255,255,255,0.06)',background:p.isWinner?'#00ff8808':undefined}}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold" style={{fontFamily:'Syne, sans-serif',color:p.side==='A'?'#00d4ff':'#ff2d78'}}>
                  Algorithm {p.side} {p.isWinner&&'🏆'}
                </div>
                {p.time!==null&&(
                  <div className="text-xs px-2 py-1 rounded" style={{background:p.isWinner?'#00ff8822':'#ffffff11',color:p.isWinner?'#00ff88':'#888',fontFamily:'JetBrains Mono, monospace'}}>
                    {p.time}ms
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {(['bubble','quick','merge','heap'] as Algorithm[]).map(algo => (
                  <button key={algo} onClick={()=>{if(!running)p.setAlgo(algo)}}
                    className="p-2 rounded-lg text-xs text-left transition-all"
                    style={{background:p.algo===algo?algoInfo[algo].color+'22':'#0a0a0f',
                      border:p.algo===algo?'1px solid '+algoInfo[algo].color+'44':'1px solid #2a2a3e',
                      color:p.algo===algo?algoInfo[algo].color:'#555'}}>
                    <div className="font-semibold capitalize">{algo}</div>
                    <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:'10px',opacity:0.7}}>{algoInfo[algo].time}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <div><div className="text-xs" style={{color:'#555'}}>Operations</div>
                  <div className="text-lg font-bold" style={{color:'#ffb800',fontFamily:'JetBrains Mono, monospace'}}>{p.ops.toLocaleString()}</div>
                </div>
                {p.time!==null&&<div><div className="text-xs" style={{color:'#555'}}>Time</div>
                  <div className="text-lg font-bold" style={{color:'#00d4ff',fontFamily:'JetBrains Mono, monospace'}}>{p.time}ms</div>
                </div>}
              </div>
            </div>
          ))}
        </div>

        {winner && (
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
            className="glass-card p-4 mb-6 text-center"
            style={{border:'1px solid #00ff8844',background:'#00ff8808'}}>
            <div className="text-lg font-bold mb-1" style={{fontFamily:'Syne, sans-serif',color:'#00ff88'}}>
              {winner==='tie'?'🤝 Tie!'
                :winner==='A'?'🏆 Algorithm A Wins! ('+algoA+')'
                :'🏆 Algorithm B Wins! ('+algoB+')'}
            </div>
            {winner!=='tie'&&timeA!==null&&timeB!==null&&(
              <div className="text-sm" style={{color:'#888'}}>
                {winner==='A'?algoA:algoB} finished {Math.abs(timeA-timeB)}ms faster
              </div>
            )}
            <div className="text-xs mt-1" style={{color:'#555'}}>
              Operations — {algoA}: {opsA.toLocaleString()} vs {algoB}: {opsB.toLocaleString()}
              {opsA!==opsB&&<span style={{color:'#00ff88'}}> ({opsA<opsB?algoA:algoB} used {Math.abs(opsA-opsB).toLocaleString()} fewer ops)</span>}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[{bars:barsA,side:'A',algo:algoA},{bars:barsB,side:'B',algo:algoB}].map(p => (
            <div key={p.side} className="glass-card p-4">
              <div className="text-xs font-semibold mb-3 flex justify-between"
                style={{fontFamily:'Syne, sans-serif',color:p.side==='A'?'#00d4ff':'#ff2d78'}}>
                <span>{p.algo.charAt(0).toUpperCase()+p.algo.slice(1)} Sort</span>
                <span style={{color:'#555',fontFamily:'JetBrains Mono, monospace'}}>{algoInfo[p.algo].time}</span>
              </div>
              <BarChart bars={p.bars} showVals={showVals && arraySize <= 30} />
            </div>
          ))}
        </div>

        <div className="glass-card p-5 mb-4">
          <div className="text-sm font-semibold mb-3" style={{color:'#e8e8f0',fontFamily:'Syne, sans-serif'}}>✏️ Custom Array</div>
          <div className="flex gap-2 flex-wrap items-start">
            <div className="flex-1 min-w-48">
              <input type="text" value={customInput} onChange={e=>setCustomInput(e.target.value)}
                placeholder="e.g. 64, 34, 25, 12, 22, 11, 90" disabled={running}
                onKeyDown={e=>e.key==='Enter'&&applyCustom()}
                style={{width:'100%',padding:'10px 14px',borderRadius:'8px',background:'#0a0a0f',
                  border:'1px solid #2a2a3e',color:'#e8e8f0',fontFamily:'JetBrains Mono, monospace',
                  fontSize:'13px',outline:'none'}} />
              {customError&&<p className="text-xs mt-1" style={{color:'#ff4466'}}>{customError}</p>}
              <p className="text-xs mt-1" style={{color:'#555'}}>Both algorithms will race on your exact array</p>
            </div>
            <button onClick={applyCustom} disabled={running} className="btn btn-violet">Apply to Both</button>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-wrap items-center gap-6 mb-4">
            <div className="flex-1 min-w-40">
              <div className="flex justify-between text-xs mb-2" style={{color:'#666'}}>
                <span>Speed</span><span style={{color:'#00d4ff'}}>{speed}%</span>
              </div>
              <input type="range" min="1" max="100" value={speed} onChange={e=>setSpeed(Number(e.target.value))} disabled={running} />
            </div>
            <div className="flex-1 min-w-40">
              <div className="flex justify-between text-xs mb-2" style={{color:'#666'}}>
                <span>Array Size</span><span style={{color:'#00d4ff'}}>{arraySize}</span>
              </div>
              <input type="range" min="5" max="60" value={arraySize} onChange={e=>setArraySize(Number(e.target.value))} disabled={running} />
            </div>
            <div>
              <div className="text-xs mb-2" style={{color:'#666'}}>Show Values</div>
              <button onClick={()=>setShowVals(!showVals)} disabled={running}
                className="btn text-xs"
                style={{background:showVals?'#00d4ff22':'#16161f',border:showVals?'1px solid #00d4ff44':'1px solid #2a2a3e',color:showVals?'#00d4ff':'#555'}}>
                {showVals?'ON':'OFF'}
              </button>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={startRace} disabled={running} className="btn btn-green px-8">{running?'⟳ Racing...':'▶ Start Race!'}</button>
            <button onClick={generateArrays} disabled={running} className="btn btn-primary">⚄ New Random Array</button>
          </div>
        </div>

      </div>
    </div>
  )
}
