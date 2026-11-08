import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { blank } from '../src/services/seed';

const data = new Map<string, string>();
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
  },
  configurable: true,
});

test('mock services: seeded counts, CRUD, conversion guards, reset and persistence', async () => {
  const { api } = await import('../src/services/api');
  let db = await api.reset();
  assert.equal(db.leads.length, 60);
  assert.equal(db.contacts.length, 40);
  assert.equal(db.companies.length, 25);
  assert.equal(db.deals.length, 30);
  assert.equal(db.tasks.length, 40);
  assert.equal(db.tickets.length, 25);
  assert.equal(db.activities.length, 80);
  const lead = { ...blank(), name: 'Service test lead', status: 'New' };
  await api.save('leads', lead);
  assert.equal((await api.all()).leads.length, 61);
  await api.save('leads', { ...lead, name: 'Updated lead' });
  assert.equal((await api.all()).leads.find(r => r.id === lead.id)?.name, 'Updated lead');
  db = await api.convert(lead.id, true);
  assert.equal(db.contacts.length, 41);
  assert.equal(db.deals.length, 31);
  assert.equal(db.leads.find(r => r.id === lead.id)?.status, 'Converted');
  await assert.rejects(() => api.convert(lead.id, true));
  await api.remove('leads', [lead.id]);
  assert.equal((await api.all()).leads.length, 60);
  db = await api.reset();
  assert.equal(db.contacts.length, 40);
  assert.equal(db.deals.length, 30);
  assert.ok(data.has('northwind.data.v1'));
});
