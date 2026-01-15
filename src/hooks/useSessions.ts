import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SessionData {
  id: string;
  childId: string;
  coachId: string;
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
  coach_id: string;
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
const transformSession = (row: SessionRow): SessionData => ({
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

// Transform app format to DB insert/update
const transformToDb = (session: Partial<SessionData>, coachId: string) => ({
  coach_id: coachId,
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
});

export const useSessions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: async (): Promise<SessionData[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('coach_id', user.id)
        .order('session_date', { ascending: false });

      if (error) throw error;

      return ((data || []) as SessionRow[]).map(transformSession);
    },
    enabled: !!user,
  });

  const addSessionMutation = useMutation({
    mutationFn: async (session: Omit<SessionData, 'id' | 'coachId'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('sessions')
        .insert(transformToDb(session, user.id))
        .select()
        .single();

      if (error) throw error;
      return transformSession(data as SessionRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create session: ' + error.message);
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, ...session }: Partial<SessionData> & { id: string }) => {
      if (!user) throw new Error('Not authenticated');

      const updateData: Record<string, unknown> = {};
      
      if (session.childId !== undefined) updateData.child_id = session.childId;
      if (session.sessionType !== undefined) updateData.session_type = session.sessionType;
      if (session.date !== undefined) updateData.session_date = session.date;
      if (session.timeCST !== undefined) updateData.time_cst = session.timeCST;
      if (session.timeIST !== undefined) updateData.time_ist = session.timeIST;
      if (session.inviteeCountry !== undefined) updateData.invitee_country = session.inviteeCountry;
      if (session.inviteeTimezone !== undefined) updateData.invitee_timezone = session.inviteeTimezone;
      if (session.inviteeTime !== undefined) updateData.invitee_time = session.inviteeTime;
      if (session.status !== undefined) updateData.status = session.status;
      if (session.meetingLink !== undefined) updateData.meeting_link = session.meetingLink;
      if (session.caseRecordSheetUrl !== undefined) updateData.case_record_sheet_url = session.caseRecordSheetUrl;
      if (session.assessmentViewerUrl !== undefined) updateData.assessment_viewer_url = session.assessmentViewerUrl;
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', id)
        .eq('coach_id', user.id) // Ensure ownership
        .select()
        .single();

      if (error) throw error;
      return transformSession(data as SessionRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update session: ' + error.message);
    },
  });

  const removeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)
        .eq('coach_id', user.id); // Ensure ownership

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session removed successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to remove session: ' + error.message);
    },
  });

  const getSessionsByChildId = (childId: string): SessionData[] => {
    return sessions.filter(s => s.childId === childId);
  };

  return {
    sessions,
    isLoading,
    error,
    addSession: addSessionMutation.mutate,
    updateSession: updateSessionMutation.mutate,
    removeSession: removeSessionMutation.mutate,
    getSessionsByChildId,
    isAdding: addSessionMutation.isPending,
    isUpdating: updateSessionMutation.isPending,
    isRemoving: removeSessionMutation.isPending,
  };
};
