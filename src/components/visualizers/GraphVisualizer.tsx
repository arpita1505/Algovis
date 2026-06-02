'use client'
import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

type NodeState = 'default' | 'start' | 'end' | 'visited' | 'current' | 'path'
type Algorithm = 'bfs' | 'dfs' | 'dijkstra'
type EditMode = 'none' | 'addNode' | 'addEdge' | 'setStart' | 'setEnd' | 'delete'

interface Node { id: number; x: number; y: number; state: NodeState }
interface Edge { from: number; to: number; weight: number }

function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

function getNodeColor(state: NodeState) {
  if (state === 'start')   return '#00ff8833'
  if (state === 'end')     return '#ff446633'
  if (state === 'visited') return '#7c3aed33'
  if (state === 'current') return '#ffb80033'
  if (state === 'path')    return '#00d4ff33'
  return 'var(--border)'
}
function getNodeStroke(state: NodeState) {
  if (state === 'start')   return '#00ff88'
  if (state === 'end')     return '#ff4466'
  if (state === 'visited') return '#7c3aed'
  if (state === 'current') return '#ffb800'
  if (state === 'path')    return '#00d4ff'
  return 'var(--border)'
}

const INIT_NODES: Node[] = [
  { id:0, x:300, y:80,  state:'default' },
  { id:1, x:150, y:200, state:'default' },
  { id:2, x:450, y:200, state:'default' },
  { id:3, x:80,  y:340, state:'default' },
  { id:4, x:220, y:340, state:'default' },
  { id:5, x:380, y:340, state:'default' },
  { id:6, x:520, y:340, state:'default' },
  { id:7, x:150, y:460, state:'default' },
  { id:8, x:300, y:460, state:'default' },
  { id:9, x:450, y:460, state:'default' },
]
const INIT_EDGES: Edge[] = [
  {from:0,to:1,weight:4},{from:0,to:2,weight:3},{from:1,to:3,weight:2},
  {from:1,to:4,weight:5},{from:2,to:5,weight:1},{from:2,to:6,weight:6},
  {from:3,to:7,weight:3},{from:4,to:7,weight:2},{from:4,to:8,weight:4},
  {from:5,to:8,weight:3},{from:5,to:9,weight:2},{from:6,to:9,weight:1},
  {from:7,to:8,weight:1},{from:8,to:9,weight:2},
]

const algoInfo = {
  bfs:      { time:'O(V+E)', space:'O(V)', desc:'Explores level by level using a queue. Finds shortest path in unweighted graphs.' },
  dfs:      { time:'O(V+E)', space:'O(V)', desc:'Explores as deep as possible using recursion. Good for maze solving.' },
  dijkstra: { time:'O(V²)',  space:'O(V)', desc:'Finds shortest weighted path. Always picks minimum distance node.' },
}

