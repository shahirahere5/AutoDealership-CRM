export type Kind = 'leads' | 'contacts' | 'companies' | 'deals' | 'tasks' | 'tickets' | 'activities' | 'emails';
export type Role = 'Admin' | 'Sales Manager' | 'Salesperson' | 'Support Agent';
export interface RecordItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  owner: string;
  status: string;
  source: string;
  value: number;
  created: string;
  updated: string;
  due: string;
  priority: string;
  notes: string;
  related: string;
  type: string;
  tags: string;
  probability: number;
  lostReason: string;
  read: boolean;
}
export interface Stage {
  name: string;
  probability: number;
  color: string;
}
export interface Settings {
  theme: 'light' | 'dark' | 'system';
  density: 'Compact' | 'Comfortable';
  role: Role;
  roundRobin: boolean;
  autoFollowup: boolean;
  reminders: boolean;
  connected: string;
  stages: Stage[];
}
export type Database = Record<Kind, RecordItem[]>;
export const owners = ['Amira Khan', 'Daniel Brooks', 'Sofia Martinez', 'Kenji Tanaka'];
export const statuses: Record<Kind, string[]> = {
  leads: ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'],
  contacts: ['Lead', 'Customer', 'Partner'],
  companies: ['Active', 'Inactive'],
  deals: ['Prospecting', 'Proposal', 'Negotiation', 'Won', 'Lost'],
  tasks: ['To do', 'In progress', 'Done'],
  tickets: ['Open', 'In Progress', 'Waiting on Customer', 'Resolved', 'Closed'],
  activities: ['Logged'],
  emails: ['Inbox', 'Sent', 'Drafts', 'Scheduled']
};
export const labels: Record<Kind, string> = {
  leads: 'Leads',
  contacts: 'Contacts',
  companies: 'Companies',
  deals: 'Pipeline',
  tasks: 'Tasks',
  tickets: 'Support',
  activities: 'Activities',
  emails: 'Inbox'
};
