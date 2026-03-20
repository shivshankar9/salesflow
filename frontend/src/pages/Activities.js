import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, CheckCircle2, Circle, Pencil, Trash2, Clock } from 'lucide-react';

const ACTIVITY_TYPES = ['call', 'email', 'meeting', 'task', 'note'];

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_type: 'task',
    due_date: '',
    completed: false,
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activities');
      setActivities(response.data);
    } catch (error) {
      toast.error('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingActivity) {
        await api.put(`/activities/${editingActivity.id}`, formData);
        toast.success('Activity updated successfully');
      } else {
        await api.post('/activities', formData);
        toast.success('Activity created successfully');
      }
      setOpen(false);
      resetForm();
      fetchActivities();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save activity');
    }
  };

  const toggleComplete = async (activity) => {
    try {
      await api.put(`/activities/${activity.id}`, {
        ...activity,
        completed: !activity.completed,
      });
      fetchActivities();
    } catch (error) {
      toast.error('Failed to update activity');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    
    try {
      await api.delete(`/activities/${id}`);
      toast.success('Activity deleted successfully');
      fetchActivities();
    } catch (error) {
      toast.error('Failed to delete activity');
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description || '',
      activity_type: activity.activity_type,
      due_date: activity.due_date || '',
      completed: activity.completed,
    });
    setOpen(true);
  };

  const resetForm = () => {
    setEditingActivity(null);
    setFormData({
      title: '',
      description: '',
      activity_type: 'task',
      due_date: '',
      completed: false,
    });
  };

  const getTypeIcon = (type) => {
    const icons = {
      call: '📞',
      email: '📧',
      meeting: '🤝',
      task: '✓',
      note: '📝',
    };
    return icons[type] || '•';
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const pendingActivities = activities.filter((a) => !a.completed);
  const completedActivities = activities.filter((a) => a.completed);

  return (
    <div className="space-y-6" data-testid="activities-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-semibold tracking-tight">Activities</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your tasks and interactions</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-activity-button" className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingActivity ? 'Edit Activity' : 'New Activity'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  data-testid="activity-title-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  data-testid="activity-description-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity_type">Type</Label>
                <Select value={formData.activity_type} onValueChange={(value) => setFormData({ ...formData, activity_type: value })}>
                  <SelectTrigger data-testid="activity-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  data-testid="activity-due-date-input"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="completed"
                  data-testid="activity-completed-checkbox"
                  checked={formData.completed}
                  onCheckedChange={(checked) => setFormData({ ...formData, completed: checked })}
                />
                <Label htmlFor="completed" className="cursor-pointer">Mark as completed</Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button data-testid="save-activity-button" type="submit" className="bg-orange-500 hover:bg-orange-600">
                  {editingActivity ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-medium">Pending</h2>
            <span className="text-sm text-muted-foreground">{pendingActivities.length} tasks</span>
          </div>
          {pendingActivities.length === 0 ? (
            <Card className="p-8 text-center border-2 border-dashed border-gray-200">
              <p className="text-muted-foreground">No pending activities</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingActivities.map((activity) => (
                <Card key={activity.id} className="p-4 border border-gray-200 hover:border-orange-500/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleComplete(activity)}
                      className="mt-1 text-gray-400 hover:text-orange-500 transition-colors"
                      data-testid={`toggle-activity-${activity.id}`}
                    >
                      <Circle className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium">{activity.title}</h3>
                        <div className="flex gap-1">
                          <Button
                            data-testid={`edit-activity-${activity.id}`}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleEdit(activity)}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            data-testid={`delete-activity-${activity.id}`}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleDelete(activity.id)}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="capitalize">{getTypeIcon(activity.activity_type)} {activity.activity_type}</span>
                        {activity.due_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.due_date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-medium">Completed</h2>
            <span className="text-sm text-muted-foreground">{completedActivities.length} tasks</span>
          </div>
          {completedActivities.length === 0 ? (
            <Card className="p-8 text-center border-2 border-dashed border-gray-200">
              <p className="text-muted-foreground">No completed activities</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {completedActivities.map((activity) => (
                <Card key={activity.id} className="p-4 border border-gray-200 bg-muted/30">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleComplete(activity)}
                      className="mt-1 text-green-500 hover:text-gray-400 transition-colors"
                      data-testid={`toggle-activity-${activity.id}`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium line-through text-muted-foreground">{activity.title}</h3>
                        <Button
                          data-testid={`delete-activity-${activity.id}`}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => handleDelete(activity.id)}
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}