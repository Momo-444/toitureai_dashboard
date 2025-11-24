import { NavLink } from '@/components/NavLink';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  HardHat, 
  BarChart3, 
  Settings,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { isAdmin } = useUserRole();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/leads', icon: Users, label: 'Leads' },
    { to: '/devis', icon: FileText, label: 'Devis' },
    { to: '/chantiers', icon: HardHat, label: 'Chantiers' },
    { to: '/statistiques', icon: BarChart3, label: 'Statistiques' },
    { to: '/configuration', icon: Settings, label: 'Configuration' },
  ];

  const adminNavItems = [
    { to: '/utilisateurs', icon: ShieldCheck, label: 'Utilisateurs', adminOnly: true },
  ];

  return (
    <aside className="w-64 border-r bg-card h-[calc(100vh-73px)]">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}>
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        
        {isAdmin && (
          <>
            <div className="border-t my-2 pt-2">
              <p className="text-xs text-muted-foreground px-3 py-2">Administration</p>
            </div>
            {adminNavItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
};
