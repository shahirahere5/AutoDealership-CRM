import { type Database, type Kind, type RecordItem, owners, statuses } from '../types';
const names = ['Ayesha Siddiqui', 'Marcus Chen', 'Nadia Williams', 'Omar Hassan', 'Elena Petrova', 'Fatima Ali', 'Lucas Silva', 'Priya Mehta', 'James Okafor', 'Hana Suzuki', 'Zain Ahmed', 'Clara Fischer', 'Grace Mensah', 'Adam Clarke', 'Sara Ibrahim', 'Noah Laurent', 'Maya Patel', 'Leo Rossi', 'Noor Malik', 'Ines Costa'];
const companies = ['Cedar Analytics', 'Atlas Logistics', 'Meridian Health', 'Evergreen Foods', 'Harbor Technologies', 'Summit Manufacturing', 'Kiteworks Studio', 'Alpine Energy', 'Orchard Retail', 'Beacon Systems', 'Riverton Labs', 'Cobalt Finance', 'Willow Partners', 'Nexa Digital', 'Seabrook Supply', 'Vector Mobility', 'Brightpath Learning', 'Acorn Ventures', 'Copperline Media', 'Terra Engineering', 'Juniper Cloud', 'Foundry Operations', 'Maple Networks', 'Bridgewater Design', 'Slate Consulting'];
export function blank(): RecordItem {
  return {
    id: crypto.randomUUID(),
    name: '',
    email: '',
    phone: '',
    company: '',
    owner: owners[0],
    status: 'New',
    source: 'Manual entry',
    value: 0,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    due: new Date(Date.now() + 86400000).toISOString(),
    priority: 'Medium',
    notes: '',
    related: '',
    type: 'Note',
    tags: '',
    probability: 30,
    lostReason: '',
    read: false
  };
}
export function seed(): Database {
  const counts: Record<Kind, number> = {
    leads: 60,
    contacts: 40,
    companies: 25,
    deals: 30,
    tasks: 40,
    tickets: 25,
    activities: 80,
    emails: 32
  };
  return Object.fromEntries(Object.entries(counts).map(([k, n]) => {
    const kind = k as Kind;
    return [kind, Array.from({
      length: n
    }, (_, i) => {
      const company = companies[i % 25];
      const person = names[i % 20];
      return {
        ...blank(),
        id: `${kind === 'tickets' ? 'TCK' : kind.slice(0, 3).toUpperCase()}-${1001 + i}`,
        name: kind === 'companies' ? company : kind === 'deals' ? `${company} · ${['Annual platform', 'Regional rollout', 'Enterprise renewal'][i % 3]}` : kind === 'tasks' ? `${['Call', 'Send proposal to', 'Follow up with', 'Review account for'][i % 4]} ${person}` : kind === 'tickets' ? `${['Account access assistance', 'Invoice clarification', 'Import validation issue', 'Integration setup', 'Subscription adjustment'][i % 5]}` : kind === 'activities' ? `${['Discovery call', 'Proposal review', 'Quarterly planning', 'Account note'][i % 4]}` : kind === 'emails' ? `${['Next steps from our discussion', 'Your proposal is ready', 'Checking in on the rollout', 'Thanks for your time'][i % 4]}` : person,
        email: `${person.toLowerCase().replaceAll(' ', '.')}${i >= 20 ? i : ''}@${company.toLowerCase().replaceAll(' ', '')}.example`,
        phone: `+44 20 7946 ${String(1000 + i)}`,
        company,
        owner: owners[i % 4],
        status: statuses[kind][i % statuses[kind].length],
        source: ['Website form', 'Ads', 'Social media', 'Manual entry', 'Referral', 'Other'][i % 6],
        value: 2500 + i * 7919 % 95000,
        created: new Date(Date.now() - i % 55 * 86400000).toISOString(),
        updated: new Date(Date.now() - i % 12 * 86400000).toISOString(),
        due: new Date(Date.now() + (i % 15 - 5) * 86400000).toISOString(),
        priority: ['Low', 'Medium', 'High', 'Urgent'][i % 4],
        notes: `Discuss ${company}'s upcoming rollout. Confirm stakeholders, budget and implementation timeline.`,
        related: `CON-${1001 + i % 40}`,
        type: ['Call', 'Meeting', 'Email', 'Follow-up', 'To-do'][i % 5],
        probability: [15, 40, 70, 100, 0][i % 5],
        tags: ['Enterprise', 'Partner', 'SMB'][i % 3]
      };
    })];
  })) as Database;
}
