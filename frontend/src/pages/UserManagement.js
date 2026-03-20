import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Shield, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ROLES = [
  { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-700' },
  { value: 'manager', label: 'Manager', color: 'bg-purple-100 text-purple-700' },
  { value: 'sales_rep', label: 'Sales Rep', color: 'bg-blue-100 text-blue-700' },
  { value: 'viewer', label: 'Viewer', color: 'bg-gray-100 text-gray-700' }
];

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'sales_rep',
  });

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      return;
    }
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
        toast.success('User updated successfully');
      } else {
        await api.post('/users/create', formData);
        toast.success('User created successfully');
      }
      setOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: '',
      role: user.role,
    });
    setOpen(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      name: '',
      password: '',
      role: 'sales_rep',
    });
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-semibold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">Only administrators can access user management.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const getRoleBadge = (role) => {
    const roleConfig = ROLES.find(r => r.value === role);
    return roleConfig ? roleConfig : ROLES[2];
  };

  return (
    <div className="space-y-6" data-testid="user-management-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-semibold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team members and permissions</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-user-button" className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'New User'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  data-testid="user-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  data-testid="user-email-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!editingUser}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password {editingUser ? '(leave blank to keep current)' : '*'}</Label>
                <Input
                  id="password"
                  data-testid="user-password-input"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger data-testid="user-role-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button data-testid="save-user-button" type="submit" className="bg-orange-500 hover:bg-orange-600">
                  {editingUser ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3">
            <div className="bg-orange-50 p-3 rounded-lg">
              <UsersIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-heading font-semibold">{users.length}</p>
            </div>
          </div>
        </div>
        {ROLES.slice(0, 3).map((role) => (
          <div key={role.value} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{role.label}s</p>
                <p className="text-2xl font-heading font-semibold">
                  {users.filter(u => u.role === role.value).length}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">Name</TableHead>
              <TableHead className="font-medium">Email</TableHead>
              <TableHead className="font-medium">Role</TableHead>
              <TableHead className="font-medium">Created</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users yet. Click "Add User" to create one.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                return (
                  <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={`${roleBadge.color} border-0`}>
                        {roleBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          data-testid={`edit-user-${user.id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          disabled={user.id === currentUser.id}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          data-testid={`delete-user-${user.id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={user.id === currentUser.id}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}