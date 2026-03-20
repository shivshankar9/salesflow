import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, TrendingUp, DollarSign, CheckSquare, LogOut, CreditCard, Plug, Shield } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/app', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/app/contacts', icon: Users, label: 'Contacts' },
    { path: '/app/leads', icon: TrendingUp, label: 'Leads' },
    { path: '/app/deals', icon: DollarSign, label: 'Deals' },
    { path: '/app/activities', icon: CheckSquare, label: 'Activities' },
    { path: '/app/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { path: '/app/integrations', icon: Plug, label: 'Integrations' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/app/users', icon: Shield, label: 'Users' });
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-heading font-semibold tracking-tight text-primary">SalesFlow</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            data-testid="logout-button"
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}