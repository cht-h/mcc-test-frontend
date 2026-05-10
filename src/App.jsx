import { useState } from 'react'
import './App.css'

const initialTree = [
  {
    id: '1',
    name: 'Node 1',
    children: [
      {
        id: '2',
        name: 'Node 2',
        children: [
          { id: '3', name: 'Node 3', children: [] },
          { id: '4', name: 'Node 4', children: [] },
        ]
      },
      { id: '5', name: 'Node 5', children: [] },
    ]
  }
]

function createIdGenerator(start = 6) {
  let counter = start
  return () => String(counter++)
}

const generateId = createIdGenerator()

function cloneTree(tree) {
  return tree.map(node => ({
    ...node,
    children: cloneTree(node.children)
  }))
}

function updateTree(nodes, id, updater) {
  return nodes.map(node => {
    if (node.id === id) {
      return updater(node)
    }

    return {
      ...node,
      children: updateTree(node.children, id, updater)
    }
  })
}

function removeFromTree(nodes, id) {
  return nodes
    .filter(node => node.id !== id)
    .map(node => ({
      ...node,
      children: removeFromTree(node.children, id)
    }))
}

export default function App() {
  const [tree, setTree] = useState(initialTree)
  const [selectedId, setSelectedId] = useState(null)
  const [editingId, setEditingId] = useState(null)

  function addNode() {
    const newNode = { id: generateId(), name: 'New Node', children: [] }

    setTree(prev => {
      if (!selectedId) return [...prev, newNode]

      return updateTree(prev, selectedId, node => ({
        ...node,
        children: [...node.children, newNode]
      }))
    })
  }

  function removeNode() {
    if (!selectedId) return

    setTree(prev => removeFromTree(prev, selectedId))
    setSelectedId(null)
    setEditingId(null)
  }

  function startEdit() {
    if (selectedId) setEditingId(selectedId)
  }

  function saveEdit(id, value) {
    const name = value.trim()
    if (!name) return

    setTree(prev =>
      updateTree(prev, id, node => ({
        ...node,
        name
      }))
    )

    setEditingId(null)
  }

  function reset() {
    setTree(cloneTree(initialTree))
    setSelectedId(null)
    setEditingId(null)
  }

  return (
    <div className="app">
      <h1>Tree</h1>

      <div className="tree-container">
        {tree.length === 0 ? (
          <p className="empty-message">Tree is empty</p>
        ) : (
          tree.map(node => (
            <TreeNode
              key={node.id}
              node={node}
              selectedId={selectedId}
              editingId={editingId}
              setSelectedId={setSelectedId}
              setEditingId={setEditingId}
              saveEdit={saveEdit}
              isRoot
            />
          ))
        )}
      </div>

      <div className="buttons">
        <button onClick={addNode}>Add</button>
        <button onClick={removeNode}>Remove</button>
        <button onClick={startEdit}>Edit</button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  )
}

function TreeNode({
  node,
  selectedId,
  editingId,
  setSelectedId,
  setEditingId,
  saveEdit,
  isRoot = false
}) {
  const isSelected = node.id === selectedId
  const isEditing = node.id === editingId

  function select(e) {
    e.stopPropagation()
    setSelectedId(node.id)
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      saveEdit(node.id, e.target.value)
    }

    if (e.key === 'Escape') {
      setEditingId(null)
    }
  }

  return (
    <div className={`tree-node ${isRoot ? 'root-node' : ''}`} onClick={select}>
      {isEditing ? (
        <input
          className="node-input"
          defaultValue={node.name}
          autoFocus
          onKeyDown={onKeyDown}
          onBlur={e => saveEdit(node.id, e.target.value)}
        />
      ) : (
        <div
          className={`node-label ${isSelected ? 'selected' : ''}`}
          onDoubleClick={() => setEditingId(node.id)}
        >
          {node.name}
        </div>
      )}

      {node.children.length > 0 && (
        <div className="node-children">
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              editingId={editingId}
              setSelectedId={setSelectedId}
              setEditingId={setEditingId}
              saveEdit={saveEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}