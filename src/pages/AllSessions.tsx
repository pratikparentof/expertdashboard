import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAllSessions, AllSessionData } from '@/hooks/useAllSessions';
import { useCoaches } from '@/hooks/useCoaches';
import { useChildren } from '@/hooks/useChildren';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LogOut, Plus, UserCheck, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import AddManagementSessionModal from '@/components/management/AddManagementSessionModal';
import AssignCoachModal from '@/components/management/AssignCoachModal';

const AllSessions = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, isLoading } = useAuth();
  const { sessions, isLoading: sessionsLoading } = useAllSessions();
  const { coaches } = useCoaches();

  // Filters
  const [coachFilter, setCoachFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Modals
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<AllSessionData | null>(null);
  const [isAssignCoachOpen, setIsAssignCoachOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }
    
    if (profile && profile.role !== 'admin' && profile.role !== 'manager') {
      navigate('/dashboard');
    }
  }, [user, profile, isLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (isLoading || !user || !profile) return null;

  // Apply filters
  const filteredSessions = sessions.filter(session => {
    // Coach filter
    if (coachFilter !== 'all') {
      if (coachFilter === 'unassigned' && session.coachId !== null) return false;
      if (coachFilter !== 'unassigned' && session.coachId !== coachFilter) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && session.status !== statusFilter) return false;

    // Date range filter
    if (dateFrom && session.date < dateFrom) return false;
    if (dateTo && session.date > dateTo) return false;

    return true;
  });

  // Sort by date + time
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.timeIST.localeCompare(a.timeIST);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="default">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'missed':
        return <Badge variant="destructive">Missed</Badge>;
      case 'rescheduled':
        return <Badge variant="outline">Rescheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAssignCoach = (session: AllSessionData) => {
    setSelectedSession(session);
    setIsAssignCoachOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold text-foreground">
              Management Command Centre
            </h1>
            <nav className="flex gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/management')}
              >
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" className="font-medium">
                All Sessions
              </Button>
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              All Sessions
            </CardTitle>
            <Button onClick={() => setIsAddSessionOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Session
            </Button>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label>Coach</Label>
                <Select value={coachFilter} onValueChange={setCoachFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Coaches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Coaches</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {coaches.map(coach => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="upcoming">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Sessions Table */}
            {sessionsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading sessions...
              </div>
            ) : sortedSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No sessions found
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time (IST)</TableHead>
                      <TableHead>Child</TableHead>
                      <TableHead>Coach</TableHead>
                      <TableHead>Session Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSessions.map(session => (
                      <TableRow key={session.id}>
                        <TableCell>
                          {format(parseISO(session.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{session.timeIST}</TableCell>
                        <TableCell className="font-medium">
                          {session.childName}
                        </TableCell>
                        <TableCell>
                          {session.coachName || (
                            <span className="text-muted-foreground italic">
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{session.sessionType}</TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAssignCoach(session)}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            {session.coachId ? 'Reassign' : 'Assign'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Session Modal */}
      <AddManagementSessionModal
        isOpen={isAddSessionOpen}
        onClose={() => setIsAddSessionOpen(false)}
      />

      {/* Assign Coach Modal */}
      {selectedSession && (
        <AssignCoachModal
          isOpen={isAssignCoachOpen}
          onClose={() => {
            setIsAssignCoachOpen(false);
            setSelectedSession(null);
          }}
          session={selectedSession}
        />
      )}
    </div>
  );
};

export default AllSessions;
