import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface SessionHistoryModalProps {
  childId: string | null;
  onClose: () => void;
}

const statusColors = {
  upcoming: 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-success/10 text-success border-success/20',
  missed: 'bg-destructive/10 text-destructive border-destructive/20',
  rescheduled: 'bg-warning/10 text-warning border-warning/20',
};

const SessionHistoryModal = ({ childId, onClose }: SessionHistoryModalProps) => {
  const { getChildById, getSessionsByChildId, getParentByChildId } = useApp();

  if (!childId) return null;

  const child = getChildById(childId);
  const parent = getParentByChildId(childId);
  const sessions = getSessionsByChildId(childId).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (!child) return null;

  return (
    <Dialog open={!!childId} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Session History</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {child.name} • {parent?.name}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No sessions found for this child.</p>
              </div>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  className="p-3 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        {session.sessionType}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{format(parseISO(session.date), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{session.timeCST} CST</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`capitalize ${statusColors[session.status]}`}
                    >
                      {session.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SessionHistoryModal;
