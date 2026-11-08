import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import type { Database, Kind, RecordItem, Settings } from '../types';
interface State {
  db: Database | null;
  busy: boolean;
  error: string;
  settings: Settings;
  message: string;
  load: () => Promise<void>;
  save: (kind: Kind, item: RecordItem) => Promise<void>;
  remove: (kind: Kind, ids: string[]) => Promise<void>;
  convert: (id: string, deal: boolean) => Promise<void>;
  reset: () => Promise<void>;
  configure: (s: Partial<Settings>) => void;
  toast: (s: string) => void;
}
export const useCRM = create<State>()(persist((set, get) => ({
  db: null,
  busy: true,
  error: '',
  message: '',
  settings: {
    theme: 'system',
    density: 'Compact',
    role: 'Admin',
    roundRobin: false,
    autoFollowup: false,
    reminders: true,
    connected: '',
    stages: [{
      name: 'Prospecting',
      probability: 15,
      color: 'var(--brand)'
    }, {
      name: 'Proposal',
      probability: 40,
      color: 'var(--info)'
    }, {
      name: 'Negotiation',
      probability: 70,
      color: 'var(--warning)'
    }, {
      name: 'Won',
      probability: 100,
      color: 'var(--success)'
    }, {
      name: 'Lost',
      probability: 0,
      color: 'var(--danger)'
    }]
  },
  load: async () => {
    try {
      set({
        db: await api.all(),
        busy: false,
        error: ''
      });
    } catch (e) {
      set({
        busy: false,
        error: String(e)
      });
    }
  },
  save: async (kind, item) => {
    await api.save(kind, {
      ...item,
      updated: new Date().toISOString()
    });
    set({
      db: await api.all()
    });
  },
  remove: async (kind, ids) => {
    await api.remove(kind, ids);
    set({
      db: await api.all()
    });
  },
  convert: async (id, deal) => {
    set({
      db: await api.convert(id, deal)
    });
    get().toast('Lead converted successfully');
  },
  reset: async () => {
    set({
      db: await api.reset()
    });
    get().toast('Demo data reset');
  },
  configure: s => set({
    settings: {
      ...get().settings,
      ...s
    }
  }),
  toast: message => {
    set({
      message
    });
    setTimeout(() => set({
      message: ''
    }), 4500);
  }
}), {
  name: 'northwind.preferences.v1',
  partialize: s => ({
    settings: s.settings
  })
}));
