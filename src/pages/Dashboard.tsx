import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CoachProfileCard from '@/components/dashboard/CoachProfileCard';
import ChildrenList from '@/components/dashboard/ChildrenList';
import SessionsCalendar from '@/components/dashboard/SessionsCalendar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, role, signOut, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }
    
    // Redirect admin/manager to management dashboard
    if (role && (role === 'admin' || role === 'manager')) {
      navigate('/management');
    }
  }, [user, role, isLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-3">
          <h1 className="text-xl font-semibold text-foreground">
            Coach Command Centre
          </h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Left Panel */}
        <aside className="w-80 border-r border-border bg-card p-4 flex flex-col gap-4 overflow-hidden">
          <CoachProfileCard />
          <ChildrenList />
        </aside>

        {/* Calendar Area */}
        <main className="flex-1 p-4 overflow-hidden flex">
          <SessionsCalendar />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
