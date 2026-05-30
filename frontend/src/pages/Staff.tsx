import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface StaffMember {
  id: number
  username: string
  employeeCode: string
  taskCount: number
}

interface EmployeeTask {
  id: number
  title: string
  description: string
  status: string
  createdAt: string
  completedAt: string | null
  assignedTo: string
  employeeCode: string | null
}

const Staff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [tasks, setTasks] = useState<EmployeeTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', employeeCode: '' })
  const navigate = useNavigate()

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'Supplier') {
      navigate('/dashboard') // Only managers can access this
      return
    }
    fetchData()
  }, [navigate])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }
      
      const [staffRes, tasksRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/staff`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/staff/tasks`, { headers })
      ])

      if (staffRes.ok) setStaff(await staffRes.json())
      if (tasksRes.ok) setTasks(await tasksRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTask)
      })

      if (res.ok) {
        setShowAssignModal(false)
        setNewTask({ title: '', description: '', employeeCode: '' })
        fetchData()
      } else {
        alert(await res.text())
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="page-title">Staff & Team Management</h2>
          <p className="page-subtitle">View employees and assign tasks</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAssignModal(true)}>+ Assign Task</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Team Members List */}
        <div className="stat-card" style={{ padding: '0', overflow: 'hidden', alignSelf: 'start' }}>
          <h3 style={{ padding: '16px', margin: 0, borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)' }}>My Team</h3>
          {staff.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No employees registered yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {staff.map(member => (
                <div key={member.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#fff' }}>{member.username}</div>
                    <div style={{ fontSize: '12px', color: 'var(--brand-red)', fontFamily: 'monospace' }}>{member.employeeCode}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-dark)', padding: '4px 8px', borderRadius: '4px' }}>
                    {member.taskCount} tasks pending
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div className="stat-card" style={{ padding: '0', overflow: 'hidden', alignSelf: 'start' }}>
          <h3 style={{ padding: '16px', margin: 0, borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)' }}>Task History</h3>
          {tasks.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No tasks assigned yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)', fontSize: '12px' }}>
                  <th style={{ padding: '12px 16px' }}>Title</th>
                  <th style={{ padding: '12px 16px' }}>Assigned To</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ color: '#fff', fontWeight: '500' }}>{task.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{task.description}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div>{task.assignedTo}</div>
                      <div style={{ fontSize: '12px', color: 'var(--brand-red)', fontFamily: 'monospace' }}>{task.employeeCode}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: task.status === 'Completed' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: task.status === 'Completed' ? '#10b981' : '#ef4444'
                      }}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAssignModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="stat-card" style={{ width: '400px', padding: '24px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Assign New Task</h3>
            <form onSubmit={handleAssignTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Task Title</label>
                <input required type="text" className="input-field" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Description</label>
                <textarea required className="input-field" rows={3} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}></textarea>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Assign to Employee (Code)</label>
                <select required className="input-field" value={newTask.employeeCode} onChange={e => setNewTask({...newTask, employeeCode: e.target.value})}>
                  <option value="">Select Employee...</option>
                  {staff.map(s => <option key={s.id} value={s.employeeCode}>{s.username} ({s.employeeCode})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn-outline" onClick={() => setShowAssignModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Staff
