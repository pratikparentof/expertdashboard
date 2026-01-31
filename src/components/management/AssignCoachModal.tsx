import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAllSessions, AllSessionData } from '@/hooks/useAllSessions';
import { useCoaches } from '@/hooks/useCoaches';
import { format, parseISO } from 'date-fns';

interface AssignCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: AllSessionData;
}

const AssignCoachModal = ({
  isOpen,
  onClose,
  session,
}: AssignCoachModalProps) => {
  const { assignCoach, isAssigning } = useAllSessions();
  const { coaches } = useCoaches();

  const [selectedCoachId, setSelectedCoachId] = useState<string>(
    session.coachId || ''
  );

  const handleAssign = () => {
    assignCoach({
      sessionId: session.id,
      coachId: selectedCoachId || null,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {session.coachId ? 'Reassign Coach' : 'Assign Coach'}
          </DialogTitle>
          <DialogDescription>
            Session for {session.childName} on{' '}
            {format(parseISO(session.date), 'MMM d, yyyy')} at {session.timeIST} IST
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Session Type</Label>
            <p className="text-sm text-muted-foreground">{session.sessionType}</p>
          </div>

          {session.coachName && (
            <div className="space-y-2">
              <Label>Currently Assigned</Label>
              <p className="text-sm font-medium">{session.coachName}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="coach">Select Coach</Label>
            <Select value={selectedCoachId} onValueChange={setSelectedCoachId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a coach" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {coaches.map(coach => (
                  <SelectItem key={coach.id} value={coach.id}>
                    {coach.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={isAssigning}>
              {isAssigning ? 'Assigning...' : 'Assign Coach'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignCoachModal;
