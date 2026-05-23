import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LogOut, ShieldAlert, ArrowLeft, Trash2, Edit2, Plus, CheckCircle, Circle } from 'lucide-react';

function AdminUserTasks() {
  const navigate = useNavigate();
  const { userId } = useParams();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/admin/tasks/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch tasks');
        }

        setTasks(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserTasks();
    }
  }, [userId, navigate]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleTaskStatus = async (id) => {
    try {
      const task = tasks.find(t => t._id === id);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: !task.status })
      });
      
      if (!response.ok) throw new Error('Failed to update task status');
      
      setTasks(tasks.map(t => 
        t._id === id ? { ...t, status: !t.status } : t
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete task');
      
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/tasks/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create task');
      
      // The API should return the created task in data.data or data.task. Let's just refetch or use data.data
      setTasks([data.data || data, ...tasks]);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Navbar */}
      <nav className="navbar" style={{borderBottomColor: 'rgba(139, 92, 246, 0.3)'}}>
        <div className="navbar-brand">
          <ShieldAlert color="var(--accent)" />
          <span>Admin Portal</span>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{padding: '0.5rem 1rem'}}>
          <LogOut size={18} /> Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <button 
          onClick={() => navigate('/admin')} 
          className="btn btn-outline mb-4" 
          style={{padding: '0.4rem 0.8rem', border: 'none'}}
        >
          <ArrowLeft size={18} /> Back to Users
        </button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2>Tasks for User ID: {userId}</h2>
            <p style={{color: 'var(--text-muted)'}}>Manage tasks for this specific user</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{background: 'linear-gradient(to right, var(--accent), #d946ef)'}}>
            <Plus size={20} /> Assign Task
          </button>
        </div>

        {error && <div className="badge badge-pending mb-4" style={{border: '1px solid var(--danger)', color: 'var(--danger)', background: 'rgba(239,68,68,0.1)'}}>{error}</div>}
        {loading && <p style={{color: 'var(--text-muted)'}}>Loading tasks...</p>}

        {/* Task Grid */}
        <div className="task-grid">
          {!loading && tasks.map(task => (
            <div key={task._id} className="glass-container task-card" style={{borderTop: '3px solid var(--accent)'}}>
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
                  <button className="btn btn-icon" style={{color: 'var(--primary)'}}>
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
            <p style={{color: 'var(--text-muted)'}}>No tasks assigned to this user.</p>
          )}
        </div>
      </main>

      {/* Create Task Modal for Admin */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="glass-container modal-content" onClick={e => e.stopPropagation()} style={{borderTop: '3px solid var(--accent)'}}>
            <div className="modal-header">
              <h3>Assign Task to User</h3>
              <button onClick={() => setIsModalOpen(false)} style={{background:'none', border:'none', color:'white', cursor:'pointer', fontSize:'1.5rem'}}>&times;</button>
            </div>
            <form onSubmit={handleCreateTask}>
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
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline w-full">Cancel</button>
                <button type="submit" className="btn btn-primary w-full" style={{background: 'linear-gradient(to right, var(--accent), #d946ef)'}}>Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUserTasks;
