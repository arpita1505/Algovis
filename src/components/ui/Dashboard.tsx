'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line } from 'recharts'

const complexityData = [
  { algo: 'Bubble', best: 1, avg: 100, worst: 100 },
  { algo: 'Quick',  best: 7, avg: 7,   worst: 100 },
  { algo: 'Merge',  best: 7, avg: 7,   worst: 7   },
  { algo: 'Heap',   best: 7, avg: 7,   worst: 7   },
  { algo: 'Binary Search', best: 1, avg: 4, worst: 7 },
  { algo: 'Linear Search', best: 1, avg: 50, worst: 100 },
]

const radarData = [
  { subject: 'Speed',       Bubble: 20, Quick: 90, Merge: 85, Heap: 80 },
  { subject: 'Memory',      Bubble: 100,Quick: 80, Merge: 50, Heap: 100 },
  { subject: 'Stability',   Bubble: 100,Quick: 30, Merge: 100,Heap: 30 },
  { subject: 'Simplicity',  Bubble: 100,Quick: 60, Merge: 60, Heap: 40 },
  { subject: 'Adaptability',Bubble: 60, Quick: 70, Merge: 50, Heap: 50 },
]

const growthData = Array.from({length:20},(_,i)=>{
  const n = (i+1)*5
  return { n, 'O(n2)': Math.round(n*n/10), 'O(nlogn)': Math.round(n*Math.log2(n)), 'O(n)': n, 'O(logn)': Math.round(Math.log2(n)*10) }
})

const algorithms = [
  { name:'Bubble Sort',   category:'Sorting',   time:'O(n2)',      space:'O(1)',      stable:true,  inplace:true,  desc:'Simple nested loops. Compare adjacent elements and swap if out of order. Best case O(n) when already sorted.' },
  { name:'Quick Sort',    category:'Sorting',   time:'O(n log n)', space:'O(log n)',  stable:false, inplace:true,  desc:'Pick a pivot, partition array around it, recurse. Average case is very fast but worst case O(n2) on sorted arrays.' },
  { name:'Merge Sort',    category:'Sorting',   time:'O(n log n)', space:'O(n)',      stable:true,  inplace:false, desc:'Divide array in half recursively, then merge sorted halves. Guaranteed O(n log n) but uses extra space.' },
  { name:'Heap Sort',     category:'Sorting',   time:'O(n log n)', space:'O(1)',      stable:false, inplace:true,  desc:'Build a max heap, repeatedly extract maximum. In-place and O(n log n) but poor cache performance.' },
  { name:'Binary Search', category:'Searching', time:'O(log n)',   space:'O(1)',      stable:true,  inplace:true,  desc:'Requires sorted array. Eliminate half the search space each step. Extremely fast for large datasets.' },
  { name:'Linear Search', category:'Searching', time:'O(n)',       space:'O(1)',      stable:true,  inplace:true,  desc:'Check every element one by one. Works on unsorted arrays. Simple but slow for large inputs.' },
  { name:'BFS',           category:'Graph',     time:'O(V+E)',     space:'O(V)',      stable:true,  inplace:false, desc:'Level-by-level traversal using queue. Finds shortest path in unweighted graphs.' },
  { name:'DFS',           category:'Graph',     time:'O(V+E)',     space:'O(V)',      stable:true,  inplace:false, desc:'Go as deep as possible using stack/recursion. Good for maze solving and cycle detection.' },
  { name:'Dijkstra',      category:'Graph',     time:'O(V2)',      space:'O(V)',      stable:true,  inplace:false, desc:'Greedy shortest path for weighted graphs. Always picks the unvisited node with minimum distance.' },
  { name:'BST Insert',    category:'Tree',      time:'O(log n)',   space:'O(1)',      stable:true,  inplace:true,  desc:'Compare with root, go left if smaller, right if larger. Worst case O(n) for skewed trees.' },
]

const tips = [
  { icon:'⚡', title:'When to use Quick Sort', tip:'Use QuickSort for general-purpose sorting. It has the best average case due to cache efficiency. Avoid on nearly-sorted data.' },
  { icon:'🔒', title:'When stability matters', tip:'Use Merge Sort when you need a stable sort. Common in database sorting and external sorting.' },
  { icon:'💾', title:'Memory constrained', tip:'Use Heap Sort or Quick Sort when memory is limited — both are in-place. Merge Sort requires O(n) extra space.' },
  { icon:'🔍', title:'Binary vs Linear Search', tip:'Always prefer Binary Search for sorted arrays. For 1 million elements: Binary Search ~20 steps vs Linear Search up to 1,000,000 steps.' },
  { icon:'🌐', title:'BFS vs DFS', tip:'Use BFS to find shortest path in unweighted graphs. Use DFS for topological sort and cycle detection.' },
  { icon:'🌳', title:'BST vs Hash Table', tip:'BST gives O(log n) for search/insert/delete AND keeps data sorted. Hash tables give O(1) average but no ordering.' },
]

