import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Trash2 } from 'lucide-react';
import { sessionTypes, countries, timezones, Session } from '@/data/mockData';
import { format } from 'date-fns';

interface SessionModalProps {
  sessionId: string | null;
  defaultDate: string | null;
  open: boolean;
  onClose: () => void;
}

const SessionModal = ({ sessionId, defaultDate, open, onClose }: SessionModalProps) => {
  const { 
    sessions, 
    children, 
    getParentByChildId, 
    getChildById,
    addSession, 
    updateSession, 
    removeSession,
    coach,
  } = useApp();

  const existingSession = sessionId ? sessions.find(s => s.id === sessionId) : null;
  const isEditing = !!existingSession;

  const [childId, setChildId] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<Session['status']>('upcoming');
  const [timeCST, setTimeCST] = useState('09:00');
  const [inviteeCountry, setInviteeCountry] = useState('');
  const [inviteeTimezone, setInviteeTimezone] = useState('');
  const [inviteeTime, setInviteeTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [caseRecordSheetUrl, setCaseRecordSheetUrl] = useState('');
  const [assessmentViewerUrl, setAssessmentViewerUrl] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (existingSession) {
        setChildId(existingSession.childId);
        setSessionType(existingSession.sessionType);
        setDate(existingSession.date);
        setStatus(existingSession.status);
        setTimeCST(existingSession.timeCST);
        setInviteeCountry(existingSession.inviteeCountry || '');
        setInviteeTimezone(existingSession.inviteeTimezone || '');
        setInviteeTime(existingSession.inviteeTime || '');
        setMeetingLink(existingSession.meetingLink || '');
        setCaseRecordSheetUrl(existingSession.caseRecordSheetUrl || '');
        setAssessmentViewerUrl(existingSession.assessmentViewerUrl || '');
      } else {
        setChildId('');
        setSessionType('');
        setDate(defaultDate || format(new Date(), 'yyyy-MM-dd'));
        setStatus('upcoming');
        setTimeCST('09:00');
        setInviteeCountry('');
        setInviteeTimezone('');
        setInviteeTime('');
        setMeetingLink('');
        setCaseRecordSheetUrl('');
        setAssessmentViewerUrl('');
      }
    }
  }, [open, existingSession, defaultDate]);

  // Calculate IST from CST (CST is UTC-6, IST is UTC+5:30, so IST = CST + 11:30)
  const timeIST = useMemo(() => {
    if (!timeCST) return '';
    const [hours, minutes] = timeCST.split(':').map(Number);
    let istHours = hours + 11;
    let istMinutes = minutes + 30;
    if (istMinutes >= 60) {
      istMinutes -= 60;
      istHours += 1;
    }
    if (istHours >= 24) {
      istHours -= 24;
    }
    return `${istHours.toString().padStart(2, '0')}:${istMinutes.toString().padStart(2, '0')}`;
  }, [timeCST]);

  // Calculate invitee time based on timezone
  useEffect(() => {
    if (!inviteeTimezone || !timeCST) {
      setInviteeTime('');
      return;
    }
    
    // Simplified timezone offset calculation
    const tzOffsets: Record<string, number> = {
      'America/New_York': -5,
      'America/Chicago': -6,
      'America/Denver': -7,
      'America/Los_Angeles': -8,
      'America/Toronto': -5,
      'America/Vancouver': -8,
      'Europe/London': 0,
      'Europe/Berlin': 1,
      'Europe/Paris': 1,
      'Asia/Kolkata': 5.5,
      'Asia/Tokyo': 9,
      'Australia/Sydney': 11,
      'Australia/Melbourne': 11,
      'Australia/Perth': 8,
    };

    const cstOffset = -6;
    const targetOffset = tzOffsets[inviteeTimezone] ?? 0;
    const diff = targetOffset - cstOffset;

    const [hours, minutes] = timeCST.split(':').map(Number);
    let newHours = hours + Math.floor(diff);
    let newMinutes = minutes + (diff % 1) * 60;
    
    if (newMinutes >= 60) {
      newMinutes -= 60;
      newHours += 1;
    }
    if (newMinutes < 0) {
      newMinutes += 60;
      newHours -= 1;
    }
    if (newHours >= 24) newHours -= 24;
    if (newHours < 0) newHours += 24;

    setInviteeTime(`${Math.floor(newHours).toString().padStart(2, '0')}:${Math.floor(newMinutes).toString().padStart(2, '0')}`);
  }, [inviteeTimezone, timeCST]);

  const availableTimezones = inviteeCountry ? (timezones[inviteeCountry] || []) : [];

  const handleSave = () => {
    const sessionData: Session = {
      id: existingSession?.id || `session-${Date.now()}`,
      childId,
      coachId: coach.id,
      sessionType,
      date,
      timeCST,
      timeIST,
      inviteeCountry: inviteeCountry || undefined,
      inviteeTimezone: inviteeTimezone || undefined,
      inviteeTime: inviteeTime || undefined,
      status,
      meetingLink: meetingLink || undefined,
      caseRecordSheetUrl: caseRecordSheetUrl || undefined,
      assessmentViewerUrl: assessmentViewerUrl || undefined,
    };

    if (isEditing) {
      updateSession(sessionData);
    } else {
      addSession(sessionData);
    }
    onClose();
  };

  const handleClear = () => {
    setChildId('');
    setSessionType('');
    setDate(defaultDate || format(new Date(), 'yyyy-MM-dd'));
    setStatus('upcoming');
    setTimeCST('09:00');
    setInviteeCountry('');
    setInviteeTimezone('');
    setInviteeTime('');
    setMeetingLink('');
    setCaseRecordSheetUrl('');
    setAssessmentViewerUrl('');
  };

  const handleDelete = () => {
    if (existingSession) {
      removeSession(existingSession.id);
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleOpenUrl = (url: string) => {
    if (url) window.open(url, '_blank');
  };

  const canSave = childId && sessionType && date && timeCST;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Session' : 'Create Session'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Child Selector */}
            <div className="space-y-2">
              <Label>Child</Label>
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map(child => {
                    const parent = getParentByChildId(child.id);
                    return (
                      <SelectItem key={child.id} value={child.id}>
                        {child.name} — {parent?.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Session Type */}
            <div className="space-y-2">
              <Label>Session Type</Label>
              <Select value={sessionType} onValueChange={setSessionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  {sessionTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Session['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Time Section */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Times are automatically synchronized based on timezone.
              </p>

              {/* CST Time */}
              <div className="flex items-center gap-3">
                <Label className="w-24 flex-shrink-0">Time</Label>
                <Input
                  type="time"
                  value={timeCST}
                  onChange={(e) => setTimeCST(e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12">CST</span>
              </div>

              {/* IST Time (read-only) */}
              <div className="flex items-center gap-3">
                <Label className="w-24 flex-shrink-0">Time</Label>
                <Input
                  type="time"
                  value={timeIST}
                  readOnly
                  className="flex-1 bg-muted"
                />
                <span className="text-sm text-muted-foreground w-12">IST</span>
              </div>

              {/* Invitee Time */}
              <div className="space-y-2">
                <Label>Invitee Time</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select value={inviteeCountry} onValueChange={(v) => {
                    setInviteeCountry(v);
                    setInviteeTimezone('');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(c => (
                        <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={inviteeTimezone} 
                    onValueChange={setInviteeTimezone}
                    disabled={!inviteeCountry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimezones.map(tz => (
                        <SelectItem key={tz} value={tz}>
                          {tz.split('/').pop()?.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="time"
                    value={inviteeTime}
                    readOnly
                    className="bg-muted"
                    placeholder="--:--"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Links Section */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Case Record Sheet URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={caseRecordSheetUrl}
                    onChange={(e) => setCaseRecordSheetUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleOpenUrl(caseRecordSheetUrl)}
                    disabled={!caseRecordSheetUrl}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assessment Viewer URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={assessmentViewerUrl}
                    onChange={(e) => setAssessmentViewerUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleOpenUrl(assessmentViewerUrl)}
                    disabled={!assessmentViewerUrl}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Meeting Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleOpenUrl(meetingLink)}
                    disabled={!meetingLink}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2 flex-1">
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
              {isEditing && (
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!canSave}>
                {isEditing ? 'Save Changes' : 'Create Session'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SessionModal;
