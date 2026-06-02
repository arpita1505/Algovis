'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line } from 'recharts'

const complexityData = [
  { algo: 'Bubble', best: 1, avg: 100, worst: 100 },
  { algo: 'Quick',  best: 7, avg: 7,   worst: 100 },
  { algo: 'Merge',  best: 7, avg: 7,   worst: 7   },
  { algo: 'Heap',   best: 7, avg: 7,   worst: 7   },
  { algo: 'Binary', best: 1, avg: 4,   worst: 7   },
  { algo: 'Linear', best: 1, avg: 50,  worst: 100 },
]

const radarData = [
  { subject: 'Speed',        Bubble: 20, Quick: 90, Merge: 85, Heap: 80 },
  { subject: 'Memory',       Bubble: 100,Quick: 80, Merge: 50, Heap: 100 },
  { subject: 'Stability',    Bubble: 100,Quick: 30, Merge: 100,Heap: 30 },
  { subject: 'Simplicity',   Bubble: 100,Quick: 60, Merge: 60, Heap: 40 },
  { subject: 'Adaptability', Bubble: 60, Quick: 70, Merge: 50, Heap: 50 },
]

const growthData = Array.from({length:20},(_,i)=>{
  const n = (i+1)*5
  return { n, 'O(n2)': Math.round(n*n/10), 'O(nlogn)': Math.round(n*Math.log2(n)), 'O(n)': n, 'O(logn)': Math.round(Math.log2(n)*10) }
})

const algorithms = [
  { name:'Bubble Sort',   category:'Sorting',   time:'O(n²)',      space:'O(1)',     stable:true,  inplace:true,  best:'O(n)',      desc:'Repeatedly compares adjacent elements and swaps them if in the wrong order. Simple to understand but inefficient for large datasets. The inner loop runs n-i-1 times for each outer iteration.' },
  { name:'Quick Sort',    category:'Sorting',   time:'O(n log n)', space:'O(log n)', stable:false, inplace:true,  best:'O(n log n)',desc:'Selects a pivot element and partitions the array around it. Elements smaller than pivot go left, larger go right. Recursively sorts both halves. Worst case O(n²) occurs on already sorted arrays.' },
  { name:'Merge Sort',    category:'Sorting',   time:'O(n log n)', space:'O(n)',     stable:true,  inplace:false, best:'O(n log n)',desc:'Divides array into halves recursively until single elements, then merges them back in sorted order. Guaranteed O(n log n) in all cases but requires O(n) extra space for merging.' },
  { name:'Heap Sort',     category:'Sorting',   time:'O(n log n)', space:'O(1)',     stable:false, inplace:true,  best:'O(n log n)',desc:'Builds a max-heap from the array, then repeatedly extracts the maximum element. In-place with guaranteed O(n log n) but poor cache performance due to non-sequential memory access.' },
  { name:'Binary Search', category:'Searching', time:'O(log n)',   space:'O(1)',     stable:true,  inplace:true,  best:'O(1)',      desc:'Requires a sorted array. Compares target with middle element, eliminates half the search space each step. Extremely efficient — finds element in 1 million items in just 20 comparisons.' },
  { name:'Linear Search', category:'Searching', time:'O(n)',       space:'O(1)',     stable:true,  inplace:true,  best:'O(1)',      desc:'Sequentially checks each element until target is found or array is exhausted. Works on unsorted arrays. Simple but slow — avoid for large datasets where Binary Search is applicable.' },
  { name:'BFS',           category:'Graph',     time:'O(V+E)',     space:'O(V)',     stable:true,  inplace:false, best:'O(V+E)',    desc:'Explores graph level by level using a queue. Visits all neighbors of current node before moving deeper. Guarantees shortest path in unweighted graphs. Used in social networks, GPS navigation.' },
  { name:'DFS',           category:'Graph',     time:'O(V+E)',     space:'O(V)',     stable:true,  inplace:false, best:'O(V+E)',    desc:'Explores as far as possible along each branch before backtracking. Uses stack (or recursion). Better memory efficiency than BFS. Used for cycle detection, topological sort, maze solving.' },
  { name:'Dijkstra',      category:'Graph',     time:'O(V²)',      space:'O(V)',     stable:true,  inplace:false, best:'O(V²)',     desc:'Greedy algorithm for shortest path in weighted graphs. Maintains a distance table, always processes the unvisited node with minimum distance. Cannot handle negative edge weights.' },
  { name:'BST Insert',    category:'Tree',      time:'O(log n)',   space:'O(1)',     stable:true,  inplace:true,  best:'O(log n)',  desc:'Compares value with current node, goes left if smaller, right if larger, until empty spot found. Balanced BST gives O(log n) but degenerate (sorted input) tree gives O(n) — use AVL or Red-Black tree to fix this.' },
]

