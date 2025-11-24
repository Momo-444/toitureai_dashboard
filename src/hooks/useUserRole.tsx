import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppRole } from '@/types/database';
import { useAuth } from './useAuth';

export const useUserRole = () => {
  const { user } = useAuth();

  const { data: role, isLoading } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .rpc('get_user_role');

      if (error) {
        console.error('Error fetching user role:', error);
        return 'lecteur' as AppRole;
      }

      return data as AppRole;
    },
    enabled: !!user,
  });

  const isAdmin = role === 'admin';
  const isSecretaire = role === 'secretaire';
  const canEdit = isAdmin || isSecretaire;
  const canDelete = isAdmin;

  return {
    role,
    isLoading,
    isAdmin,
    isSecretaire,
    canEdit,
    canDelete,
  };
};
