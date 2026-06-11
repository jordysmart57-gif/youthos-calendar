// Core domain types for YouthOS

export type EventCategory =
  | 'middle-school'
  | 'high-school'
  | 'leaders'
  | 'parents'
  | 'camps-trips'
  | 'bible-study'
  | 'deadline'
  | 'promo';

export type EventStatus =
  | 'planning'
  | 'promoting'
  | 'registration-open'
  | 'confirmed'
  | 'complete';

/** Status of an operational track on an event (forms, payments, rides, parent comms). */
export type TrackStatus = 'not-started' | 'in-progress' | 'complete' | 'na';

/**
 * The ten things a parent needs to know before saying yes.
 * "true" means the info has been communicated — "no bus, parents drive"
 * still counts as transportation info.
 */
export interface ClarityInfo {
  date: boolean;
  time: boolean;
  dropOffLocation: boolean;
  pickUpTime: boolean;
  cost: boolean;
  foodInfo: boolean;
  forms: boolean;
  contactPerson: boolean;
  transportation: boolean;
  packingList: boolean;
}

/**
 * The actual info behind each clarity field ("Pick up at 9:30 PM in the main
 * lot", "$10 covers food + gas"). Powers the parent update draft. A field can
 * be marked communicated without a stored detail (e.g. covered verbally).
 */
export type ClarityDetails = Partial<Record<keyof ClarityInfo, string>>;

export interface VolunteerNeed {
  role: string;
  needed: number;
  confirmed: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface MinistryEvent {
  id: string;
  title: string;
  category: EventCategory;
  /** Local ISO datetime, e.g. "2026-06-10T19:00" (no timezone suffix). */
  start: string;
  location: string;
  targetGroup: string;
  status: EventStatus;
  /** Parent clarity is only tracked for events parents need info about. */
  parentFacing: boolean;
  registered: number;
  capacity?: number;
  volunteers: VolunteerNeed[];
  forms: TrackStatus;
  payments: TrackStatus;
  transportation: TrackStatus;
  parentComm: TrackStatus;
  checklist: ChecklistItem[];
  clarity: ClarityInfo;
  details?: ClarityDetails;
  notes?: string;
}

export type TaskCategory =
  | 'event-prep'
  | 'communication'
  | 'shopping'
  | 'volunteer-follow-up'
  | 'parent-follow-up'
  | 'student-care';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  due: string;
  done: boolean;
  priority: 'urgent' | 'high' | 'normal';
  eventId?: string;
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  group: 'middle' | 'high';
  school: string;
  smallGroupId?: string;
  isNew?: boolean;
  needsFollowUp?: boolean;
  followUpReason?: string;
  parentIds: string[];
}

export interface Parent {
  id: string;
  name: string;
  studentIds: string[];
  phone: string;
  email: string;
  engagement: 'high' | 'medium' | 'low';
}

export interface Leader {
  id: string;
  name: string;
  role: string;
  assignments: string[];
  backgroundCheck: 'clear' | 'pending' | 'expired';
}

export interface SmallGroup {
  id: string;
  name: string;
  leaderId: string;
  meetingNight: string;
  studentIds: string[];
}

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  category: EventCategory;
  parentFacing: boolean;
  leadTimeWeeks: number;
  defaultChecklist: string[];
  clarityFields: (keyof ClarityInfo)[];
  typicalVolunteers: string[];
}