const interviewQs = [
  'Why is QuickSort average O(n log n) but worst case O(n2)?',
  'What makes Merge Sort stable but Heap Sort unstable?',
  'Why can you not use Binary Search on an unsorted array?',
  'What is the difference between BFS and DFS?',
  'How does a BST differ from a Hash Table? Trade-offs?',
  'What happens to BST performance when data is already sorted?',
  'Why is Heap Sort in-place but Merge Sort is not?',
  'When would you prefer O(n log n) sort over O(n2)?',
]

export default function Dashboard() {
  const [selectedAlgo, setSelectedAlgo] = useState(algorithms[0])
  const [activeTab, setActiveTab] = useState<'complexity'|'comparison'|'growth'|'reference'|'tips'>('complexity')

  const tabs = [
    { id:'complexity' as const, label:'Complexity Chart' },
    { id:'comparison' as const, label:'Algorithm Radar' },
    { id:'growth'     as const, label:'Growth Curves' },
    { id:'reference'  as const, label:'Quick Reference' },
    { id:'tips'       as const, label:'Interview Tips' },
  ]

  return (
    <div className="min-h-screen pt-20 px-6 pb-10">
      <div className="max-w-6xl mx-auto">

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{fontFamily:'Syne, sans-serif',color:'#e8e8f0'}}>▤ Algorithm Dashboard</h1>
          <p className="text-sm" style={{color:'#666'}}>Your complete DSA reference — complexity charts, comparisons, and interview tips</p>
        </motion.div>

        <div className="flex gap-2 flex-wrap mb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setActiveTab(t.id)}
              className="btn text-xs py-2 px-4"
              style={{background:activeTab===t.id?'#00d4ff22':'#16161f',
                border:activeTab===t.id?'1px solid #00d4ff44':'1px solid #2a2a3e',
                color:activeTab===t.id?'#00d4ff':'#666'}}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'complexity' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
            <div className="glass-card p-6 mb-4">
              <div className="text-sm font-semibold mb-1" style={{fontFamily:'Syne, sans-serif',color:'#e8e8f0'}}>Time Complexity Comparison</div>
              <div className="text-xs mb-6" style={{color:'#555'}}>Relative operation count. Best / Average / Worst case.</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complexityData} barGap={2}>
                  <XAxis dataKey="algo" tick={{fill:'#555',fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{background:'#16161f',border:'1px solid #2a2a3e',borderRadius:'8px',color:'#e8e8f0',fontSize:'12px'}} />
                  <Bar dataKey="best"  fill="#00ff88" radius={[3,3,0,0]} name="Best Case" />
                  <Bar dataKey="avg"   fill="#ffb800" radius={[3,3,0,0]} name="Avg Case" />
                  <Bar dataKey="worst" fill="#ff4466" radius={[3,3,0,0]} name="Worst Case" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-4 justify-center">
                {[{c:'#00ff88',l:'Best'},{c:'#ffb800',l:'Average'},{c:'#ff4466',l:'Worst'}].map(item=>(
                  <div key={item.l} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{background:item.c}} />
                    <span className="text-xs" style={{color:'#666'}}>{item.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                {label:'O(1)',      desc:'Constant — ideal',           color:'#00ff88', ex:'Array access, Hash lookup'},
                {label:'O(log n)',  desc:'Logarithmic — excellent',    color:'#00d4ff', ex:'Binary Search, BST ops'},
                {label:'O(n)',      desc:'Linear — acceptable',        color:'#7c3aed', ex:'Linear Search, Array scan'},
                {label:'O(n log n)',desc:'Linearithmic — good enough', color:'#ffb800', ex:'Merge, Quick, Heap Sort'},
                {label:'O(n2)',     desc:'Quadratic — avoid on large', color:'#ff4466', ex:'Bubble Sort, nested loops'},
                {label:'O(2n)',     desc:'Exponential — very slow',    color:'#ff2d78', ex:'Fibonacci recursive'},
              ].map(item=>(
                <div key={item.label} className="glass-card p-4" style={{border:'1px solid '+item.color+'22'}}>
                  <div className="text-lg font-bold mb-1" style={{color:item.color,fontFamily:'JetBrains Mono, monospace'}}>{item.label}</div>
                  <div className="text-xs mb-1 font-semibold" style={{color:'#888'}}>{item.desc}</div>
                  <div className="text-xs" style={{color:'#555'}}>{item.ex}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'comparison' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
            <div className="glass-card p-6">
              <div className="text-sm font-semibold mb-1" style={{fontFamily:'Syne, sans-serif',color:'#e8e8f0'}}>Sorting Algorithm Radar</div>
              <div className="text-xs mb-6" style={{color:'#555'}}>Higher score = better in that dimension</div>
              <ResponsiveContainer width="100%" height={340}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2a2a3e" />
                  <PolarAngleAxis dataKey="subject" tick={{fill:'#666',fontSize:12}} />
                  <Radar name="Bubble" dataKey="Bubble" stroke="#ff4466" fill="#ff4466" fillOpacity={0.1} />
                  <Radar name="Quick"  dataKey="Quick"  stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.1} />
                  <Radar name="Merge"  dataKey="Merge"  stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.1} />
                  <Radar name="Heap"   dataKey="Heap"   stroke="#00ff88" fill="#00ff88" fillOpacity={0.1} />
                  <Tooltip contentStyle={{background:'#16161f',border:'1px solid #2a2a3e',borderRadius:'8px',color:'#e8e8f0',fontSize:'12px'}} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center flex-wrap">
                {[{c:'#ff4466',l:'Bubble'},{c:'#00d4ff',l:'Quick'},{c:'#7c3aed',l:'Merge'},{c:'#00ff88',l:'Heap'}].map(item=>(
                  <div key={item.l} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{background:item.c}} />
                    <span className="text-xs" style={{color:'#666'}}>{item.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'growth' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
            <div className="glass-card p-6">
              <div className="text-sm font-semibold mb-1" style={{fontFamily:'Syne, sans-serif',color:'#e8e8f0'}}>Growth Rate Curves</div>
              <div className="text-xs mb-6" style={{color:'#555'}}>How operation count grows as input size increases</div>
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={growthData}>
                  <XAxis dataKey="n" tick={{fill:'#555',fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill:'#555',fontSize:11}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{background:'#16161f',border:'1px solid #2a2a3e',borderRadius:'8px',color:'#e8e8f0',fontSize:'11px'}} />
                  <Line type="monotone" dataKey="O(n2)"    stroke="#ff4466" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="O(nlogn)" stroke="#ffb800" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="O(n)"     stroke="#7c3aed" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="O(logn)"  stroke="#00ff88" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-4 justify-center flex-wrap">
                {[{c:'#ff4466',l:'O(n2)'},{c:'#ffb800',l:'O(n log n)'},{c:'#7c3aed',l:'O(n)'},{c:'#00ff88',l:'O(log n)'}].map(item=>(
                  <div key={item.l} className="flex items-center gap-2">
                    <div className="w-8 h-0.5" style={{background:item.c}} />
                    <span className="text-xs" style={{color:'#666',fontFamily:'JetBrains Mono, monospace'}}>{item.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reference' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 flex flex-col gap-2">
                {algorithms.map(a => (
                  <button key={a.name} onClick={()=>setSelectedAlgo(a)}
                    className="glass-card p-3 text-left transition-all"
                    style={{border:selectedAlgo.name===a.name?'1px solid #00d4ff44':'1px solid transparent',
                      background:selectedAlgo.name===a.name?'#00d4ff08':undefined}}>
                    <div className="text-xs font-semibold" style={{color:selectedAlgo.name===a.name?'#00d4ff':'#888'}}>{a.name}</div>
                    <div className="text-xs mt-0.5" style={{color:'#555',fontFamily:'JetBrains Mono, monospace'}}>{a.time}</div>
                  </button>
                ))}
              </div>
              <div className="md:col-span-2 glass-card p-6">
                <div className="text-xl font-bold mb-1" style={{fontFamily:'Syne, sans-serif',color:'#e8e8f0'}}>{selectedAlgo.name}</div>
                <div className="text-xs mb-4 px-2 py-1 rounded inline-block" style={{background:'#00d4ff11',border:'1px solid #00d4ff22',color:'#00d4ff'}}>{selectedAlgo.category}</div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    {label:'Time',  val:selectedAlgo.time,  color:'#ffb800'},
                    {label:'Space', val:selectedAlgo.space, color:'#7c3aed'},
                    {label:'Stable',   val:selectedAlgo.stable?'Yes':'No',  color:selectedAlgo.stable?'#00ff88':'#ff4466'},
                    {label:'In-place', val:selectedAlgo.inplace?'Yes':'No', color:selectedAlgo.inplace?'#00ff88':'#ff4466'},
                  ].map(item=>(
                    <div key={item.label} className="glass-card p-3" style={{background:'#0a0a0f'}}>
                      <div className="text-xs mb-1" style={{color:'#555'}}>{item.label}</div>
                      <div className="text-base font-bold" style={{color:item.color,fontFamily:'JetBrains Mono, monospace'}}>{item.val}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs mb-2" style={{color:'#555'}}>How it works</div>
                <div className="text-sm" style={{color:'#aaa',lineHeight:1.8}}>{selectedAlgo.desc}</div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'tips' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {tips.map((tip,i) => (
                <div key={i} className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{tip.icon}</div>
                    <div className="text-sm font-semibold" style={{fontFamily:'Syne, sans-serif',color:'#e8e8f0'}}>{tip.title}</div>
                  </div>
                  <div className="text-sm" style={{color:'#888',lineHeight:1.7}}>{tip.tip}</div>
                </div>
              ))}
            </div>
            <div className="glass-card p-6" style={{border:'1px solid #ffb80022',background:'#ffb8000a'}}>
              <div className="text-sm font-bold mb-4" style={{fontFamily:'Syne, sans-serif',color:'#ffb800'}}>🎯 Common Interview Questions</div>
              <div className="flex flex-col gap-3">
                {interviewQs.map((q,i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{background:'#ffb8000a',border:'1px solid #ffb80011'}}>
                    <span className="text-xs font-bold flex-shrink-0 mt-0.5" style={{color:'#ffb800',fontFamily:'JetBrains Mono, monospace'}}>Q{i+1}</span>
                    <span className="text-sm" style={{color:'#888'}}>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}
