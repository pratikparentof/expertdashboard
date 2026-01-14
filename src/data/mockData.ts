export interface Coach {
  id: string;
  name: string;
  email: string;
  role: 'coach' | 'freelancer';
  avatar?: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  parentId: string;
  caseRecordSheetUrl?: string;
  assessmentViewerUrl?: string;
}

export interface Session {
  id: string;
  childId: string;
  coachId: string;
  sessionType: string;
  date: string;
  timeCST: string;
  timeIST: string;
  inviteeCountry?: string;
  inviteeTimezone?: string;
  inviteeTime?: string;
  status: 'upcoming' | 'completed' | 'missed' | 'rescheduled';
  meetingLink?: string;
  caseRecordSheetUrl?: string;
  assessmentViewerUrl?: string;
}

export const mockCoach: Coach = {
  id: 'coach-1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@coachplatform.com',
  role: 'coach',
};

export const mockParents: Parent[] = [
  { id: 'parent-1', name: 'Emily Chen', email: 'emily.chen@email.com' },
  { id: 'parent-2', name: 'Michael Rodriguez', email: 'michael.r@email.com' },
  { id: 'parent-3', name: 'Amanda Foster', email: 'amanda.foster@email.com' },
];

export const mockChildren: Child[] = [
  {
    id: 'child-1',
    name: 'Lily Chen',
    age: 8,
    parentId: 'parent-1',
    caseRecordSheetUrl: 'https://docs.google.com/spreadsheets/d/example1',
    assessmentViewerUrl: 'https://assessments.example.com/child-1',
  },
  {
    id: 'child-2',
    name: 'Marcus Rodriguez',
    age: 10,
    parentId: 'parent-2',
    caseRecordSheetUrl: 'https://docs.google.com/spreadsheets/d/example2',
    assessmentViewerUrl: 'https://assessments.example.com/child-2',
  },
  {
    id: 'child-3',
    name: 'Sophie Foster',
    age: 7,
    parentId: 'parent-3',
    caseRecordSheetUrl: 'https://docs.google.com/spreadsheets/d/example3',
    assessmentViewerUrl: 'https://assessments.example.com/child-3',
  },
];

export const mockSessions: Session[] = [
  {
    id: 'session-1',
    childId: 'child-1',
    coachId: 'coach-1',
    sessionType: 'Initial Assessment',
    date: '2026-01-14',
    timeCST: '09:00',
    timeIST: '20:30',
    inviteeCountry: 'United States',
    inviteeTimezone: 'America/New_York',
    inviteeTime: '10:00',
    status: 'upcoming',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    caseRecordSheetUrl: 'https://docs.google.com/spreadsheets/d/example1',
    assessmentViewerUrl: 'https://assessments.example.com/child-1',
  },
  {
    id: 'session-2',
    childId: 'child-2',
    coachId: 'coach-1',
    sessionType: 'Follow-up Session',
    date: '2026-01-14',
    timeCST: '14:00',
    timeIST: '01:30',
    status: 'upcoming',
    meetingLink: 'https://meet.google.com/klm-nopq-rst',
  },
  {
    id: 'session-3',
    childId: 'child-1',
    coachId: 'coach-1',
    sessionType: 'Progress Review',
    date: '2026-01-13',
    timeCST: '10:00',
    timeIST: '21:30',
    status: 'completed',
  },
  {
    id: 'session-4',
    childId: 'child-3',
    coachId: 'coach-1',
    sessionType: 'Initial Assessment',
    date: '2026-01-12',
    timeCST: '11:00',
    timeIST: '22:30',
    status: 'missed',
  },
  {
    id: 'session-5',
    childId: 'child-2',
    coachId: 'coach-1',
    sessionType: 'Skill Building',
    date: '2026-01-15',
    timeCST: '15:00',
    timeIST: '02:30',
    status: 'upcoming',
  },
  {
    id: 'session-6',
    childId: 'child-1',
    coachId: 'coach-1',
    sessionType: 'Parent Consultation',
    date: '2026-01-10',
    timeCST: '13:00',
    timeIST: '00:30',
    status: 'rescheduled',
  },
];

export const sessionTypes = [
  'Initial Assessment',
  'Follow-up Session',
  'Progress Review',
  'Skill Building',
  'Parent Consultation',
  'Goal Setting',
  'Behavioral Session',
];

export const countries = [
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
  { name: 'India', code: 'IN' },
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
  { name: 'Japan', code: 'JP' },
];

export const timezones: Record<string, string[]> = {
  'United States': ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'],
  'United Kingdom': ['Europe/London'],
  'Canada': ['America/Toronto', 'America/Vancouver'],
  'Australia': ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Perth'],
  'India': ['Asia/Kolkata'],
  'Germany': ['Europe/Berlin'],
  'France': ['Europe/Paris'],
  'Japan': ['Asia/Tokyo'],
};
