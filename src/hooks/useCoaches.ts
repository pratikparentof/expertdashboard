import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Coach {
  id: string;
  name: string;
  email: string;
  role: 'coach' | 'freelancer' | 'admin' | 'manager';
  avatar_url?: string | null;
}

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: 'coach' | 'freelancer' | 'admin' | 'manager';
  avatar_url: string | null;
}

export const useCoaches = () => {
  const { user } = useAuth();

  const { data: coaches = [], isLoading, error } = useQuery({
    queryKey: ['coaches'],
    queryFn: async (): Promise<Coach[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, avatar_url')
        .eq('role', 'coach')
        .order('name', { ascending: true });

      if (error) throw error;

      return ((data || []) as ProfileRow[]).map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
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
