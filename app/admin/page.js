'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const GRADE_OPTIONS = ['all', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];
const ROLE_OPTIONS = ['student', 'teacher', 'admin'];

const ROLE_COLORS = {
    admin: 'bg-red-50 text-red-600',
    teacher: 'bg-emerald-50 text-emerald-600',
    student: 'bg-blue-50 text-blue-600',
};

export default function AdminPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({ username: '', name: '', password: '', role: 'student', gradeLevel: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const loadUsers = async () => {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(data.users || []);
        setLoading(false);
    };

    useEffect(() => {
        if (session?.user?.role !== 'admin') { router.push('/dashboard'); return; }
        // eslint-disable-next-line
        loadUsers();
    }, [session, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        const method = editingUser ? 'PATCH' : 'POST';
        const body = editingUser
            ? { id: editingUser.id, role: form.role, gradeLevel: form.gradeLevel, name: form.name }
            : { ...form };
        const res = await fetch('/api/users', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return; }
        setShowForm(false); setEditingUser(null);
        setForm({ username: '', name: '', password: '', role: 'student', gradeLevel: '' });
        setSaving(false); loadUsers();
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setForm({ username: user.username, name: user.name, password: '', role: user.role, gradeLevel: user.gradeLevel || '' });
        setShowForm(true); setError('');
    };

    const handleDelete = async (userId) => {
        if (!confirm('Delete this user?')) return;
        await fetch('/api/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: userId }) });
        loadUsers();
    };

    if (session?.user?.role !== 'admin') return null;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">User Management</h1>
                    <p className="text-slate-400 text-sm font-medium">Create and manage user accounts and assign grade levels.</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditingUser(null); setForm({ username: '', name: '', password: '', role: 'student', gradeLevel: '' }); setError(''); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-md shadow-indigo-200"
                >
                    <span className="text-lg">+</span> Add User
                </button>
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-black text-slate-800 mb-6">{editingUser ? 'Edit User' : 'New User'}</h2>
                        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!editingUser && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Username</label>
                                    <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm" required placeholder="johndoe" />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm" required placeholder="John Doe" />
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Password</label>
                                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm" required minLength={4} placeholder="Min 4 characters" />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Role</label>
                                <select value={form.role} onChange={e => {
                                    const newRole = e.target.value;
                                    setForm({ ...form, role: newRole, gradeLevel: (newRole === 'teacher' || newRole === 'admin') ? 'all' : form.gradeLevel });
                                }}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm">
                                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                                </select>
                                {form.role === 'teacher' && (
                                    <p className="text-xs text-emerald-500 mt-1 font-medium">✓ Teachers can view all resources across all grades</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Grade Level</label>
                                <select value={form.gradeLevel} onChange={e => setForm({ ...form, gradeLevel: e.target.value })}
                                    disabled={form.role === 'teacher' || form.role === 'admin'}
                                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 ${(form.role === 'teacher' || form.role === 'admin') ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                                    <option value="">Select grade...</option>
                                    {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g === 'all' ? 'All Grades' : g}</option>)}
                                </select>
                                {(form.role === 'teacher' || form.role === 'admin') && (
                                    <p className="text-xs text-slate-400 mt-1">Auto-set to All Grades for {form.role}s</p>
                                )}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all disabled:opacity-50">
                                    {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                                </button>
                                <button type="button" onClick={() => { setShowForm(false); setEditingUser(null); }}
                                    className="px-6 py-3 rounded-xl bg-slate-100 text-slate-500 font-bold text-sm hover:bg-slate-200 transition-all">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="h-10 w-10 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Grade</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Created</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {user.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-slate-800 font-bold text-sm">{user.name}</p>
                                                <p className="text-slate-400 text-xs">@{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-lg ${ROLE_COLORS[user.role]}`}>{user.role}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm font-medium">{user.gradeLevel || '—'}</td>
                                    <td className="px-6 py-4 text-slate-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(user)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition-all">Edit</button>
                                            {user.username !== 'denskie' && (
                                                <button onClick={() => handleDelete(user.id)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 text-xs font-bold transition-all">Delete</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
