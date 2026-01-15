import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Greeting = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }

    if (profile) {
      // Auto-redirect after 1.5 seconds
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [navigate, user, profile, isLoading]);

  if (isLoading || !profile) return null;

  const roleLabel = profile.role === 'coach' ? 'Coach' : 'Freelancer';
  const firstName = profile.name.split(' ')[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl font-semibold text-foreground mb-3">
          Hi {firstName} 👋
        </h1>
        <p className="text-lg text-muted-foreground">
          Preparing your sessions…
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
