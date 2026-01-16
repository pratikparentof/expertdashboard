import { useState, useMemo } from 'react';
import { useChildren } from '@/hooks/useChildren';
import { useSessions } from '@/hooks/useSessions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  FileText, 
  ClipboardList,
} from 'lucide-react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval, 
  addWeeks, 
  subWeeks, 
  addMonths, 
  subMonths,
  addDays,
  subDays,
  isSameDay,
  parseISO,
} from 'date-fns';
import SessionModal from './SessionModal';

type ViewMode = 'day' | 'week' | 'month';

const statusStyles = {
  upcoming: 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20',
  completed: 'bg-muted border-muted-foreground/20 text-muted-foreground',
  missed: 'bg-destructive/10 border-destructive/30 text-destructive',
  rescheduled: 'bg-warning/10 border-warning/30 text-warning',
};

const SessionsCalendar = () => {
  const { children } = useChildren();
  const { sessions } = useSessions();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDate, setCreateDate] = useState<string | null>(null);

  const getChildById = (childId: string) => {
    return children.find(c => c.id === childId);
  };

  const dateRange = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return [currentDate];
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 }),
        });
      case 'month':
        return eachDayOfInterval({
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        });
    }
  }, [currentDate, viewMode]);

  const navigate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
        break;
    }
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(s => isSameDay(parseISO(s.date), date));
  };

  const handleOpenUrl = (url?: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleDayClick = (date: Date) => {
    setCreateDate(format(date, 'yyyy-MM-dd'));
    setShowCreateModal(true);
  };

  const getTitle = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
    }
  };

  return (
    <>
      <Card className="shadow-card flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold min-w-[200px] text-center">
                {getTitle()}
              </h2>
              <Button variant="outline" size="icon" onClick={() => navigate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 text-sm capitalize transition-colors ${
                      viewMode === mode 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                New Session
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto pb-4">
          {viewMode === 'month' ? (
            <div className="grid grid-cols-7 gap-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {dateRange.map(date => {
                const daySessions = getSessionsForDate(date);
                const isToday = isSameDay(date, new Date());
                return (
                  <div
                    key={date.toISOString()}
                    onClick={() => handleDayClick(date)}
                    className={`min-h-[100px] p-1 border border-border rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
                      isToday ? 'bg-primary/5 border-primary/30' : ''
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                      {format(date, 'd')}
                    </div>
                    <div className="space-y-1">
                      {daySessions.slice(0, 2).map(session => {
                        const child = getChildById(session.childId);
                        return (
                          <div
                            key={session.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSession(session.id);
                            }}
                            className={`text-xs p-1 rounded truncate border ${statusStyles[session.status]}`}
                          >
                            {session.timeCST} {child?.name}
                          </div>
                        );
                      })}
                      {daySessions.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{daySessions.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`grid gap-2 ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-1'}`}>
              {dateRange.map(date => {
                const daySessions = getSessionsForDate(date);
                const isToday = isSameDay(date, new Date());
                return (
                  <div
                    key={date.toISOString()}
                    className={`min-h-[200px] p-2 border border-border rounded-lg ${
                      isToday ? 'bg-primary/5 border-primary/30' : ''
                    }`}
                  >
                    <div 
                      className={`text-sm font-medium mb-2 cursor-pointer hover:text-primary ${
                        isToday ? 'text-primary' : 'text-foreground'
                      }`}
                      onClick={() => handleDayClick(date)}
                    >
                      {viewMode === 'week' ? format(date, 'EEE d') : format(date, 'EEEE, MMM d')}
                    </div>
                    <div className="space-y-2">
                      {daySessions.map(session => {
                        const child = getChildById(session.childId);
                        return (
                          <DropdownMenu key={session.id}>
                            <DropdownMenuTrigger asChild>
                              <div
                                className={`p-2 rounded-md border cursor-pointer transition-colors ${statusStyles[session.status]}`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-medium">{session.timeCST} CST</span>
                                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                                    {session.status}
                                  </Badge>
                                </div>
                                <div className="text-sm font-medium truncate mt-1">
                                  {child?.name}
                                </div>
                                <div className="text-xs opacity-75 truncate">
                                  {session.sessionType}
                                </div>
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-52">
                              <DropdownMenuItem onClick={() => setSelectedSession(session.id)}>
                                Edit Session
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleOpenUrl(session.caseRecordSheetUrl, e)}>
                                <FileText className="h-4 w-4 mr-2" />
                                Open Case Record Sheet
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleOpenUrl(session.assessmentViewerUrl, e)}>
                                <ClipboardList className="h-4 w-4 mr-2" />
                                Open Assessment Viewer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        );
                      })}
                      {daySessions.length === 0 && (
                        <div 
                          className="text-xs text-muted-foreground text-center py-4 cursor-pointer hover:text-primary"
                          onClick={() => handleDayClick(date)}
                        >
                          Click to add session
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <SessionModal
        sessionId={selectedSession}
        defaultDate={createDate}
        open={showCreateModal || !!selectedSession}
        onClose={() => {
          setSelectedSession(null);
          setShowCreateModal(false);
          setCreateDate(null);
        }}
      />
    </>
  );
};

export default SessionsCalendar;
