import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole } from '@/contexts/AuthContext';

export interface Coach {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  avatar_url?: string | null;
}

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

export const useCoaches = () => {
  const { user } = useAuth();

  const { data: coaches = [], isLoading, error } = useQuery({
    queryKey: ['coaches'],
    queryFn: async (): Promise<Coach[]> => {
      if (!user) return [];

      // First get all user_ids with coach role
      const { data: coachRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'coach');

      if (rolesError) throw rolesError;
      
      const coachIds = coachRoles?.map(r => r.user_id) || [];
      if (coachIds.length === 0) return [];

      // Then fetch their profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .in('id', coachIds)
        .order('name', { ascending: true });

      if (error) throw error;

      return ((data || []) as ProfileRow[]).map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: 'coach' as AppRole,
        avatar_url: row.avatar_url,
      }));
    },
    enabled: !!user,
  });

  return {
    coaches,
    isLoading,
    error,
  };
};
