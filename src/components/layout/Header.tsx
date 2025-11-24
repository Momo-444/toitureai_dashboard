import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';

export const Header = () => {
  const { user, signOut } = useAuth();
  const { role } = useUserRole();

  const getRoleBadgeVariant = () => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'secretaire':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold text-primary">ToitureAI</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.email}</span>
                    {role && (
                      <Badge variant={getRoleBadgeVariant()} className="text-xs">
                        {role}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
