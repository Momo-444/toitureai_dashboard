import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users as UsersIcon, Shield, ShieldAlert, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppRole } from '@/types/database';

export default function UsersPage() {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState<AppRole>('lecteur');

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

  const createUserMutation = useMutation({
    mutationFn: async () => {
      // 1. Créer le compte utilisateur via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            full_name: newUserFullName,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Utilisateur non créé');

      // 2. Créer le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: newUserEmail,
          full_name: newUserFullName,
        });

      if (profileError) throw profileError;

      // 3. Assigner le rôle
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: newUserRole,
        });

      if (roleError) throw roleError;

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur créé avec succès ! Un email de confirmation a été envoyé.');
      setCreateDialogOpen(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserFullName('');
      setNewUserRole('lecteur');
    },
    onError: (error: any) => {
      if (error.message?.includes('User already registered')) {
        toast.error('Cet email est déjà utilisé');
      } else {
        toast.error(error.message || 'Erreur lors de la création de l\'utilisateur');
      }
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Supprimer le rôle
      await supabase.from('user_roles').delete().eq('user_id', userId);

      // Supprimer le profil
      const { error } = await supabase.from('profiles').delete().eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur supprimé avec succès');
      setDeleteUserId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
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
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Créer un utilisateur
        </Button>
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

                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => setDeleteUserId(user.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer l'utilisateur
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialogue de création */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un utilisateur</DialogTitle>
            <DialogDescription>
              L'utilisateur recevra un email de confirmation pour activer son compte
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="utilisateur@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                placeholder="Jean Dupont"
                value={newUserFullName}
                onChange={(e) => setNewUserFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe temporaire *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 caractères"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                L'utilisateur pourra le changer après sa première connexion
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select value={newUserRole} onValueChange={(value: AppRole) => setNewUserRole(value)}>
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

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  setNewUserEmail('');
                  setNewUserPassword('');
                  setNewUserFullName('');
                  setNewUserRole('lecteur');
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={() => createUserMutation.mutate()}
                disabled={!newUserEmail || !newUserPassword || newUserPassword.length < 6}
              >
                {createUserMutation.isPending ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Il perdra l'accès au dashboard
              immédiatement. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && deleteUserMutation.mutate(deleteUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
