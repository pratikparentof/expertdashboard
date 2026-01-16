import { useAuth } from '@/contexts/AuthContext';
import { useChildren } from '@/hooks/useChildren';
import { useSessions } from '@/hooks/useSessions';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Users, Calendar } from 'lucide-react';

const CoachProfileCard = () => {
  const { profile } = useAuth();
  const { children } = useChildren();
  const { sessions } = useSessions();
  
  const today = new Date().toISOString().split('T')[0];
  const sessionsToday = sessions.filter(
    s => s.date === today && s.status === 'upcoming'
  ).length;

  const name = profile?.name || 'Coach';
  const role = profile?.role || 'coach';
  const email = profile?.email || '';

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{role}</p>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{email}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{children.length} children</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{sessionsToday} today</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoachProfileCard;
