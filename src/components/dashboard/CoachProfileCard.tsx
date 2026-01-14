import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Users, Calendar } from 'lucide-react';

const CoachProfileCard = () => {
  const { coach, children, sessions } = useApp();
  
  const today = new Date().toISOString().split('T')[0];
  const sessionsToday = sessions.filter(
    s => s.date === today && s.status === 'upcoming'
  ).length;

  const initials = coach.name
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
            <h3 className="font-semibold text-foreground truncate">{coach.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{coach.role}</p>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{coach.email}</span>
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
