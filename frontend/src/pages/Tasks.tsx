import { useState, useEffect } from 'react'

interface Task {
  id: number
  title: string
  description: string
  status: 'Pending' | 'InProgress' | 'Completed'
  assignedUser?: { username: string }
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleGenerateAITasks = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/generate-ai`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      await fetchTasks()
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('taskId', id.toString())
  }

  const handleDrop = async (e: React.DragEvent, status: 'Pending' | 'InProgress' | 'Completed') => {
    const id = parseInt(e.dataTransfer.getData('taskId'))

    // Optimsitic UI update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))

    if (status === 'Completed') {
      try {
        const token = localStorage.getItem('token')
        await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${id}/complete`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const renderColumn = (title: string, status: 'Pending' | 'InProgress' | 'Completed', colorClass: string) => {
    const columnTasks = tasks.filter(t => t.status === status)

    return (
      <div
        className="kanban-column glass-panel"
        onDrop={(e) => handleDrop(e, status)}
        onDragOver={handleDragOver}
      >
        <h3 className={`column-title ${colorClass}`}>{title} <span>{columnTasks.length}</span></h3>
        <div className="task-list">
          {columnTasks.map(task => (
            <div
              key={task.id}
              className="task-card"
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
            >
              <div className="task-header">
                <h4>{task.title}</h4>
                <span className="task-id">#{task.id}</span>
              </div>
              <p>{task.description}</p>
              <div className="task-footer">
                <span className="assigned-to">
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  {task.assignedUser?.username || 'Unassigned'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="tasks-container">
      <div className="tasks-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="brand-title">Mission Control <span>(Tasks)</span></h1>
          <p className="brand-subtitle">Drag and drop shipments and warehouse duties.</p>
        </div>
        <button onClick={handleGenerateAITasks} className="glass-btn" style={{ width: 'auto', padding: '12px 24px' }}>
          ✨ Auto-Assign AI Tasks
        </button>
      </div>

      {loading ? (
        <div className="spinner-wrapper"><div className="liquid-spinner"></div></div>
      ) : (
        <div className="kanban-board">
          {renderColumn('Pending', 'Pending', 'text-red')}
          {renderColumn('In Progress', 'InProgress', 'text-blue')}
          {renderColumn('Completed', 'Completed', 'text-green')}
        </div>
      )}

      <style>{`
        .tasks-container {
          padding: 32px;
          min-height: 100vh;
          background: #09090b;
          color: white;
          font-family: 'Outfit', sans-serif;
        }

        .tasks-header {
          margin-bottom: 40px;
        }

        .brand-title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          background: linear-gradient(to right, #E11D48, #ff4d6d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .brand-title span {
          color: #a1a1aa;
          -webkit-text-fill-color: initial;
          font-weight: 300;
          font-size: 24px;
        }

        .brand-subtitle {
          color: #a1a1aa;
          font-size: 16px;
        }

        .kanban-board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          height: calc(100vh - 160px);
        }

        .glass-panel {
          background: rgba(24, 24, 27, 0.6);
          backdrop-filter: blur(24px) saturate(200%);
          border: 1px solid rgba(225, 29, 72, 0.15); /* Red tinted border */
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .column-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 12px;
        }
        
        .column-title span {
          background: rgba(255,255,255,0.1);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }

        .text-red { color: #fca5a5; }
        .text-blue { color: #7dd3fc; }
        .text-green { color: #6ee7b7; }

        .task-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-right: 8px;
        }

        /* Custom Scrollbar */
        .task-list::-webkit-scrollbar { width: 6px; }
        .task-list::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
        .task-list::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.3); border-radius: 10px; }

        .task-card {
          background: rgba(9, 9, 11, 0.8);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 16px;
          cursor: grab;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .task-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; height: 100%; width: 4px;
          background: #E11D48;
          opacity: 0;
          transition: 0.3s ease;
        }

        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.4);
          border-color: rgba(225, 29, 72, 0.4);
        }

        .task-card:hover::before { opacity: 1; }
        .task-card:active { cursor: grabbing; transform: scale(0.98); }

        .task-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .task-header h4 { margin: 0; font-size: 15px; color: #f4f4f5; }
        .task-id { font-size: 12px; color: #71717a; font-family: monospace; }
        
        .task-card p {
          font-size: 13px;
          color: #a1a1aa;
          margin: 0 0 16px 0;
          line-height: 1.4;
        }

        .task-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px dashed rgba(255,255,255,0.1);
          padding-top: 12px;
        }

        .assigned-to {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #d4d4d8;
          background: rgba(255,255,255,0.05);
          padding: 4px 8px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  )
}

export default Tasks
