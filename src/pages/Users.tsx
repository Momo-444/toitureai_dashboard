import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users as UsersIcon, Shield, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { AppRole } from '@/types/database';

export default function UsersPage() {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Rediriger si pas admin
  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error('Accès non autorisé');
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate]);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      return profiles?.map((profile) => ({
        ...profile,
        role: roles?.find((r) => r.user_id === profile.id)?.role || 'lecteur',
      }));
    },
    enabled: isAdmin,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      // D'abord supprimer le rôle existant
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Puis créer le nouveau rôle
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Rôle modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la modification du rôle');
    },
  });

  const roleColors: Record<AppRole, string> = {
    admin: 'bg-red-500',
    secretaire: 'bg-blue-500',
    lecteur: 'bg-gray-500',
  };

  const roleIcons: Record<AppRole, any> = {
    admin: ShieldAlert,
    secretaire: Shield,
    lecteur: UsersIcon,
  };

  if (!isAdmin && !roleLoading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les rôles des utilisateurs</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users?.map((user) => {
            const RoleIcon = roleIcons[user.role as AppRole];
            return (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <RoleIcon className="h-5 w-5" />
                        {user.full_name || 'Sans nom'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge className={roleColors[user.role as AppRole]}>
                      {user.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rôle</label>
                    <Select
                      value={user.role}
                      onValueChange={(value: AppRole) =>
                        updateRoleMutation.mutate({ userId: user.id, newRole: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lecteur">Lecteur</SelectItem>
                        <SelectItem value="secretaire">Secrétaire</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium">Lecteur:</span> Consultation uniquement
                    </p>
                    <p>
                      <span className="font-medium">Secrétaire:</span> Création et modification
                    </p>
                    <p>
                      <span className="font-medium">Admin:</span> Tous les droits + suppression
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
