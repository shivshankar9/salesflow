import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Users, TrendingUp, DollarSign, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/dashboard/metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const chartData = metrics?.leads_by_stage
    ? Object.entries(metrics.leads_by_stage).map(([stage, count]) => ({
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        count,
      }))
    : [];

  const statCards = [
    {
      title: 'Total Contacts',
      value: metrics?.total_contacts || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Leads',
      value: metrics?.total_leads || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Total Deals',
      value: metrics?.total_deals || 0,
      icon: Target,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Pipeline Value',
      value: `$${(metrics?.total_value || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6" data-testid="dashboard">
      <div>
        <h1 className="text-4xl font-heading font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your sales performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-5 border border-gray-200 hover:border-orange-500/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-heading font-semibold tracking-tight mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {chartData.length > 0 && (
        <Card className="p-6 border border-gray-200">
          <h3 className="text-xl font-heading font-medium mb-6">Leads by Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="stage" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}