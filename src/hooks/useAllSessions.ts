import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AllSessionData {
  id: string;
  childId: string;
  childName?: string;
  coachId: string | null;
  coachName?: string;
  parentName?: string;
  sessionType: string;
  date: string;
  timeCST: string;
  timeIST: string;
  inviteeCountry?: string;
  inviteeTimezone?: string;
  inviteeTime?: string;
  status: 'upcoming' | 'completed' | 'missed' | 'rescheduled';
  meetingLink?: string;
  caseRecordSheetUrl?: string;
  assessmentViewerUrl?: string;
}

interface SessionRow {
  id: string;
  coach_id: string | null;
  child_id: string;
  session_type: string;
  session_date: string;
  time_cst: string;
  time_ist: string;
  invitee_country: string | null;
  invitee_timezone: string | null;
  invitee_time: string | null;
  status: 'upcoming' | 'completed' | 'missed' | 'rescheduled';
  meeting_link: string | null;
  case_record_sheet_url: string | null;
  assessment_viewer_url: string | null;
}

// Transform DB row to app format
const transformSession = (row: SessionRow): AllSessionData => ({
  id: row.id,
  childId: row.child_id,
  coachId: row.coach_id,
  sessionType: row.session_type,
  date: row.session_date,
  timeCST: row.time_cst,
  timeIST: row.time_ist,
  inviteeCountry: row.invitee_country || undefined,
  inviteeTimezone: row.invitee_timezone || undefined,
  inviteeTime: row.invitee_time || undefined,
  status: row.status,
  meetingLink: row.meeting_link || undefined,
  caseRecordSheetUrl: row.case_record_sheet_url || undefined,
  assessmentViewerUrl: row.assessment_viewer_url || undefined,
});

export const useAllSessions = () => {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  // Only allow admin/manager to fetch all sessions
  const canAccessAllSessions = role === 'admin' || role === 'manager';

  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['all-sessions'],
    queryFn: async (): Promise<AllSessionData[]> => {
      if (!user || !canAccessAllSessions) return [];

      // Fetch all sessions (no coach_id filter)
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .order('session_date', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Fetch all children for name mapping
      const { data: childrenData } = await supabase
        .from('children')
        .select('id, name, parent_id');

      // Fetch all parents for name mapping
      const { data: parentsData } = await supabase
        .from('parents')
        .select('id, name');

      // Fetch all coaches (profiles with coach role from user_roles table)
      const { data: coachRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'coach');

      const coachIds = coachRoles?.map(r => r.user_id) || [];
      
      const { data: coachesData } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', coachIds.length > 0 ? coachIds : ['no-matches']);

      const childMap = new Map(childrenData?.map(c => [c.id, { name: c.name, parentId: c.parent_id }]) || []);
      const parentMap = new Map(parentsData?.map(p => [p.id, p.name]) || []);
      const coachMap = new Map(coachesData?.map(c => [c.id, c.name]) || []);

      return ((sessionsData || []) as SessionRow[]).map(row => {
        const session = transformSession(row);
        const child = childMap.get(row.child_id);
        
        return {
          ...session,
          childName: child?.name || 'Unknown Child',
          coachName: row.coach_id ? (coachMap.get(row.coach_id) || 'Unknown Coach') : undefined,
          parentName: child?.parentId ? (parentMap.get(child.parentId) || 'Unknown Parent') : undefined,
        };
      });
    },
    enabled: !!user && canAccessAllSessions,
  });

  // Add session mutation (for management - can set any coach or null)
  const addSessionMutation = useMutation({
    mutationFn: async (session: Omit<AllSessionData, 'id' | 'childName' | 'coachName' | 'parentName'>) => {
      if (!user || !canAccessAllSessions) throw new Error('Not authorized');

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          coach_id: session.coachId || null,
          child_id: session.childId,
          session_type: session.sessionType,
          session_date: session.date,
          time_cst: session.timeCST,
          time_ist: session.timeIST,
          invitee_country: session.inviteeCountry || null,
          invitee_timezone: session.inviteeTimezone || null,
          invitee_time: session.inviteeTime || null,
          status: session.status || 'upcoming',
          meeting_link: session.meetingLink || null,
          case_record_sheet_url: session.caseRecordSheetUrl || null,
          assessment_viewer_url: session.assessmentViewerUrl || null,
        })
        .select()
        .single();

      if (error) throw error;
      return transformSession(data as SessionRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create session: ' + error.message);
    },
  });

  // Assign/reassign coach mutation
  const assignCoachMutation = useMutation({
    mutationFn: async ({ sessionId, coachId }: { sessionId: string; coachId: string | null }) => {
      if (!user || !canAccessAllSessions) throw new Error('Not authorized');

      const { data, error } = await supabase
        .from('sessions')
        .update({ 
          coach_id: coachId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return transformSession(data as SessionRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Coach assigned successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to assign coach: ' + error.message);
    },
  });

  return {
    sessions,
    isLoading,
    error,
    addSession: addSessionMutation.mutate,
    assignCoach: assignCoachMutation.mutate,
    isAdding: addSessionMutation.isPending,
    isAssigning: assignCoachMutation.isPending,
  };
};
