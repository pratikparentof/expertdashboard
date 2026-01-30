import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ChildWithParent {
  id: string;
  name: string;
  age: number;
  parentId: string;
  parentName: string;
  parentEmail: string;
  caseRecordSheetUrl?: string;
  assessmentViewerUrl?: string;
}

interface CoachChildRow {
  child_id: string;
}

interface ParentRow {
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
  parents: ParentRow | ParentRow[];
}

export const useChildren = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: children = [], isLoading, error } = useQuery({
    queryKey: ['children', user?.id],
    queryFn: async (): Promise<ChildWithParent[]> => {
      if (!user) return [];

      // Fetch children assigned to this coach with parent info
      const { data: coachChildren, error: ccError } = await supabase
        .from('coach_children')
        .select('child_id')
        .eq('coach_id', user.id);

      if (ccError) throw ccError;
      if (!coachChildren || coachChildren.length === 0) return [];

      const childIds = (coachChildren as CoachChildRow[]).map(cc => cc.child_id);

      const { data: childrenData, error: childError } = await supabase
        .from('children')
        .select(`
          id,
          name,
          age,
          parent_id,
          case_record_sheet_url,
          assessment_viewer_url,
          parents!inner (
            id,
            name,
            email
          )
        `)
        .in('id', childIds);

      if (childError) throw childError;

      return ((childrenData || []) as ChildRow[]).map((child) => {
        const parent = Array.isArray(child.parents) ? child.parents[0] : child.parents;
        return {
          id: child.id,
          name: child.name,
          age: child.age,
          parentId: child.parent_id,
          parentName: parent.name,
          parentEmail: parent.email,
          caseRecordSheetUrl: child.case_record_sheet_url || undefined,
          assessmentViewerUrl: child.assessment_viewer_url || undefined,
        };
      });
    },
    enabled: !!user,
  });

  // Remove child assignment (not the child record itself)
  const removeChildMutation = useMutation({
    mutationFn: async (childId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('coach_children')
        .delete()
        .eq('coach_id', user.id)
        .eq('child_id', childId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      toast.success('Child removed from your assignments');
    },
    onError: (error: Error) => {
      toast.error('Failed to remove child: ' + error.message);
    },
  });

  // Link an existing child to this coach
  const linkChildMutation = useMutation({
    mutationFn: async (childId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('coach_children')
        .insert({ coach_id: user.id, child_id: childId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      toast.success('Child added to your assignments');
    },
    onError: (error: Error) => {
      toast.error('Failed to link child: ' + error.message);
    },
  });

  // Update child links (case record sheet, assessment viewer URLs)
  const updateChildLinksMutation = useMutation({
    mutationFn: async ({ childId, caseRecordSheetUrl, assessmentViewerUrl }: {
      childId: string;
      caseRecordSheetUrl?: string;
      assessmentViewerUrl?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('children')
        .update({
          case_record_sheet_url: caseRecordSheetUrl || null,
          assessment_viewer_url: assessmentViewerUrl || null,
        })
        .eq('id', childId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      toast.success('Links updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update links: ' + error.message);
    },
  });

  return {
    children,
    isLoading,
    error,
    removeChild: removeChildMutation.mutate,
    linkChild: linkChildMutation.mutate,
    updateChildLinks: updateChildLinksMutation.mutate,
    isRemoving: removeChildMutation.isPending,
    isLinking: linkChildMutation.isPending,
    isUpdatingLinks: updateChildLinksMutation.isPending,
  };
};

// Hook to search for children by parent email
export const useSearchChildrenByParentEmail = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (parentEmail: string) => {
      if (!user) throw new Error('Not authenticated');

      // Find parent by email
      const { data: parents, error: parentError } = await supabase
        .from('parents')
        .select('id, name, email')
        .eq('email', parentEmail.toLowerCase().trim());

      if (parentError) throw parentError;
      if (!parents || parents.length === 0) {
        throw new Error('No parent found with this email');
      }

      const parent = (parents as ParentRow[])[0];

      // Find children of this parent
      const { data: children, error: childError } = await supabase
        .from('children')
        .select('id, name, age')
        .eq('parent_id', parent.id);

      if (childError) throw childError;

      // Get already assigned children
      const { data: assigned, error: assignedError } = await supabase
        .from('coach_children')
        .select('child_id')
        .eq('coach_id', user.id);

      if (assignedError) throw assignedError;

      const assignedIds = new Set((assigned as CoachChildRow[] || []).map(a => a.child_id));

      return {
        parent,
        children: ((children || []) as { id: string; name: string; age: number }[]).map(c => ({
          ...c,
          isAlreadyAssigned: assignedIds.has(c.id),
        })),
      };
    },
  });
};
