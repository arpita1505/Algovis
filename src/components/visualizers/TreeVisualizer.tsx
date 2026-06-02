'use client'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

type NodeState = 'default' | 'comparing' | 'found' | 'inserted' | 'deleted' | 'path'

interface TreeNode {
  value: number
  left: TreeNode | null
  right: TreeNode | null
  state: NodeState
}

interface VisualNode { value: number; x: number; y: number; state: NodeState; id: string }
interface VisualEdge { x1: number; y1: number; x2: number; y2: number }


function getHeight(node: TreeNode | null): number {
  if (!node) return 0
  return 1 + Math.max(getHeight(node.left), getHeight(node.right))
}

function countNodes(node: TreeNode | null): number {
  if (!node) return 0
  return 1 + countNodes(node.left) + countNodes(node.right)
}

function isBalanced(node: TreeNode | null): boolean {
  if (!node) return true
  const lh = getHeight(node.left)
  const rh = getHeight(node.right)
  return Math.abs(lh - rh) <= 1 && isBalanced(node.left) && isBalanced(node.right)
}

function getMinHeight(node: TreeNode | null): number {
  if (!node) return 0
  return 1 + Math.min(getMinHeight(node.left), getMinHeight(node.right))
}
function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

function insertBST(root: TreeNode | null, val: number): TreeNode {
  if (!root) return { value: val, left: null, right: null, state: 'default' }
  if (val < root.value) return { ...root, left: insertBST(root.left, val) }
  if (val > root.value) return { ...root, right: insertBST(root.right, val) }
  return root
}

function deleteBST(root: TreeNode | null, val: number): TreeNode | null {
  if (!root) return null
  if (val < root.value) return { ...root, left: deleteBST(root.left, val) }
  if (val > root.value) return { ...root, right: deleteBST(root.right, val) }
  if (!root.left) return root.right
  if (!root.right) return root.left
  let min = root.right
  while (min.left) min = min.left
  return { ...root, value: min.value, right: deleteBST(root.right, min.value) }
}

function setNodeState(root: TreeNode | null, val: number, state: NodeState): TreeNode | null {
  if (!root) return null
  return {
    ...root,
    state: root.value === val ? state : root.state,
    left: setNodeState(root.left, val, state),
    right: setNodeState(root.right, val, state),
  }
}

function resetAllStates(root: TreeNode | null): TreeNode | null {
  if (!root) return null
  return { ...root, state: 'default', left: resetAllStates(root.left), right: resetAllStates(root.right) }
}

function setPathStates(root: TreeNode | null, path: number[]): TreeNode | null {
  if (!root) return null
  return {
    ...root,
    state: path.includes(root.value) ? 'path' : 'default',
    left: setPathStates(root.left, path),
    right: setPathStates(root.right, path),
  }
}

function getTreeDepth(node: TreeNode | null): number {
  if (!node) return 0
  return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right))
}

function getSubtreeWidth(node: TreeNode | null): number {
  if (!node) return 0
  if (!node.left && !node.right) return 1
  return getSubtreeWidth(node.left) + getSubtreeWidth(node.right)
}

function getVisuals(node: TreeNode | null, x: number, y: number, gap: number, id: string): { nodes: VisualNode[], edges: VisualEdge[] } {
  if (!node) return { nodes: [], edges: [] }
  const result: { nodes: VisualNode[], edges: VisualEdge[] } = {
    nodes: [{ value: node.value, x, y, state: node.state, id }],
    edges: []
  }
  const childY = y + 70
  const lWidth = getSubtreeWidth(node.left) || 0.5
  const rWidth = getSubtreeWidth(node.right) || 0.5
  const unit = Math.max(gap / (lWidth + rWidth), 30)
  const lx = x - rWidth * unit
  const rx = x + lWidth * unit
  if (node.left) {
    result.edges.push({ x1: x, y1: y, x2: lx, y2: childY })
    const l = getVisuals(node.left, lx, childY, unit * lWidth, id + 'L')
    result.nodes.push(...l.nodes); result.edges.push(...l.edges)
  }
  if (node.right) {
    result.edges.push({ x1: x, y1: y, x2: rx, y2: childY })
    const r = getVisuals(node.right, rx, childY, unit * rWidth, id + 'R')
    result.nodes.push(...r.nodes); result.edges.push(...r.edges)
  }
  return result
}

