import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSessions } from '@/hooks/useSessions';
import { useCoaches } from '@/hooks/useCoaches';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LogOut, Calendar, Users, CheckCircle, Clock } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isAfter, parseISO } from 'date-fns';

const ManagementDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, role, signOut, isLoading } = useAuth();
  const { sessions, isLoading: sessionsLoading } = useSessions();
  const { coaches, isLoading: coachesLoading } = useCoaches();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }
    
    // Only admin/manager can access this page
    if (role && role !== 'admin' && role !== 'manager') {
      navigate('/dashboard');
    }
  }, [user, role, isLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (isLoading || !user || !profile) return null;

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  // Calculate metrics
  const totalSessions = sessions.length;
  const sessionsThisWeek = sessions.filter(s => {
    const sessionDate = parseISO(s.date);
    return sessionDate >= weekStart && sessionDate <= weekEnd;
  }).length;
  const upcomingSessions = sessions.filter(s => {
    const sessionDate = parseISO(s.date);
    return isAfter(sessionDate, today) || (s.date === format(today, 'yyyy-MM-dd') && s.status === 'upcoming');
  }).length;

  // Calculate coach performance
  const coachPerformance = coaches.map(coach => {
    const coachSessions = sessions.filter(s => s.coachId === coach.id);
    const coachSessionsThisWeek = coachSessions.filter(s => {
      const sessionDate = parseISO(s.date);
      return sessionDate >= weekStart && sessionDate <= weekEnd;
    }).length;
    const coachUpcoming = coachSessions.filter(s => s.status === 'upcoming').length;
    const coachCompleted = coachSessions.filter(s => s.status === 'completed').length;

    return {
      id: coach.id,
      name: coach.name,
      totalSessions: coachSessions.length,
      sessionsThisWeek: coachSessionsThisWeek,
      upcomingSessions: coachUpcoming,
      completedSessions: coachCompleted,
    };
  });

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
              <Button variant="ghost" size="sm" className="font-medium">
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/management/sessions')}
              >
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
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sessions
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sessions This Week
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sessionsThisWeek}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Sessions
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{upcomingSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
            </CardContent>
          </Card>
        </div>

        {/* Coach Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Coach Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coachesLoading || sessionsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : coaches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No coaches found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coach Name</TableHead>
                    <TableHead className="text-right">Total Sessions</TableHead>
                    <TableHead className="text-right">This Week</TableHead>
                    <TableHead className="text-right">Upcoming</TableHead>
                    <TableHead className="text-right">Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coachPerformance.map(coach => (
                    <TableRow key={coach.id}>
                      <TableCell className="font-medium">{coach.name}</TableCell>
                      <TableCell className="text-right">{coach.totalSessions}</TableCell>
                      <TableCell className="text-right">{coach.sessionsThisWeek}</TableCell>
                      <TableCell className="text-right">{coach.upcomingSessions}</TableCell>
                      <TableCell className="text-right">{coach.completedSessions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ManagementDashboard;
