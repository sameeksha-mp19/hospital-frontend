import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Doctor', department: '' });

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('http://localhost:5000/api/admin/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success(`${form.role} "${form.name}" created successfully!`);
      setForm({ name: '', email: '', password: '', role: 'Doctor', department: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Add New User</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required className="w-full p-2 border rounded" />
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email Address" required className="w-full p-2 border rounded" />
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" required className="w-full p-2 border rounded" />
            <select name="role" value={form.role} onChange={handleChange} required className="w-full p-2 border rounded">
              <option value="Doctor">Doctor</option> <option value="Patient">Patient</option> <option value="Admin">Admin</option> <option value="Pharmacy">Pharmacy</option> <option value="OT">OT Staff</option>
            </select>
            {form.role === 'Doctor' && (
              <select name="department" value={form.department} onChange={handleChange} required className="w-full p-2 border rounded">
                <option value="">-- Select Department --</option> <option value="Cardiology">Cardiology</option> <option value="Orthopedics">Orthopedics</option> <option value="ENT">ENT</option> <option value="Neurology">Neurology</option>
              </select>
            )}
            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400">{isLoading ? 'Creating...' : 'Add User'}</button>
          </form>
        </div>
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">User List</h3>
          <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b"><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Role</th></tr></thead><tbody>{users.map(user => (<tr key={user._id} className="border-b hover:bg-gray-50"><td className="p-2">{user.name}</td><td className="p-2">{user.email}</td><td className="p-2">{user.role}{user.role === 'Doctor' && ` (${user.department})`}</td></tr>))}</tbody></table></div>
        </div>
      </div>
    </div>
  );
}