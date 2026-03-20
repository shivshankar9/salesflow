import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';

const DEAL_STAGES = ['qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    value: 0,
    stage: 'qualification',
    probability: 50,
    expected_close_date: '',
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await api.get('/deals');
      setDeals(response.data);
    } catch (error) {
      toast.error('Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDeal) {
        await api.put(`/deals/${editingDeal.id}`, formData);
        toast.success('Deal updated successfully');
      } else {
        await api.post('/deals', formData);
        toast.success('Deal created successfully');
      }
      setOpen(false);
      resetForm();
      fetchDeals();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save deal');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) return;
    
    try {
      await api.delete(`/deals/${id}`);
      toast.success('Deal deleted successfully');
      fetchDeals();
    } catch (error) {
      toast.error('Failed to delete deal');
    }
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      name: deal.name,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability || 50,
      expected_close_date: deal.expected_close_date || '',
    });
    setOpen(true);
  };

  const resetForm = () => {
    setEditingDeal(null);
    setFormData({
      name: '',
      value: 0,
      stage: 'qualification',
      probability: 50,
      expected_close_date: '',
    });
  };

  const getStageColor = (stage) => {
    const colors = {
      qualification: 'bg-blue-100 text-blue-700',
      proposal: 'bg-purple-100 text-purple-700',
      negotiation: 'bg-yellow-100 text-yellow-700',
      closed_won: 'bg-green-100 text-green-700',
      closed_lost: 'bg-gray-100 text-gray-700',
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6" data-testid="deals-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-semibold tracking-tight">Deals</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your sales opportunities</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-deal-button" className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Deal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDeal ? 'Edit Deal' : 'New Deal'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Deal Name *</Label>
                <Input
                  id="name"
                  data-testid="deal-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value ($) *</Label>
                <Input
                  id="value"
                  data-testid="deal-value-input"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                  <SelectTrigger data-testid="deal-stage-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="probability">Probability (%)</Label>
                <Input
                  id="probability"
                  data-testid="deal-probability-input"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected_close_date">Expected Close Date</Label>
                <Input
                  id="expected_close_date"
                  data-testid="deal-close-date-input"
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button data-testid="save-deal-button" type="submit" className="bg-orange-500 hover:bg-orange-600">
                  {editingDeal ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">Deal Name</TableHead>
              <TableHead className="font-medium">Value</TableHead>
              <TableHead className="font-medium">Stage</TableHead>
              <TableHead className="font-medium">Probability</TableHead>
              <TableHead className="font-medium">Expected Close</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No deals yet. Click "Add Deal" to create one.
                </TableCell>
              </TableRow>
            ) : (
              deals.map((deal) => (
                <TableRow key={deal.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{deal.name}</TableCell>
                  <TableCell className="font-semibold text-orange-600">
                    ${deal.value.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStageColor(deal.stage)}`}>
                      {deal.stage.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      {deal.probability}%
                    </div>
                  </TableCell>
                  <TableCell>{deal.expected_close_date || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        data-testid={`edit-deal-${deal.id}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(deal)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        data-testid={`delete-deal-${deal.id}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(deal.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}