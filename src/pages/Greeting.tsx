import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Greeting = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('coachUser');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const parsed = JSON.parse(userData);
    setUser(parsed);

    // Auto-redirect after 1.5 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (!user) return null;

  const roleLabel = user.role === 'coach' ? 'Coach' : 'Freelancer';
  const firstName = user.name.split(' ')[0];

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
