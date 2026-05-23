import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, CheckCircle, Circle, Trash2, Edit2 } from 'lucide-react';

const API_BASE = 'https://avidus-interactive-tds5.onrender.com/api/tasks';

function UserDashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const getToken = () => localStorage.getItem('token');

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  });

  // ── GET all tasks ──
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch(API_BASE, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch tasks');

        setTasks(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  // ── POST / PUT (create or edit) ──
  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      if (isEditMode && editingTaskId) {
        // ── PATCH (edit) ──
        const res = await fetch(`${API_BASE}/${editingTaskId}`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({
            title: newTaskTitle,
            description: newTaskDesc
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update task');

        setTasks(tasks.map(t =>
          t._id === editingTaskId ? data.data : t
        ));
      } else {
        // ── POST (create) ──
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            title: newTaskTitle,
            description: newTaskDesc
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create task');

        setTasks([data.data, ...tasks]);
      }

      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  // ── PATCH toggle status ──
  const toggleTaskStatus = async (id) => {
    try {
      const task = tasks.find(t => t._id === id);
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: !task.status })
      });

      if (!res.ok) throw new Error('Failed to update task status');

      setTasks(tasks.map(t =>
        t._id === id ? { ...t, status: !t.status } : t
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  // ── DELETE ──
  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (!res.ok) throw new Error('Failed to delete task');

      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Helpers ──
  const openEditModal = (task) => {
    setIsEditMode(true);
    setEditingTaskId(task._id);
    setNewTaskTitle(task.title);
    setNewTaskDesc(task.description || '');
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingTaskId(null);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingTaskId(null);
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <CheckCircle color="var(--primary)" />
          <span>User Portal</span>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{padding: '0.5rem 1rem'}}>
          <LogOut size={18} /> Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2>My Tasks</h2>
            <p style={{color: 'var(--text-muted)'}}>Manage your personal task list</p>
          </div>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={20} /> New Task
          </button>
        </div>

        {error && <div className="badge badge-pending mb-4" style={{border: '1px solid var(--danger)', color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', padding: '0.5rem 1rem', display: 'block', marginBottom: '1rem'}}>{error}</div>}
        {loading && <p style={{color: 'var(--text-muted)'}}>Loading tasks...</p>}

        {/* Task Grid */}
        <div className="task-grid">
          {!loading && tasks.map(task => (
            <div key={task._id} className="glass-container task-card">
              <div className="task-header">
                <h3 className="task-title" style={{textDecoration: task.status ? 'line-through' : 'none', color: task.status ? 'var(--text-muted)' : 'white'}}>
                  {task.title}
                </h3>
                <span className={`badge ${task.status ? 'badge-completed' : 'badge-pending'}`}>
                  {task.status ? 'Completed' : 'Pending'}
                </span>
              </div>
              <p className="task-desc">{task.description}</p>
              
              <div className="task-footer">
                <button 
                  onClick={() => toggleTaskStatus(task._id)} 
                  className="btn btn-icon"
                  title={task.status ? "Mark Pending" : "Mark Complete"}
                  style={{color: task.status ? 'var(--success)' : 'var(--text-muted)'}}
                >
                  {task.status ? <CheckCircle size={22} /> : <Circle size={22} />}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(task)} className="btn btn-icon" style={{color: 'var(--primary)'}}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteTask(task._id)} className="btn btn-icon" style={{color: 'var(--danger)'}}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!loading && tasks.length === 0 && (
            <p style={{color: 'var(--text-muted)'}}>No tasks found. Create one!</p>
          )}
        </div>
      </main>

      {/* Create / Edit Task Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="glass-container modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditMode ? 'Edit Task' : 'Create New Task'}</h3>
              <button onClick={closeModal} style={{background:'none', border:'none', color:'white', cursor:'pointer', fontSize:'1.5rem'}}>&times;</button>
            </div>
            <form onSubmit={handleSaveTask}>
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="E.g., Complete project presentation"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea 
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Add details about the task..."
                  rows="3"
                ></textarea>
              </div>
              <div className="flex gap-4 mt-4">
                <button type="button" onClick={closeModal} className="btn btn-outline w-full">Cancel</button>
                <button type="submit" className="btn btn-primary w-full">{isEditMode ? 'Update Task' : 'Save Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
