import { createContext, useContext, useState, ReactNode } from 'react';
import { 
  mockCoach, 
  mockChildren, 
  mockParents, 
  mockSessions,
  Coach,
  Child,
  Parent,
  Session,
} from '@/data/mockData';

interface AppContextType {
  coach: Coach;
  children: Child[];
  parents: Parent[];
  sessions: Session[];
  addChild: (child: Child) => void;
  removeChild: (childId: string) => void;
  addSession: (session: Session) => void;
  updateSession: (session: Session) => void;
  removeSession: (sessionId: string) => void;
  getParentByChildId: (childId: string) => Parent | undefined;
  getChildById: (childId: string) => Child | undefined;
  getSessionsByChildId: (childId: string) => Session[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children: childrenProp }: { children: ReactNode }) => {
  const [coach] = useState<Coach>(mockCoach);
  const [childrenList, setChildrenList] = useState<Child[]>(mockChildren);
  const [parents] = useState<Parent[]>(mockParents);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);

  const addChild = (child: Child) => {
    setChildrenList(prev => [...prev, child]);
  };

  const removeChild = (childId: string) => {
    setChildrenList(prev => prev.filter(c => c.id !== childId));
    // Also remove associated sessions
    setSessions(prev => prev.filter(s => s.childId !== childId));
  };

  const addSession = (session: Session) => {
    setSessions(prev => [...prev, session]);
  };

  const updateSession = (session: Session) => {
    setSessions(prev => prev.map(s => s.id === session.id ? session : s));
  };

  const removeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const getParentByChildId = (childId: string) => {
    const child = childrenList.find(c => c.id === childId);
    if (!child) return undefined;
    return parents.find(p => p.id === child.parentId);
  };

  const getChildById = (childId: string) => {
    return childrenList.find(c => c.id === childId);
  };

  const getSessionsByChildId = (childId: string) => {
    return sessions.filter(s => s.childId === childId);
  };

  return (
    <AppContext.Provider value={{
      coach,
      children: childrenList,
      parents,
      sessions,
      addChild,
      removeChild,
      addSession,
      updateSession,
      removeSession,
      getParentByChildId,
      getChildById,
      getSessionsByChildId,
    }}>
      {childrenProp}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