export default function GraphVisualizer() {
  const [nodes, setNodes] = useState<Node[]>(INIT_NODES.map(n=>({...n})))
  const [edges, setEdges] = useState<Edge[]>(INIT_EDGES.map(e=>({...e})))
  const [algorithm, setAlgorithm] = useState<Algorithm>('bfs')
  const [startNode, setStartNode] = useState(0)
  const [endNode, setEndNode] = useState(9)
  const [speed, setSpeed] = useState(50)
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState('')
  const [visited, setVisited] = useState<number[]>([])
  const [path, setPath] = useState<number[]>([])
  const [visitedEdges, setVisitedEdges] = useState<{from:number,to:number}[]>([])
  const [pathEdges, setPathEdges] = useState<{from:number,to:number}[]>([])
  const [editMode, setEditMode] = useState<EditMode>('none')
  const [edgeFrom, setEdgeFrom] = useState<number|null>(null)
  const [edgeWeight, setEdgeWeight] = useState('1')
  const [editingEdge, setEditingEdge] = useState<{from:number,to:number}|null>(null)
  const [editWeight, setEditWeight] = useState('')
  const [nextId, setNextId] = useState(10)
  const stopRef = useRef(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const getDelay = () => Math.max(100, 800 - speed * 7)

  const resetViz = useCallback(() => {
    stopRef.current = true
    setRunning(false); setStatus('')
    setVisited([]); setPath([]); setVisitedEdges([]); setPathEdges([])
    setTimeout(() => {
      stopRef.current = false
      setNodes(prev => prev.map(n => ({...n, state:'default'})))
    }, 100)
  }, [])

  const resetAll = () => {
    stopRef.current = true
    setRunning(false); setStatus('')
    setVisited([]); setPath([]); setVisitedEdges([]); setPathEdges([])
    setEditMode('none'); setEdgeFrom(null); setNextId(10)
    setStartNode(0); setEndNode(9)
    setTimeout(() => {
      stopRef.current = false
      setNodes(INIT_NODES.map(n=>({...n})))
      setEdges(INIT_EDGES.map(e=>({...e})))
    }, 100)
  }

  const clearAll = () => {
    stopRef.current = true
    setRunning(false); setStatus('Canvas cleared — start building your graph!')
    setVisited([]); setPath([]); setVisitedEdges([]); setPathEdges([])
    setEditMode('addNode'); setEdgeFrom(null); setNextId(0)
    setStartNode(0); setEndNode(0)
    setTimeout(() => {
      stopRef.current = false
      setNodes([])
      setEdges([])
    }, 100)
  }

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (running || editMode === 'none') return
    const rect = svgRef.current!.getBoundingClientRect()
    const scaleX = 600 / rect.width
    const scaleY = 540 / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    if (editMode === 'addNode') {
      const tooClose = nodes.some(n => Math.hypot(n.x-x, n.y-y) < 40)
      if (tooClose) { setStatus('Too close to another node!'); return }
      setNodes(prev => [...prev, {id:nextId, x, y, state:'default'}])
      setStatus('Added node ' + nextId)
      setNextId(prev => prev+1)
    }
  }

  const handleNodeClick = (e: React.MouseEvent, nodeId: number) => {
    e.stopPropagation()
    if (running) return
    if (editMode === 'setStart') {
      setStartNode(nodeId); setStatus('Start node set to ' + nodeId); setEditMode('none')
    } else if (editMode === 'setEnd') {
      setEndNode(nodeId); setStatus('End node set to ' + nodeId); setEditMode('none')
    } else if (editMode === 'delete') {
      setNodes(prev => prev.filter(n => n.id !== nodeId))
      setEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId))
      if (startNode === nodeId) setStartNode(nodes.find(n=>n.id!==nodeId)?.id ?? 0)
      if (endNode === nodeId) setEndNode(nodes.find(n=>n.id!==nodeId)?.id ?? 0)
      setStatus('Deleted node ' + nodeId)
    } else if (editMode === 'addEdge') {
      if (edgeFrom === null) {
        setEdgeFrom(nodeId); setStatus('Edge from ' + nodeId + ' — now click target node')
      } else if (edgeFrom === nodeId) {
        setStatus('Cannot connect node to itself'); setEdgeFrom(null)
      } else {
        const exists = edges.some(e=>(e.from===edgeFrom&&e.to===nodeId)||(e.from===nodeId&&e.to===edgeFrom))
        if (exists) { setStatus('Edge already exists!'); setEdgeFrom(null); return }
        const w = parseInt(edgeWeight) || 1
        setEdges(prev => [...prev, {from:edgeFrom, to:nodeId, weight:w}])
        setStatus('Added edge ' + edgeFrom + ' → ' + nodeId + ' (weight ' + w + ')')
        setEdgeFrom(null)
      }
    }
  }

  const updateNode = (arr: Node[], id: number, state: NodeState) => {
    const idx = arr.findIndex(n=>n.id===id)
    if (idx !== -1) arr[idx] = {...arr[idx], state}
    setNodes([...arr])
  }

  async function bfs(arr: Node[]) {
    const ids = arr.map(n=>n.id)
    const adjList: Record<number,number[]> = {}
    ids.forEach(id => adjList[id]=[])
    edges.forEach(e => { adjList[e.from]?.push(e.to); adjList[e.to]?.push(e.from) })
    const visitedSet = new Set<number>()
    const parent: Record<number,number> = {}
    const queue = [startNode]; visitedSet.add(startNode)
    updateNode(arr, startNode, 'start')
    const vis: number[] = []; const vedges: {from:number,to:number}[] = []
    while (queue.length > 0) {
      if (stopRef.current) return
      const curr = queue.shift()!
      updateNode(arr, curr, curr===startNode?'start':'current')
      setStatus('Visiting node ' + curr + ' — Queue: [' + queue.join(', ') + ']')
      vis.push(curr); setVisited([...vis])
      await sleep(getDelay())
      if (curr === endNode) { setStatus('Found node ' + endNode + '!'); break }
      for (const nb of (adjList[curr]||[])) {
        if (!visitedSet.has(nb)) {
          visitedSet.add(nb); parent[nb]=curr; queue.push(nb)
          updateNode(arr, nb, 'visited')
          vedges.push({from:curr,to:nb}); setVisitedEdges([...vedges])
          await sleep(getDelay()/2)
        }
      }
      if (curr!==startNode&&curr!==endNode) updateNode(arr, curr, 'visited')
    }
    await tracePath(arr, parent)
  }

  async function dfs(arr: Node[]) {
    const adjList: Record<number,number[]> = {}
    arr.forEach(n => adjList[n.id]=[])
    edges.forEach(e => { adjList[e.from]?.push(e.to); adjList[e.to]?.push(e.from) })
    const visitedSet = new Set<number>()
    const parent: Record<number,number> = {}
    let found = false
    const vis: number[] = []; const vedges: {from:number,to:number}[] = []
    async function helper(node: number) {
      if (stopRef.current||found) return
      visitedSet.add(node)
      updateNode(arr, node, node===startNode?'start':'current')
      setStatus('DFS visiting node ' + node)
      vis.push(node); setVisited([...vis])
      await sleep(getDelay())
      if (node===endNode) { found=true; return }
      for (const nb of (adjList[node]||[])) {
        if (!visitedSet.has(nb)) {
          parent[nb]=node
          vedges.push({from:node,to:nb}); setVisitedEdges([...vedges])
          await helper(nb); if (found) return
        }
      }
      if (node!==startNode&&node!==endNode) updateNode(arr, node, 'visited')
    }
    await helper(startNode)
    await tracePath(arr, parent)
  }

  async function dijkstra(arr: Node[]) {
    const dist: Record<number,number> = {}
    const parent: Record<number,number> = {}
    const visitedSet = new Set<number>()
    arr.forEach(n => dist[n.id]=Infinity)
    dist[startNode]=0
    const vis: number[] = []; const vedges: {from:number,to:number}[] = []
    for (let iter=0; iter<arr.length; iter++) {
      if (stopRef.current) return
      let u = -1
      for (const n of arr) {
        if (!visitedSet.has(n.id) && (u===-1||dist[n.id]<dist[u])) u=n.id
      }
      if (u===-1||dist[u]===Infinity) break
      visitedSet.add(u)
      updateNode(arr, u, u===startNode?'start':'current')
      setStatus('Node ' + u + ' — dist: ' + dist[u] + ' — relaxing neighbors...')
      vis.push(u); setVisited([...vis])
      await sleep(getDelay())
      if (u===endNode) break
      for (const e of edges) {
        let nb=-1, w=0
        if (e.from===u){nb=e.to;w=e.weight} else if (e.to===u){nb=e.from;w=e.weight}
        if (nb!==-1&&!visitedSet.has(nb)&&dist[u]+w<dist[nb]) {
          dist[nb]=dist[u]+w; parent[nb]=u
          updateNode(arr, nb, 'visited')
          vedges.push({from:u,to:nb}); setVisitedEdges([...vedges])
          setStatus('Updated dist['+nb+'] = '+dist[nb])
          await sleep(getDelay()/2)
        }
      }
      if (u!==startNode&&u!==endNode) updateNode(arr, u, 'visited')
    }
    await tracePath(arr, parent)
  }

  async function tracePath(arr: Node[], parent: Record<number,number>) {
    if (parent[endNode]===undefined&&startNode!==endNode) {
      setStatus('No path found from '+startNode+' to '+endNode); return
    }
    const p: number[] = []; let curr = endNode
    while (curr!==undefined) { p.unshift(curr); curr=parent[curr] }
    setPath(p)
    const pedges: {from:number,to:number}[] = []
    for (let i=0;i<p.length-1;i++) pedges.push({from:p[i],to:p[i+1]})
    setPathEdges(pedges)
    setStatus('Path: '+p.join(' → ')+' ('+( p.length-1)+' steps)')
    for (const id of p) {
      if (stopRef.current) return
      updateNode(arr, id, id===startNode?'start':id===endNode?'end':'path')
      await sleep(150)
    }
  }

  const startAlgo = async () => {
    if (running) return
    setRunning(true); stopRef.current=false
    setStatus(''); setVisited([]); setPath([]); setVisitedEdges([]); setPathEdges([])
    const arr = nodes.map(n=>({...n, state:'default' as NodeState}))
    if (algorithm==='bfs') await bfs(arr)
    else if (algorithm==='dfs') await dfs(arr)
    else await dijkstra(arr)
    setRunning(false)
  }

  const isPathEdge = (f:number,t:number) => pathEdges.some(e=>(e.from===f&&e.to===t)||(e.from===t&&e.to===f))
  const isVisitedEdge = (f:number,t:number) => visitedEdges.some(e=>(e.from===f&&e.to===t)||(e.from===t&&e.to===f))

  const modeButtons: {mode:EditMode, label:string, color:string}[] = [
    {mode:'addNode',  label:'+ Add Node',   color:'#00d4ff'},
    {mode:'addEdge',  label:'+ Add Edge',   color:'#7c3aed'},
    {mode:'setStart', label:'Set Start',    color:'#00ff88'},
    {mode:'setEnd',   label:'Set End',      color:'#ff4466'},
    {mode:'delete',   label:'Delete Node',  color:'#ff4466'},
  ]

  const handleEdgeClick = (e: React.MouseEvent, from: number, to: number) => {
    e.stopPropagation()
    if (running || editMode !== 'none') return
    const edge = edges.find(ed => (ed.from===from&&ed.to===to)||(ed.from===to&&ed.to===from))
    if (!edge) return
    setEditingEdge({from, to})
    setEditWeight(String(edge.weight))
    setStatus('Editing edge ' + from + ' → ' + to + ' weight')
  }

  const saveEdgeWeight = () => {
    const w = parseInt(editWeight)
    if (isNaN(w) || w < 1) { setEditingEdge(null); return }
    setEdges(prev => prev.map(e =>
      (e.from===editingEdge!.from&&e.to===editingEdge!.to)||(e.from===editingEdge!.to&&e.to===editingEdge!.from)
        ? {...e, weight: w} : e
    ))
    setStatus('Updated edge weight to ' + w)
    setEditingEdge(null)
  }

  return (
    <div className="min-h-screen pt-20 px-6 pb-10">
      <div className="max-w-6xl mx-auto">

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-8">
          <h1 className="text-2xl font-semibold mb-2" style={{fontFamily:'Inter, sans-serif',color:'var(--text-primary)'}}>◎ Graph Visualizer</h1>
          <p className="text-sm" style={{color:'var(--text-muted)'}}>Build your own graph, then watch BFS, DFS or Dijkstra traverse it</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['bfs','dfs','dijkstra'] as Algorithm[]).map(algo => (
            <button key={algo} onClick={() => {if(!running) setAlgorithm(algo)}}
              className="glass-card p-4 text-left transition-all"
              style={{border:algorithm===algo?'1px solid #7c3aed44':'1px solid transparent',background:algorithm===algo?'#7c3aed0a':undefined}}>
              <div className="text-sm font-semibold uppercase mb-1" style={{color:algorithm===algo?'#a78bfa':'var(--text-muted)',fontFamily:'Inter, sans-serif'}}>{algo}</div>
              <div className="text-xs" style={{color:'var(--text-faint)',fontFamily:'JetBrains Mono, monospace'}}>{algoInfo[algo].time}</div>
            </button>
          ))}
        </div>

        <div className="glass-card p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1"><div className="text-xs mb-1" style={{color:'var(--text-faint)'}}>How it works</div>
            <div className="text-sm" style={{color:'var(--text-secondary)'}}>{algoInfo[algorithm].desc}</div></div>
          <div className="flex gap-4 flex-wrap items-center">
            <div><div className="text-xs mb-1" style={{color:'var(--text-faint)'}}>Start</div>
              <select value={startNode} onChange={e=>{if(!running)setStartNode(Number(e.target.value))}}
                style={{background:'var(--bg-primary)',border:'1px solid #2a2a3e',color:'#00ff88',borderRadius:'6px',padding:'4px 8px',fontFamily:'JetBrains Mono, monospace',fontSize:'13px'}}>
                {nodes.map(n=><option key={n.id} value={n.id}>{n.id}</option>)}
              </select></div>
            <div><div className="text-xs mb-1" style={{color:'var(--text-faint)'}}>End</div>
              <select value={endNode} onChange={e=>{if(!running)setEndNode(Number(e.target.value))}}
                style={{background:'var(--bg-primary)',border:'1px solid #2a2a3e',color:'#ff4466',borderRadius:'6px',padding:'4px 8px',fontFamily:'JetBrains Mono, monospace',fontSize:'13px'}}>
                {nodes.map(n=><option key={n.id} value={n.id}>{n.id}</option>)}
              </select></div>
            <div className="text-center"><div className="text-xs mb-1" style={{color:'var(--text-faint)'}}>Visited</div>
              <div className="text-sm font-bold" style={{color:'#7c3aed',fontFamily:'JetBrains Mono, monospace'}}>{visited.length}</div></div>
            <div className="text-center"><div className="text-xs mb-1" style={{color:'var(--text-faint)'}}>Path</div>
              <div className="text-sm font-bold" style={{color:'#00d4ff',fontFamily:'JetBrains Mono, monospace'}}>{path.length>0?path.length-1:0} steps</div></div>
          </div>
        </div>

        <div className="glass-card p-4 mb-4">
          <div className="text-xs mb-3 font-semibold" style={{color:'var(--text-muted)',fontFamily:'Inter, sans-serif'}}>GRAPH EDITOR</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {modeButtons.map(b => (
              <button key={b.mode} onClick={()=>{ if(running) return; setEditMode(editMode===b.mode?'none':b.mode); setEdgeFrom(null) }}
                className="btn text-xs py-1.5 px-3"
                style={{
                  background: editMode===b.mode ? b.color+'22' : 'var(--bg-card)',
                  border: editMode===b.mode ? '1px solid '+b.color+'66' : '1px solid #2a2a3e',
                  color: editMode===b.mode ? b.color : 'var(--text-muted)',
                }}>
                {b.label}{editMode===b.mode?' ✓':''}
              </button>
            ))}
            {editMode==='addEdge' && (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-xs" style={{color:'var(--text-faint)'}}>Weight:</span>
                <input type="number" min="1" max="99" value={edgeWeight}
                  onChange={e=>setEdgeWeight(e.target.value)}
                  style={{width:'52px',padding:'4px 8px',borderRadius:'6px',background:'var(--bg-primary)',
                    border:'1px solid #2a2a3e',color:'#a78bfa',fontFamily:'JetBrains Mono, monospace',fontSize:'13px',outline:'none'}} />
              </div>
            )}
          </div>
          <div className="text-xs" style={{color:'var(--text-faint)'}}>
            {editMode==='addNode' && '🖱 Click empty space on the graph to add a node'}
            {editMode==='addEdge' && (edgeFrom===null ? '🖱 Click first node to start edge' : '🖱 Now click target node (from: '+edgeFrom+')')}
            {editMode==='setStart' && '🖱 Click any node to set it as start'}
            {editMode==='setEnd' && '🖱 Click any node to set it as end'}
            {editMode==='delete' && '🖱 Click any node to delete it and its edges'}
            {editMode==='none' && 'Select an edit mode above — or click any edge to edit its weight (useful for Dijkstra!)'}
          </div>
        </div>

        <div className="glass-card px-4 py-3 mb-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:running?'#00ff88':'var(--text-faint)',boxShadow:running?'0 0 8px #00ff8888':'none'}} />
          <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:'13px',color:status?'var(--text-primary)':'var(--text-faint)'}}>
            {status || 'Select algorithm and press Start...'}
          </span>
        </div>

        <div className="glass-card p-2 mb-6" style={{cursor: editMode==='addNode'?'crosshair':editMode!=='none'?'pointer':'default'}}>
          <svg ref={svgRef} width="100%" height="540" viewBox="0 0 600 540" onClick={handleSvgClick}>
            {edges.map((edge,i) => {
              const f=nodes.find(n=>n.id===edge.from); const t=nodes.find(n=>n.id===edge.to)
              if(!f||!t) return null
              const isP=isPathEdge(edge.from,edge.to); const isV=isVisitedEdge(edge.from,edge.to)
              const mx=(f.x+t.x)/2; const my=(f.y+t.y)/2
              return (
                <g key={i}>
                  <line x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                    onClick={e=>handleEdgeClick(e,edge.from,edge.to)}
                    strokeWidth="12" stroke="transparent" style={{cursor:'pointer'}} />
                  <line x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                    stroke={isP?'#00d4ff':isV?'#7c3aed':edgeFrom!==null?'#2a2a3e44':'var(--border)'}
                    strokeWidth={isP?3:isV?2:1.5} strokeOpacity={isP?1:isV?0.8:0.6}
                    style={{transition:'stroke 0.3s'}} />
                  <text x={mx} y={my-6} textAnchor="middle" fontSize="10"
                    fill={isP?'#00d4ff':algorithm==='dijkstra'?'var(--text-faint)':'transparent'}
                    fontFamily="JetBrains Mono, monospace">{edge.weight}</text>
                </g>
              )
            })}
            {nodes.map(node => (
              <g key={node.id} style={{cursor:'pointer'}} onClick={e=>handleNodeClick(e,node.id)}>
                <circle cx={node.x} cy={node.y} r={24}
                  fill={getNodeColor(node.state)} stroke={getNodeStroke(node.state)}
                  strokeWidth={node.state!=='default'?2.5:edgeFrom===node.id?3:1.5}
                  style={{transition:'fill 0.3s,stroke 0.3s',
                    filter: edgeFrom===node.id?'drop-shadow(0 0 8px #7c3aed)':node.state!=='default'?'drop-shadow(0 0 6px '+getNodeStroke(node.state)+')':'none'}} />
                <text x={node.x} y={node.y+1} textAnchor="middle" dominantBaseline="middle"
                  fontSize="13" fontWeight="600" fontFamily="JetBrains Mono, monospace"
                  fill={node.state!=='default'?getNodeStroke(node.state):'var(--text-muted)'} style={{pointerEvents:'none'}}>
                  {node.id}
                </text>
                {(node.id===startNode||node.id===endNode) && (
                  <text x={node.x} y={node.y+38} textAnchor="middle" fontSize="9"
                    fill={node.id===startNode?'#00ff88':'#ff4466'} fontFamily="DM Sans, sans-serif" style={{pointerEvents:'none'}}>
                    {node.id===startNode?'START':'END'}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        {editingEdge && (
          <div className="glass-card p-4 mb-4 flex items-center gap-4"
            style={{border:'1px solid rgba(255,184,0,0.3)',background:'rgba(255,184,0,0.05)'}}>
            <div className="text-sm" style={{color:'var(--text-primary)',fontFamily:'Inter, sans-serif'}}>
              Edit edge <span style={{color:'var(--accent-amber)'}}>{editingEdge.from} → {editingEdge.to}</span> weight:
            </div>
            <input type="number" value={editWeight} onChange={e=>setEditWeight(e.target.value)}
              min="1" max="99" autoFocus
              onKeyDown={e=>{ if(e.key==='Enter') saveEdgeWeight(); if(e.key==='Escape') setEditingEdge(null) }}
              style={{width:'70px',padding:'6px 10px',borderRadius:'6px',background:'var(--bg-input)',
                border:'1px solid var(--accent-amber)',color:'var(--text-primary)',
                fontFamily:'JetBrains Mono, monospace',fontSize:'14px',outline:'none'}} />
            <button onClick={saveEdgeWeight} className="btn btn-amber text-xs py-1.5">Save</button>
            <button onClick={()=>setEditingEdge(null)} className="btn text-xs py-1.5"
              style={{background:'transparent',border:'1px solid var(--border)',color:'var(--text-muted)'}}>Cancel</button>
            <span className="text-xs" style={{color:'var(--text-faint)'}}>Press Enter to save, Escape to cancel</span>
          </div>
        )}

        <div className="flex gap-4 mb-6 flex-wrap">
          {[{c:'var(--border)',s:'var(--border)',l:'Unvisited'},{c:'#00ff8833',s:'#00ff88',l:'Start'},
            {c:'#ff446633',s:'#ff4466',l:'End'},{c:'#ffb80033',s:'#ffb800',l:'Current'},
            {c:'#7c3aed33',s:'#7c3aed',l:'Visited'},{c:'#00d4ff33',s:'#00d4ff',l:'Shortest Path'}].map(l=>(
            <div key={l.l} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2" style={{background:l.c,borderColor:l.s}} />
              <span className="text-xs" style={{color:'var(--text-muted)'}}>{l.l}</span>
            </div>
          ))}
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex-1 min-w-40">
              <div className="flex justify-between text-xs mb-2" style={{color:'var(--text-muted)'}}>
                <span>Speed</span><span style={{color:'#a78bfa'}}>{speed}%</span>
              </div>
              <input type="range" min="1" max="100" value={speed} onChange={e=>setSpeed(Number(e.target.value))} disabled={running} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={startAlgo} disabled={running} className="btn btn-green">{running?'⟳ Running...':'▶ Start'}</button>
            <button onClick={resetViz} disabled={running} className="btn btn-primary">↺ Reset Visualization</button>
            <button onClick={resetAll} disabled={running} className="btn btn-danger">⟳ Reset to Default</button>
            <button onClick={clearAll} disabled={running} className="btn btn-amber">✕ Clear Canvas</button>
          </div>
        </div>

      </div>
    </div>
  )
}
