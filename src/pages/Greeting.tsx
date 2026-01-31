import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Greeting = () => {
  const navigate = useNavigate();
  const { user, profile, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }

    if (profile && role) {
      // Auto-redirect after 1.5 seconds based on role
      const timer = setTimeout(() => {
        if (role === 'admin' || role === 'manager') {
          navigate('/management');
        } else {
          navigate('/dashboard');
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [navigate, user, profile, role, isLoading]);

  if (isLoading || !profile || !role) return null;

  const getRoleLabel = () => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      case 'coach':
        return 'Coach';
      default:
        return 'Freelancer';
    }
  };

  const firstName = profile.name.split(' ')[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl font-semibold text-foreground mb-3">
          Hi {firstName} 👋
        </h1>
        <p className="text-lg text-muted-foreground">
          Preparing your {getRoleLabel()} dashboard…
        </p>
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Greeting;
