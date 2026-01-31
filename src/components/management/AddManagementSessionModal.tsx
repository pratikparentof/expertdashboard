import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useAllSessions } from '@/hooks/useAllSessions';
import { useCoaches } from '@/hooks/useCoaches';
import { useAllChildren } from '@/hooks/useAllChildren';
import { sessionTypes } from '@/data/mockData';

interface AddManagementSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddManagementSessionModal = ({
  isOpen,
  onClose,
}: AddManagementSessionModalProps) => {
  const { addSession, isAdding } = useAllSessions();
  const { coaches } = useCoaches();
  const { children, getParentByChildId } = useAllChildren();

  const [childId, setChildId] = useState('');
  const [parentName, setParentName] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [timeIST, setTimeIST] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [coachId, setCoachId] = useState('');
  const [status, setStatus] = useState('upcoming');

  // Auto-fill parent when child is selected
  useEffect(() => {
    if (childId) {
      const parent = getParentByChildId(childId);
      setParentName(parent?.name || '');
    } else {
      setParentName('');
    }
  }, [childId, getParentByChildId]);

  const handleSubmit = () => {
    if (!childId || !sessionDate || !timeIST || !sessionType) {
      return;
    }

    addSession({
      childId,
      coachId: coachId || null,
      sessionType,
      date: sessionDate,
      timeCST: '', // Can be calculated or left empty
      timeIST,
      status: status as 'upcoming' | 'completed' | 'missed' | 'rescheduled',
    });

    // Reset form
    setChildId('');
    setParentName('');
    setSessionDate('');
    setTimeIST('');
    setSessionType('');
    setCoachId('');
    setStatus('upcoming');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="child">Child *</Label>
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a child" />
              </SelectTrigger>
              <SelectContent>
                {children.map(child => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent</Label>
            <Input
              id="parent"
              value={parentName}
              disabled
              placeholder="Auto-filled from child"
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionDate">Session Date *</Label>
            <Input
              id="sessionDate"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeIST">Session Time (IST) *</Label>
            <Input
              id="timeIST"
              type="time"
              value={timeIST}
              onChange={(e) => setTimeIST(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionType">Session Type *</Label>
            <Select value={sessionType} onValueChange={setSessionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                {sessionTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coach">Coach (Optional)</Label>
            <Select value={coachId} onValueChange={setCoachId}>
              <SelectTrigger>
                <SelectValue placeholder="Leave unassigned" />
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

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isAdding || !childId || !sessionDate || !timeIST || !sessionType}
            >
              {isAdding ? 'Creating...' : 'Create Session'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddManagementSessionModal;
