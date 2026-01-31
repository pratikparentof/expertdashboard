import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChildData {
  id: string;
  name: string;
  age: number;
  parentId: string;
  caseRecordSheetUrl?: string;
  assessmentViewerUrl?: string;
}

export interface ParentData {
  id: string;
  name: string;
  email: string;
}

interface ChildRow {
  id: string;
  name: string;
  age: number;
  parent_id: string;
  case_record_sheet_url: string | null;
  assessment_viewer_url: string | null;
}

interface ParentRow {
  id: string;
  name: string;
  email: string;
}

const transformChild = (row: ChildRow): ChildData => ({
  id: row.id,
  name: row.name,
  age: row.age,
  parentId: row.parent_id,
  caseRecordSheetUrl: row.case_record_sheet_url || undefined,
  assessmentViewerUrl: row.assessment_viewer_url || undefined,
});

export const useAllChildren = () => {
  const { user, role } = useAuth();

  // Only admin/manager can access all children
  const canAccessAll = role === 'admin' || role === 'manager';

  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ['all-children'],
    queryFn: async (): Promise<ChildData[]> => {
      if (!user || !canAccessAll) return [];

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      return ((data || []) as ChildRow[]).map(transformChild);
    },
    enabled: !!user && canAccessAll,
  });

  const { data: parents = [], isLoading: parentsLoading } = useQuery({
    queryKey: ['all-parents'],
    queryFn: async (): Promise<ParentData[]> => {
      if (!user || !canAccessAll) return [];

      const { data, error } = await supabase
        .from('parents')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      return ((data || []) as ParentRow[]).map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
      }));
    },
    enabled: !!user && canAccessAll,
  });

  const getParentByChildId = (childId: string): ParentData | undefined => {
    const child = children.find(c => c.id === childId);
    if (!child) return undefined;
    return parents.find(p => p.id === child.parentId);
  };

  return {
    children,
    parents,
    isLoading: childrenLoading || parentsLoading,
    getParentByChildId,
  };
};