const cheatsheet = [
  { q: 'Why is QuickSort O(n²) worst case?', a: 'When pivot is always the smallest or largest element (e.g. sorted array), one partition has n-1 elements and the other has 0. This happens n times → O(n²). Fix: random pivot or median-of-three.' },
  { q: 'What makes Merge Sort stable?', a: 'During merge, when two elements are equal, we always pick from the left subarray first. This preserves the original relative order of equal elements, making it stable.' },
  { q: 'Why cannot Binary Search work on unsorted arrays?', a: 'Binary Search assumes that if target > mid, target must be in the right half. This assumption only holds when the array is sorted. On unsorted arrays, the target could be anywhere.' },
  { q: 'BFS vs DFS — when to use which?', a: 'Use BFS for shortest path in unweighted graphs, level-order traversal, finding nearest neighbor. Use DFS for cycle detection, topological sort, path existence, and when memory is limited (DFS uses O(depth) space vs BFS O(width)).' },
  { q: 'What is a balanced BST and why does it matter?', a: 'A BST where the height difference between left and right subtrees is at most 1 for every node. Matters because search/insert/delete are O(log n) in balanced trees but degrade to O(n) in skewed trees.' },
  { q: 'Why is Heap Sort not stable?', a: 'During the heapify process, elements are swapped based on value comparisons without regard to original positions. Equal elements can change their relative order during heap construction.' },
  { q: 'What is the difference between O(n log n) and O(n²)?', a: 'For n=1000: O(n log n) ≈ 10,000 operations, O(n²) = 1,000,000 operations. For n=1,000,000: O(n log n) ≈ 20,000,000 vs O(n²) = 1,000,000,000,000. The gap grows dramatically.' },
  { q: 'When would you use Dijkstra over BFS?', a: 'Use Dijkstra when edges have different weights and you need the shortest weighted path. Use BFS when the graph is unweighted or all edges have equal weight — it is simpler and also O(V+E).' },
]

const bigO = [
  { notation:'O(1)',       name:'Constant',     color:'#15803d', ex:'Array index access, hash table lookup, stack push/pop' },
  { notation:'O(log n)',   name:'Logarithmic',  color:'#0891b2', ex:'Binary search, BST operations (balanced), heap operations' },
  { notation:'O(n)',       name:'Linear',       color:'#2563eb', ex:'Linear search, array traversal, counting elements' },
  { notation:'O(n log n)', name:'Linearithmic', color:'#7c3aed', ex:'Merge sort, heap sort, quicksort (average)' },
  { notation:'O(n²)',      name:'Quadratic',    color:'#d97706', ex:'Bubble sort, insertion sort, selection sort' },
  { notation:'O(2ⁿ)',      name:'Exponential',  color:'#dc2626', ex:'Recursive fibonacci, power set generation' },
]