function getNodeFill(state: NodeState) {
  if (state === 'comparing') return '#ffb80033'
  if (state === 'found')     return '#00ff8833'
  if (state === 'inserted')  return '#00d4ff33'
  if (state === 'deleted')   return '#ff446633'
  if (state === 'path')      return '#7c3aed33'
  return 'var(--border)'
}
function getNodeStroke(state: NodeState) {
  if (state === 'comparing') return '#ffb800'
  if (state === 'found')     return '#00ff88'
  if (state === 'inserted')  return '#00d4ff'
  if (state === 'deleted')   return '#ff4466'
  if (state === 'path')      return '#7c3aed'
  return 'var(--border)'
}

export default function TreeVisualizer() {
  const [root, setRoot] = useState<TreeNode | null>(null)
  const [inputVal, setInputVal] = useState('')
  const [bulkInput, setBulkInput] = useState('')
  const [status, setStatus] = useState('')
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(50)
  const [traversalResult, setTraversalResult] = useState<number[]>([])
  const [traversalType, setTraversalType] = useState('')
  const rootRef = useRef<TreeNode | null>(null)

  const delay = () => Math.max(150, 900 - speed * 8)

  // Keep rootRef in sync so async functions always have latest tree
  const updateRoot = (newRoot: TreeNode | null) => {
    rootRef.current = newRoot
    setRoot(newRoot)
  }

  const handleInsert = async () => {
    const val = parseInt(inputVal)
    if (isNaN(val)) { setStatus('Please enter a valid number'); return }
    if (running) return
    setRunning(true)
    setTraversalResult([])

    // Animate traversal down to insertion point
    let current = rootRef.current
    const path: number[] = []

    while (current) {
      path.push(current.value)
      // Highlight current node being compared
      const highlighted = setNodeState(resetAllStates(rootRef.current), current.value, 'comparing')
      updateRoot(highlighted)
      if (val === current.value) {
        setStatus(val + ' already exists in the tree!')
        await sleep(delay())
        updateRoot(resetAllStates(rootRef.current))
        setRunning(false)
        return
      } else if (val < current.value) {
        setStatus('Is ' + val + ' < ' + current.value + '? YES → go LEFT')
        await sleep(delay())
        current = current.left
      } else {
        setStatus('Is ' + val + ' > ' + current.value + '? YES → go RIGHT')
        await sleep(delay())
        current = current.right
      }
    }

    // Show path taken then insert
    const withPath = setPathStates(resetAllStates(rootRef.current), path)
    updateRoot(withPath)
    setStatus('Found insertion spot! Inserting ' + val + '...')
    await sleep(delay())

    // Actually insert
    const newRoot = insertBST(resetAllStates(rootRef.current), val)
    const withInserted = setNodeState(newRoot, val, 'inserted')
    updateRoot(withInserted)
    setStatus('✓ Inserted ' + val + ' into BST!')
    setInputVal('')
    await sleep(delay() * 1.5)
    updateRoot(resetAllStates(rootRef.current))
    setRunning(false)
  }

  const handleSearch = async () => {
    const val = parseInt(inputVal)
    if (isNaN(val)) { setStatus('Please enter a valid number'); return }
    if (!rootRef.current) { setStatus('Tree is empty!'); return }
    if (running) return
    setRunning(true)
    setTraversalResult([])

    let current: TreeNode | null = rootRef.current
    let steps = 0

    while (current) {
      const highlighted = setNodeState(resetAllStates(rootRef.current), current.value, 'comparing')
      updateRoot(highlighted)
      steps++

      if (val === current.value) {
        setStatus('Comparing ' + val + ' with ' + current.value + ' — MATCH FOUND! (' + steps + ' steps)')
        await sleep(delay())
        const found = setNodeState(resetAllStates(rootRef.current), val, 'found')
        updateRoot(found)
        setStatus('✓ Found ' + val + ' in ' + steps + ' steps!')
        await sleep(delay() * 2)
        updateRoot(resetAllStates(rootRef.current))
        setRunning(false)
        return
      } else if (val < current.value) {
        setStatus('Comparing ' + val + ' with ' + current.value + ' — ' + val + ' is smaller → go LEFT')
        await sleep(delay())
        current = current.left
      } else {
        setStatus('Comparing ' + val + ' with ' + current.value + ' — ' + val + ' is larger → go RIGHT')
        await sleep(delay())
        current = current.right
      }
    }

    updateRoot(resetAllStates(rootRef.current))
    setStatus('✗ ' + val + ' not found in tree (searched ' + steps + ' nodes)')
    setRunning(false)
  }

  const handleDelete = async () => {
    const val = parseInt(inputVal)
    if (isNaN(val)) { setStatus('Please enter a valid number'); return }
    if (!rootRef.current) { setStatus('Tree is empty!'); return }
    if (running) return
    setRunning(true)
    setTraversalResult([])

    let current: TreeNode | null = rootRef.current
    let found = false

    while (current) {
      const highlighted = setNodeState(resetAllStates(rootRef.current), current.value, 'comparing')
      updateRoot(highlighted)

      if (val === current.value) {
        found = true
        setStatus('Found ' + val + ' — marking for deletion...')
        await sleep(delay())
        const marked = setNodeState(resetAllStates(rootRef.current), val, 'deleted')
        updateRoot(marked)
        await sleep(delay())
        break
      } else if (val < current.value) {
        setStatus('Searching... ' + val + ' < ' + current.value + ' → go LEFT')
        await sleep(delay())
        current = current.left
      } else {
        setStatus('Searching... ' + val + ' > ' + current.value + ' → go RIGHT')
        await sleep(delay())
        current = current.right
      }
    }

    if (!found) {
      setStatus('✗ ' + val + ' not found in tree')
      updateRoot(resetAllStates(rootRef.current))
      setRunning(false)
      return
    }

    const newRoot = deleteBST(resetAllStates(rootRef.current), val)
    updateRoot(newRoot)
    setStatus('✓ Deleted ' + val + ' from BST!')
    setInputVal('')
    setRunning(false)
  }

  const handleBulkInsert = () => {
    if (running) return
    const nums = bulkInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    if (nums.length === 0) { setStatus('Enter valid numbers separated by commas'); return }
    let r = rootRef.current
    nums.forEach(v => { r = insertBST(r!, v) })
    updateRoot(r)
    setStatus('Inserted: ' + nums.join(', '))
    setBulkInput('')
    setTraversalResult([])
  }

  const traverse = (node: TreeNode | null, type: string, result: number[]) => {
    if (!node) return
    if (type === 'inorder')   { traverse(node.left, type, result); result.push(node.value); traverse(node.right, type, result) }
    if (type === 'preorder')  { result.push(node.value); traverse(node.left, type, result); traverse(node.right, type, result) }
    if (type === 'postorder') { traverse(node.left, type, result); traverse(node.right, type, result); result.push(node.value) }
  }

  const handleTraverse = (type: string) => {
    if (!rootRef.current) { setStatus('Tree is empty!'); return }
    const result: number[] = []
    traverse(rootRef.current, type, result)
    setTraversalResult(result)
    setTraversalType(type)
    setStatus(type.charAt(0).toUpperCase() + type.slice(1) + ' traversal: ' + result.join(' → '))
  }

  const depth = root ? getTreeDepth(root) : 0
  const width = root ? getSubtreeWidth(root) : 1
  const initGap = Math.max(160, width * 38)
  const visuals = root ? getVisuals(root, 300, 50, initGap, 'root') : { nodes: [], edges: [] }

  return (
    <div className="min-h-screen pt-20 px-6 pb-10">
      <div className="max-w-6xl mx-auto">

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-8">
          <h1 className="text-2xl font-semibold mb-2" style={{fontFamily:'Inter, sans-serif',color:'var(--text-primary)'}}>⟁ BST Visualizer</h1>
          <p className="text-sm" style={{color:'var(--text-muted)'}}>Watch every comparison as values are inserted, searched and deleted step by step</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="glass-card p-5">
            <div className="text-sm font-semibold mb-3" style={{color:'var(--text-primary)',fontFamily:'Inter, sans-serif'}}>Single Operation</div>
            <input type="number" value={inputVal} onChange={e=>setInputVal(e.target.value)}
              placeholder="Enter a number..." disabled={running}
              onKeyDown={e=>e.key==='Enter'&&handleInsert()}
              style={{width:'100%',padding:'10px 14px',borderRadius:'8px',background:'var(--bg-primary)',
                border:'1px solid #2a2a3e',color:'var(--text-primary)',fontFamily:'JetBrains Mono, monospace',
                fontSize:'13px',outline:'none',marginBottom:'10px'}} />
            <div className="flex gap-2 flex-wrap">
              <button onClick={handleInsert} disabled={running} className="btn btn-green text-xs">+ Insert</button>
              <button onClick={handleSearch} disabled={running} className="btn btn-primary text-xs">⌕ Search</button>
              <button onClick={handleDelete} disabled={running} className="btn btn-danger text-xs">− Delete</button>
              <button onClick={()=>{updateRoot(null);setStatus('Tree cleared');setTraversalResult([])}} disabled={running} className="btn btn-amber text-xs">✕ Clear Tree</button>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="text-sm font-semibold mb-3" style={{color:'var(--text-primary)',fontFamily:'Inter, sans-serif'}}>Bulk Insert</div>
            <input type="text" value={bulkInput} onChange={e=>setBulkInput(e.target.value)}
              placeholder="e.g. 50, 30, 70, 20, 40, 60, 80" disabled={running}
              onKeyDown={e=>e.key==='Enter'&&handleBulkInsert()}
              style={{width:'100%',padding:'10px 14px',borderRadius:'8px',background:'var(--bg-primary)',
                border:'1px solid #2a2a3e',color:'var(--text-primary)',fontFamily:'JetBrains Mono, monospace',
                fontSize:'13px',outline:'none',marginBottom:'10px'}} />
            <button onClick={handleBulkInsert} disabled={running} className="btn btn-violet text-xs">Insert All at Once</button>
            <p className="text-xs mt-2" style={{color:'var(--text-faint)'}}>Builds tree instantly without animation</p>
          </div>
        </div>

        <div className="glass-card p-4 mb-4">
          <div className="text-sm font-semibold mb-3" style={{color:'var(--text-primary)',fontFamily:'Inter, sans-serif'}}>Traversals</div>
          <div className="flex gap-2 flex-wrap mb-3">
            {[
              {t:'inorder',   desc:'Left → Root → Right (gives sorted order!)'},
              {t:'preorder',  desc:'Root → Left → Right'},
              {t:'postorder', desc:'Left → Right → Root'},
            ].map(({t,desc}) => (
              <button key={t} onClick={()=>handleTraverse(t)} disabled={running}
                className="btn text-xs py-1.5 px-3"
                style={{background:traversalType===t?'#00d4ff22':'var(--bg-card)',
                  border:traversalType===t?'1px solid #00d4ff44':'1px solid #2a2a3e',
                  color:traversalType===t?'#00d4ff':'var(--text-muted)'}}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
                <span style={{color:'var(--text-faint)',fontSize:'10px',marginLeft:'4px'}}>{desc}</span>
              </button>
            ))}
          </div>
          {traversalResult.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {traversalResult.map((v,i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="px-2 py-1 rounded text-xs"
                    style={{background:'#00d4ff11',border:'1px solid #00d4ff22',
                      color:'#00d4ff',fontFamily:'JetBrains Mono, monospace'}}>{v}</span>
                  {i < traversalResult.length-1 && <span style={{color:'var(--text-faint)',fontSize:'10px'}}>→</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {root && (() => {
          const h = getHeight(root)
          const n = countNodes(root)
          const balanced = isBalanced(root)
          const minH = getMinHeight(root)
          const skewPct = Math.round(((h - minH) / Math.max(h, 1)) * 100)
          return (
            <div className="glass-card px-4 py-3 mb-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{balanced ? '✅' : '⚠️'}</span>
                <div>
                  <div className="text-xs font-semibold" style={{color: balanced ? 'var(--accent-green)' : 'var(--accent-amber)'}}>
                    {balanced ? 'Balanced Tree' : 'Unbalanced / Skewed Tree'}
                  </div>
                  <div className="text-xs" style={{color:'var(--text-faint)'}}>
                    {balanced ? 'Height is optimal for O(log n) operations' : 'Operations may degrade to O(n) — consider AVL or Red-Black tree'}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 ml-auto flex-wrap">
                {[
                  {label:'Height',   val:String(h),    color:'var(--accent-primary)'},
                  {label:'Nodes',    val:String(n),    color:'var(--accent-violet)'},
                  {label:'Min Height', val:String(minH), color:'var(--accent-green)'},
                  {label:'Skew',     val:skewPct+'%',  color: skewPct > 30 ? 'var(--accent-red)' : 'var(--accent-green)'},
                ].map(item => (
                  <div key={item.label} className="text-center">
                    <div className="text-xs" style={{color:'var(--text-faint)'}}>{item.label}</div>
                    <div className="text-sm font-bold" style={{color:item.color,fontFamily:'JetBrains Mono, monospace'}}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        <div className="glass-card px-4 py-3 mb-4 flex items-center gap-3" style={{minHeight:'48px'}}>
          <div className="w-2 h-2 rounded-full flex-shrink-0"
            style={{background:running?'#00ff88':'var(--text-faint)',boxShadow:running?'0 0 8px #00ff8888':'none'}} />
          <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:'13px',color:status?'var(--text-primary)':'var(--text-faint)'}}>
            {status || 'Insert a value to start building your BST...'}
          </span>
        </div>

        <div className="glass-card p-4 mb-4">
          <div className="flex justify-between text-xs mb-2" style={{color:'var(--text-muted)'}}>
            <span>Animation Speed</span>
            <span style={{color:'#00d4ff'}}>{speed}%</span>
          </div>
          <input type="range" min="1" max="100" value={speed}
            onChange={e=>setSpeed(Number(e.target.value))} disabled={running} />
        </div>

        <div className="glass-card p-6 mb-6" style={{minHeight:'440px',overflowX:'auto',overflowY:'auto'}}>
          {!root ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="text-5xl" style={{color:'var(--border)'}}>⟁</div>
              <div className="text-sm" style={{color:'var(--text-faint)'}}>Tree is empty</div>
              <div className="text-xs" style={{color:'var(--text-faint)'}}>Try inserting: 50, 30, 70, 20, 40</div>
            </div>
          ) : (
            <svg width="100%" height={Math.max(440, depth * 80 + 60)} viewBox={"0 0 600 " + Math.max(440, depth * 80 + 60)} style={{overflow:'visible'}}>
              {visuals.edges.map((e,i) => (
                <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                  stroke="#2a2a3e" strokeWidth="1.5" strokeOpacity="0.7" />
              ))}
              {visuals.nodes.map(node => (
                <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r={22}
                    fill={getNodeFill(node.state)}
                    stroke={getNodeStroke(node.state)}
                    strokeWidth={node.state!=='default'?2.5:1.5}
                    style={{transition:'fill 0.2s,stroke 0.2s',
                      filter:node.state!=='default'?'drop-shadow(0 0 8px '+getNodeStroke(node.state)+')':'none'}} />
                  <text x={node.x} y={node.y+1} textAnchor="middle" dominantBaseline="middle"
                    fontSize="12" fontWeight="600" fontFamily="JetBrains Mono, monospace"
                    fill={node.state!=='default'?getNodeStroke(node.state):'var(--text-muted)'}
                    style={{pointerEvents:'none'}}>
                    {node.value}
                  </text>
                </g>
              ))}
            </svg>
          )}
        </div>

        <div className="flex gap-4 flex-wrap">
          {[{c:'#ffb800',l:'Comparing — checking this node'},
            {c:'#7c3aed',l:'Path taken so far'},
            {c:'#00d4ff',l:'Just inserted'},
            {c:'#00ff88',l:'Found!'},
            {c:'#ff4466',l:'Being deleted'}].map(l=>(
            <div key={l.l} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{background:l.c,boxShadow:'0 0 6px '+l.c+'66'}} />
              <span className="text-xs" style={{color:'var(--text-muted)'}}>{l.l}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
