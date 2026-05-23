import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldAlert, Users, ChevronRight, Trash2, Edit2, Plus } from 'lucide-react';

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUserForm, setEditUserForm] = useState({ id: '', name: '', email: '', role: '' });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({ name: '', email: '', password: '', role: 'user' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch users');
        }

        setUsers(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const deleteUser = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this user and all their tasks?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete user');
      }

      setUsers(users.filter(user => user._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (e, user) => {
    e.stopPropagation();
    setEditUserForm({ id: user._id, name: user.name, email: user.email, role: user.role });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${editUserForm.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editUserForm.name,
          email: editUserForm.email,
          role: editUserForm.role
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update user');
      }

      const { data } = await response.json();
      
      setUsers(users.map(u => u._id === data._id ? { ...u, ...data } : u));
      setIsEditModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createUserForm)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create user');

      setUsers([data.data, ...users]);
      setCreateUserForm({ name: '', email: '', password: '', role: 'user' });
      setIsCreateModalOpen(false);
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2>User Management</h2>
            <p style={{color: 'var(--text-muted)'}}>Select a user to view and manage their tasks</p>
          </div>
          <div className="badge badge-admin flex items-center gap-2" style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}>
            <Users size={16} /> Total Users: {users.length}
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary" style={{background: 'linear-gradient(to right, var(--accent), #d946ef)'}}>
            <Plus size={20} /> Create User
          </button>
        </div>

        {error && <div className="badge badge-pending mb-4" style={{border: '1px solid var(--danger)', color: 'var(--danger)', background: 'rgba(239,68,68,0.1)'}}>{error}</div>}
        {loading && <p style={{color: 'var(--text-muted)'}}>Loading users...</p>}

        {/* Users Grid */}
        <div className="task-grid">
          {!loading && users.map(user => (
            <div 
              key={user._id} 
              className="glass-container task-card" 
              style={{borderTop: '3px solid var(--accent)', cursor: 'pointer'}}
              onClick={() => navigate(`/admin/user/${user._id}`)}
            >
              <div className="task-header">
                <h3 className="task-title">{user.name}</h3>
                <span className="badge badge-admin">{user.role}</span>
              </div>
              <p className="task-desc mb-4">{user.email}</p>
              
              <div className="task-footer">
                <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                  Click to view tasks
                </div>
                <div className="flex gap-2">
                  <button onClick={(e) => handleEditClick(e, user)} className="btn btn-icon" style={{color: 'var(--primary)'}} title="Edit User">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={(e) => deleteUser(e, user._id)} className="btn btn-icon" style={{color: 'var(--danger)'}} title="Delete User">
                    <Trash2 size={18} />
                  </button>
                  <button className="btn btn-icon" style={{color: 'var(--primary)'}}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="glass-container modal-content" onClick={e => e.stopPropagation()} style={{borderTop: '3px solid var(--accent)'}}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{background:'none', border:'none', color:'white', cursor:'pointer', fontSize:'1.5rem'}}>&times;</button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({...editUserForm, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value})}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-4 mt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-outline w-full">Cancel</button>
                <button type="submit" className="btn btn-primary w-full" style={{background: 'linear-gradient(to right, var(--accent), #d946ef)'}}>Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="glass-container modal-content" onClick={e => e.stopPropagation()} style={{borderTop: '3px solid var(--success)'}}>
            <div className="modal-header">
              <h3>Create New User</h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{background:'none', border:'none', color:'white', cursor:'pointer', fontSize:'1.5rem'}}>&times;</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={createUserForm.name}
                  onChange={(e) => setCreateUserForm({...createUserForm, name: e.target.value})}
                  placeholder="John Doe"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                  placeholder="user@example.com"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm({...createUserForm, password: e.target.value})}
                  placeholder="Minimum 6 characters"
                  minLength="6"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={createUserForm.role}
                  onChange={(e) => setCreateUserForm({...createUserForm, role: e.target.value})}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-4 mt-4">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-outline w-full">Cancel</button>
                <button type="submit" className="btn btn-primary w-full" style={{background: 'linear-gradient(to right, var(--success), #16a34a)'}}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
