import { seed } from './seed';
import type { Database, Kind, RecordItem } from '../types';
const KEY = 'northwind.data.v1';
function load(): Database {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Database;
  } catch {/* recover corrupt demo storage */}
  const db = seed();
  localStorage.setItem(KEY, JSON.stringify(db));
  return db;
}
let db = load();
async function wait() {
  await new Promise<void>(r => setTimeout(r, 120));
}
function persist() {
  localStorage.setItem(KEY, JSON.stringify(db));
}
export const api = {
  async all() {
    await wait();
    return structuredClone(db);
  },
  async save(kind: Kind, item: RecordItem) {
    await wait();
    const index = db[kind].findIndex(r => r.id === item.id);
    if (index < 0) db[kind].unshift(item);else db[kind][index] = item;
    persist();
    return structuredClone(item);
  },
  async remove(kind: Kind, ids: string[]) {
    await wait();
    db[kind] = db[kind].filter(r => !ids.includes(r.id));
    persist();
  },
  async reset() {
    await wait();
    db = seed();
    persist();
    return structuredClone(db);
  },
  async convert(id: string, withDeal: boolean) {
    await wait();
    const lead = db.leads.find(r => r.id === id);
    if (!lead) throw Error('Lead not found');
    if (lead.status === 'Converted') throw Error('This lead has already been converted');
    const contact = {
      ...lead,
      id: crypto.randomUUID(),
      status: 'Customer'
    };
    db.contacts.unshift(contact);
    if (!db.companies.some(c => c.name === lead.company)) db.companies.unshift({
      ...contact,
      id: crypto.randomUUID(),
      name: lead.company,
      status: 'Active'
    });
    if (withDeal) db.deals.unshift({
      ...lead,
      id: crypto.randomUUID(),
      name: `${lead.company} · New opportunity`,
      status: 'Prospecting',
      related: contact.id
    });
    lead.status = 'Converted';
    persist();
    return structuredClone(db);
  }
};
