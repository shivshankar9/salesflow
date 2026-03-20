import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed'];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    value: 0,
    stage: 'new',
    source: '',
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads');
      setLeads(response.data);
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLead) {
        await api.put(`/leads/${editingLead.id}`, formData);
        toast.success('Lead updated successfully');
      } else {
        await api.post('/leads', formData);
        toast.success('Lead created successfully');
      }
      setOpen(false);
      resetForm();
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save lead');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted successfully');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      value: lead.value || 0,
      stage: lead.stage,
      source: lead.source || '',
    });
    setOpen(true);
  };

  const resetForm = () => {
    setEditingLead(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      value: 0,
      stage: 'new',
      source: '',
    });
  };

  const groupedLeads = STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter((lead) => lead.stage === stage);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6" data-testid="leads-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your sales pipeline</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-lead-button" className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLead ? 'Edit Lead' : 'New Lead'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  data-testid="lead-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  data-testid="lead-email-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  data-testid="lead-company-input"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Est. Value ($)</Label>
                <Input
                  id="value"
                  data-testid="lead-value-input"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                  <SelectTrigger data-testid="lead-stage-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button data-testid="save-lead-button" type="submit" className="bg-orange-500 hover:bg-orange-600">
                  {editingLead ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAGES.map((stage) => (
          <div key={stage} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium capitalize">{stage}</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {groupedLeads[stage]?.length || 0}
              </span>
            </div>
            <div className="space-y-2">
              {groupedLeads[stage]?.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                  No leads
                </div>
              ) : (
                groupedLeads[stage]?.map((lead) => (
                  <Card key={lead.id} className="p-3 border border-gray-200 hover:border-orange-500/50 transition-colors">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">{lead.name}</h4>
                      {lead.company && <p className="text-xs text-muted-foreground">{lead.company}</p>}
                      {lead.value > 0 && (
                        <p className="text-sm font-semibold text-orange-600">${lead.value.toLocaleString()}</p>
                      )}
                      <div className="flex gap-1 pt-2">
                        <Button
                          data-testid={`edit-lead-${lead.id}`}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => handleEdit(lead)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          data-testid={`delete-lead-${lead.id}`}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => handleDelete(lead.id)}
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}