export default function Dashboard() {
  const [selectedAlgo, setSelectedAlgo] = useState(algorithms[0])
  const [activeTab, setActiveTab] = useState<'complexity'|'radar'|'growth'|'reference'|'cheatsheet'>('complexity')
  const [expandedQ, setExpandedQ] = useState<number|null>(null)

  const tabs = [
    { id:'complexity'  as const, label:'Complexity' },
    { id:'radar'       as const, label:'Radar Chart' },
    { id:'growth'      as const, label:'Growth Curves' },
    { id:'reference'   as const, label:'Algorithm Reference' },
    { id:'cheatsheet'  as const, label:'Interview Cheatsheet' },
  ]

  return (
    <div className="min-h-screen pt-20 px-6 pb-10">
      <div className="max-w-6xl mx-auto">

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-8">
          <div className="section-header">
            <h1 className="section-title">Reference & Interview Prep</h1>
          </div>
          <p className="section-subtitle">Everything you need to ace DSA interviews — complexity charts, algorithm deep-dives, and common interview questions answered</p>
        </motion.div>

        <div className="flex gap-2 flex-wrap mb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setActiveTab(t.id)}
              className="btn text-xs py-2 px-4"
              style={{background:activeTab===t.id?'var(--accent-primary)':'var(--bg-card)',
                border:'1px solid var(--border)',
                color:activeTab===t.id?'#fff':'var(--text-muted)',
                fontWeight: activeTab===t.id?'600':'400'}}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'complexity' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
            <div className="glass-card p-6 mb-4">
              <div className="font-semibold mb-1" style={{color:'var(--text-primary)',fontFamily:'Inter'}}>Time Complexity Comparison</div>
              <div className="text-xs mb-6" style={{color:'var(--text-muted)'}}>Relative operation count across Best / Average / Worst cases</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complexityData} barGap={2}>
                  <XAxis dataKey="algo" tick={{fill:'var(--text-muted)',fontSize:12,fontFamily:'Inter'}} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'8px',color:'var(--text-primary)',fontFamily:'Inter',fontSize:'12px'}} />
                  <Bar dataKey="best"  fill="#15803d" radius={[4,4,0,0]} name="Best Case" />
                  <Bar dataKey="avg"   fill="#2563eb" radius={[4,4,0,0]} name="Avg Case" />
                  <Bar dataKey="worst" fill="#dc2626" radius={[4,4,0,0]} name="Worst Case" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-4 justify-center">
                {[{c:'#15803d',l:'Best'},{c:'#2563eb',l:'Average'},{c:'#dc2626',l:'Worst'}].map(item=>(
                  <div key={item.l} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{background:item.c}} />
                    <span className="text-xs" style={{color:'var(--text-muted)'}}>{item.l} Case</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {bigO.map(item=>(
                <div key={item.notation} className="glass-card p-4" style={{borderLeft:'3px solid '+item.color}}>
                  <div className="text-base font-bold mb-0.5" style={{color:item.color,fontFamily:'JetBrains Mono, monospace'}}>{item.notation}</div>
                  <div className="text-xs font-semibold mb-2" style={{color:'var(--text-secondary)'}}>{item.name}</div>
                  <div className="text-xs" style={{color:'var(--text-muted)',lineHeight:1.6}}>{item.ex}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'radar' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
            <div className="glass-card p-6">
              <div className="font-semibold mb-1" style={{color:'var(--text-primary)'}}>Sorting Algorithm Comparison</div>
              <div className="text-xs mb-6" style={{color:'var(--text-muted)'}}>Higher score = better in that dimension. No algorithm wins on all dimensions.</div>
              <ResponsiveContainer width="100%" height={360}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{fill:'var(--text-muted)',fontSize:12,fontFamily:'Inter'}} />
                  <Radar name="Bubble" dataKey="Bubble" stroke="#dc2626" fill="#dc2626" fillOpacity={0.08} strokeWidth={2} />
                  <Radar name="Quick"  dataKey="Quick"  stroke="#2563eb" fill="#2563eb" fillOpacity={0.08} strokeWidth={2} />
                  <Radar name="Merge"  dataKey="Merge"  stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.08} strokeWidth={2} />
                  <Radar name="Heap"   dataKey="Heap"   stroke="#0891b2" fill="#0891b2" fillOpacity={0.08} strokeWidth={2} />
                  <Tooltip contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'8px',color:'var(--text-primary)',fontSize:'12px'}} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center flex-wrap">
                {[{c:'#dc2626',l:'Bubble'},{c:'#2563eb',l:'Quick'},{c:'#7c3aed',l:'Merge'},{c:'#0891b2',l:'Heap'}].map(item=>(
                  <div key={item.l} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{background:item.c}} />
                    <span className="text-xs" style={{color:'var(--text-muted)'}}>{item.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'growth' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
            <div className="glass-card p-6">
              <div className="font-semibold mb-1" style={{color:'var(--text-primary)'}}>Growth Rate Curves</div>
              <div className="text-xs mb-6" style={{color:'var(--text-muted)'}}>Operations count as input size n grows. Notice how O(n²) explodes compared to O(n log n).</div>
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={growthData}>
                  <XAxis dataKey="n" tick={{fill:'var(--text-muted)',fontSize:11,fontFamily:'Inter'}} axisLine={false} tickLine={false} label={{value:'n (input size)',position:'insideBottom',offset:-2,fill:'var(--text-muted)',fontSize:11}} />
                  <YAxis tick={{fill:'var(--text-muted)',fontSize:11}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'8px',color:'var(--text-primary)',fontFamily:'JetBrains Mono, monospace',fontSize:'11px'}} />
                  <Line type="monotone" dataKey="O(n2)"    stroke="#dc2626" strokeWidth={2} dot={false} name="O(n²)" />
                  <Line type="monotone" dataKey="O(nlogn)" stroke="#7c3aed" strokeWidth={2} dot={false} name="O(n log n)" />
                  <Line type="monotone" dataKey="O(n)"     stroke="#2563eb" strokeWidth={2} dot={false} name="O(n)" />
                  <Line type="monotone" dataKey="O(logn)"  stroke="#15803d" strokeWidth={2} dot={false} name="O(log n)" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-4 justify-center flex-wrap">
                {[{c:'#dc2626',l:'O(n²)'},{c:'#7c3aed',l:'O(n log n)'},{c:'#2563eb',l:'O(n)'},{c:'#15803d',l:'O(log n)'}].map(item=>(
                  <div key={item.l} className="flex items-center gap-2">
                    <div className="w-6 h-0.5" style={{background:item.c}} />
                    <span className="text-xs" style={{color:'var(--text-muted)',fontFamily:'JetBrains Mono, monospace'}}>{item.l}</span>
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
                    style={{border:selectedAlgo.name===a.name?'1px solid var(--accent-primary)':'1px solid var(--border-subtle)',
                      background:selectedAlgo.name===a.name?'var(--highlight)':undefined}}>
                    <div className="text-xs font-semibold" style={{color:selectedAlgo.name===a.name?'var(--accent-primary)':'var(--text-secondary)',fontFamily:'Inter'}}>{a.name}</div>
                    <div className="text-xs mt-0.5 flex gap-2">
                      <span style={{color:'var(--text-faint)',fontFamily:'JetBrains Mono, monospace'}}>{a.time}</span>
                      <span className="tag" style={{fontSize:'9px',padding:'1px 5px'}}>{a.category}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="md:col-span-2 glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-lg font-semibold mb-1 tracking-tight" style={{fontFamily:'Inter',color:'var(--text-primary)',letterSpacing:'-0.02em'}}>{selectedAlgo.name}</div>
                    <span className="tag">{selectedAlgo.category}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {[
                    {label:'Best Case',  val:selectedAlgo.best,              color:'#15803d'},
                    {label:'Avg/Worst',  val:selectedAlgo.time,              color:'var(--accent-primary)'},
                    {label:'Space',      val:selectedAlgo.space,             color:'#7c3aed'},
                    {label:'Stable',     val:selectedAlgo.stable?'Yes':'No', color:selectedAlgo.stable?'#15803d':'#dc2626'},
                    {label:'In-place',   val:selectedAlgo.inplace?'Yes':'No',color:selectedAlgo.inplace?'#15803d':'#dc2626'},
                  ].map(item=>(
                    <div key={item.label} className="p-3 rounded-lg" style={{background:'var(--bg-secondary)',border:'1px solid var(--border-subtle)'}}>
                      <div className="text-xs mb-1" style={{color:'var(--text-faint)',fontFamily:'Inter'}}>{item.label}</div>
                      <div className="text-sm font-bold" style={{color:item.color,fontFamily:'JetBrains Mono, monospace'}}>{item.val}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{color:'var(--text-faint)'}}>How it works</div>
                <div className="text-sm" style={{color:'var(--text-secondary)',lineHeight:1.8,fontFamily:'Inter'}}>{selectedAlgo.desc}</div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'cheatsheet' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
            <div className="glass-card p-5 mb-4" style={{background:'var(--highlight)',border:'1px solid var(--border)'}}>
              <div className="text-sm font-semibold mb-1" style={{color:'var(--accent-primary)',fontFamily:'Inter'}}>💡 How to use this</div>
              <div className="text-xs" style={{color:'var(--text-muted)',lineHeight:1.7}}>These are the most common DSA interview questions. Click any question to reveal a complete answer. Read through all of them before your interview.</div>
            </div>
            <div className="flex flex-col gap-2">
              {cheatsheet.map((item, i) => (
                <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                  className="glass-card overflow-hidden">
                  <button onClick={()=>setExpandedQ(expandedQ===i?null:i)}
                    className="w-full flex items-center justify-between p-4 text-left"
                    style={{background:'transparent',border:'none',cursor:'pointer'}}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{background:'var(--highlight)',color:'var(--accent-primary)',fontFamily:'JetBrains Mono, monospace',border:'1px solid var(--border)'}}>Q{i+1}</span>
                      <span className="text-sm font-medium" style={{color:'var(--text-primary)',fontFamily:'Inter',letterSpacing:'-0.01em'}}>{item.q}</span>
                    </div>
                    <span style={{color:'var(--text-faint)',fontSize:'18px',lineHeight:1,flexShrink:0,marginLeft:'12px'}}>
                      {expandedQ===i ? '−' : '+'}
                    </span>
                  </button>
                  {expandedQ===i && (
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}}
                      className="px-4 pb-4">
                      <div className="p-3 rounded-lg text-sm" style={{background:'var(--bg-secondary)',border:'1px solid var(--border-subtle)',color:'var(--text-secondary)',lineHeight:1.8,fontFamily:'Inter'}}>
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}
