import { lazy, Suspense, useEffect, useState, Component, type ReactNode } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Contact, Building2, Columns3, ListTodo, Mail, BarChart3, Headphones, Settings as SettingsIcon, HelpCircle, PanelLeft, Search, Plus, Bell, Sun, Moon, X, Wifi, ChevronDown, Clock, Check, ArrowRight } from 'lucide-react';
import { useCRM } from '../store';
import { type Kind, type Role, owners } from '../types';
import { Modal, Avatar } from '../components/ui';
import RecordForm from '../components/RecordForm';
import { blank } from '../services/seed';
import { TourProvider, useTour } from '../tours/Tour';
const Records = lazy(() => import('../features/Records'));
const Dashboard = lazy(() => import('../features/Dashboard'));
const Settings = lazy(() => import('../features/Settings'));
const Inbox = lazy(() => import('../features/Inbox'));
const PublicForm = lazy(() => import('../features/PublicForm'));
class Boundary extends Component<{
  children: ReactNode;
}, {
  error: boolean;
}> {
  state = {
    error: false
  };
  static getDerivedStateFromError() {
    return {
      error: true
    };
  }
  render() {
    return this.state.error ? <section className="empty"><h1>Something went wrong</h1><p>Your demo records remain saved in this browser.</p><button onClick={() => location.reload()}>Reload workspace</button></section> : this.props.children;
  }
}
const nav = [{
  path: '/',
  label: 'Dashboard',
  icon: LayoutDashboard
}, {
  path: '/leads',
  label: 'Leads',
  icon: Users
}, {
  path: '/contacts',
  label: 'Contacts',
  icon: Contact
}, {
  path: '/companies',
  label: 'Companies',
  icon: Building2
}, {
  path: '/deals',
  label: 'Pipeline',
  icon: Columns3
}, {
  path: '/tasks',
  label: 'Tasks',
  icon: ListTodo
}, {
  path: '/emails',
  label: 'Inbox',
  icon: Mail
}, {
  path: '/reports',
  label: 'Reports',
  icon: BarChart3
}, {
  path: '/tickets',
  label: 'Support',
  icon: Headphones
}];
function Shell() {
  const {
    db,
    busy,
    error,
    load,
    settings,
    configure,
    message,
    toast,
    save
  } = useCRM();
  const tour = useTour();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState('');
  const [help, setHelp] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [quick, setQuick] = useState(false);
  const [create, setCreate] = useState<Kind | null>(null);
  const [tick, setTick] = useState(Date.now());
  const [tabs, setTabs] = useState<string[]>(['/']);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    setTabs(t => t.includes(location.pathname) ? t : [...t, location.pathname].slice(-7));
  }, [location.pathname]);
  useEffect(() => {
    const dark = settings.theme === 'dark' || settings.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.dataset.density = settings.density;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const change = () => {
      if (settings.theme === 'system') document.documentElement.classList.toggle('dark', mq.matches);
    };
    mq.addEventListener('change', change);
    return () => mq.removeEventListener('change', change);
  }, [settings.theme, settings.density]);
  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const scope = (db?.tasks ?? []).filter(t => settings.role !== 'Salesperson' || t.owner === owners[0]);
  const due = scope.filter(t => t.status !== 'Done' && new Date(t.due).getTime() < tick + 3600000);
  useEffect(() => {
    if (db && settings.reminders) {
      const n = db.tasks.filter(t => t.status !== 'Done' && new Date(t.due) < new Date() && (settings.role !== 'Salesperson' || t.owner === owners[0])).length;
      if (n) toast(`${n} overdue tasks need attention`);
    }
  }, [db, settings.role, settings.reminders, toast]);
  useEffect(() => {
    let g = false;
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPalette(p => !p);
        return;
      }
      if ((e.target as HTMLElement).matches('input,textarea,select,[contenteditable]')) return;
      if (e.key === '?') setHelp(true);
      if (e.key === '/') {
        e.preventDefault();
        setPalette(true);
      }
      if (e.key === 'n') setQuick(v => !v);
      if (g && e.key === 'l') navigate('/leads');
      g = e.key === 'g';
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [navigate]);
  const allowed = settings.role === 'Support Agent' ? nav.filter(n => ['/contacts', '/tickets'].includes(n.path)) : nav;
  const blocked = settings.role === 'Support Agent' && !['/contacts', '/tickets', '/settings'].includes(location.pathname);
  if (location.pathname === '/forms/website-inquiry') return <Suspense fallback={<div className="skeleton" />}><PublicForm /></Suspense>;
  return <div className={`app ${collapsed ? 'collapsed' : ''}`}><header className="topbar"><button aria-label="Toggle navigation" onClick={() => setCollapsed(!collapsed)}><PanelLeft /></button><NavLink to="/" className="wordmark"><span>N</span>Northwind <small>CRM</small></NavLink><button className="global-search" onClick={() => setPalette(true)}><Search />Search records and commands…<kbd>⌘ K</kbd></button><div className="top-actions"><div className="relative"><button className="primary quick-create" onClick={() => setQuick(!quick)}><Plus />New<ChevronDown size={12} /></button>{quick && <div className="dropdown">{(['leads', 'contacts', 'deals', 'tasks', 'tickets'] as Kind[]).filter(k => settings.role !== 'Support Agent' || k === 'tickets').map(k => <button key={k} onClick={() => {
              setCreate(k);
              setQuick(false);
            }}><Plus />{k.slice(0, -1)}</button>)}</div>}</div><button aria-label="Notifications" className="notification-button" onClick={() => setNotifications(!notifications)}><Bell />{settings.reminders && due.length > 0 && <span>{due.length}</span>}</button><button aria-label="Help and shortcuts" onClick={() => setHelp(true)}><HelpCircle /></button><button aria-label="Toggle theme" onClick={() => configure({
          theme: document.documentElement.classList.contains('dark') ? 'light' : 'dark'
        })}>{settings.theme === 'dark' ? <Sun /> : <Moon />}</button><select className="role-select" aria-label="Current role" value={settings.role} onChange={e => {
          configure({
            role: e.target.value as Role
          });
          if (e.target.value === 'Support Agent') navigate('/tickets');
        }}>{['Admin', 'Sales Manager', 'Salesperson', 'Support Agent'].map(r => <option key={r}>{r}</option>)}</select><Avatar name={owners[0]} /></div></header><aside className="sidebar"><small className="nav-section">WORKSPACE</small><nav>{allowed.map(({
          path,
          label,
          icon: Icon
        }) => <NavLink title={label} key={path} to={path} end={path === '/'}><Icon /><span>{label}</span>{path === '/tasks' && due.length > 0 && <small className="count">{due.length}</small>}</NavLink>)}</nav><div className="nav-bottom"><NavLink to="/settings"><SettingsIcon /><span>Settings</span></NavLink><button onClick={() => setHelp(true)}><HelpCircle /><span>Help & shortcuts</span></button><div className="demo-card"><span className="inline"><Wifi />Local demo</span><small>All changes saved in this browser</small></div></div></aside><div className="workspace"><div className="tab-strip">{tabs.map(p => <div key={p} className={p === location.pathname ? 'active' : ''}><button onClick={() => navigate(p)}>{nav.find(n => n.path === p)?.label ?? 'Settings'}</button>{p !== '/' && <button aria-label={`Close ${p} tab`} onClick={() => {
            setTabs(t => t.filter(x => x !== p));
            if (p === location.pathname) navigate('/');
          }}><X size={12} /></button>}</div>)}</div><main className="content"><Boundary key={location.pathname}>{busy ? <div className="loading"><div className="skeleton" /><div className="skeleton tall" /></div> : error ? <section className="empty"><h1>Could not load records</h1><p>{error}</p><button onClick={() => void load()}>Try again</button></section> : blocked ? <section className="empty"><h1>Support workspace</h1><p>Your current role has access to Support and read-only Contacts.</p><button onClick={() => navigate('/tickets')}><ArrowRight />Open support</button></section> : <Suspense fallback={<div className="skeleton tall" />}><Routes><Route path="/" element={<Dashboard />} />{(['leads', 'contacts', 'companies', 'deals', 'tasks', 'tickets'] as Kind[]).map(kind => <Route key={kind} path={`/${kind}`} element={<Records key={kind} kind={kind} />} />)}<Route path="/emails" element={<Inbox />} /><Route path="/reports" element={<Dashboard reports />} /><Route path="/settings" element={<Settings />} /><Route path="*" element={<section className="empty"><h1>Page not found</h1><NavLink to="/">Return to dashboard</NavLink></section>} /></Routes></Suspense>}</Boundary></main></div><footer className="statusbar"><span><Wifi size={12} /> Local storage · Demo mode</span><span>{owners[0]} · {settings.role}</span><span>Last loaded {new Date(tick).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })} · v1.0.0</span></footer>{message && <div role="status" className="toast"><Check />{message}<button aria-label="Dismiss notification" onClick={() => toast('')}><X /></button></div>}
{palette && <Modal title="Search & commands" onClose={() => setPalette(false)}><label className="search"><Search /><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search pages, people, companies…" /></label><div className="command-results">{allowed.filter(n => n.label.toLowerCase().includes(query.toLowerCase())).map(n => <button key={n.path} onClick={() => {
          navigate(n.path);
          setPalette(false);
        }}><n.icon />{n.label}<ArrowRight /></button>)}{query.length > 1 && (['leads', 'contacts', 'deals', 'tickets'] as Kind[]).flatMap(k => (db?.[k] ?? []).filter(r => r.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4).map(r => <button key={r.id} onClick={() => {
          navigate(`/${k}?q=${encodeURIComponent(r.name)}`);
          setPalette(false);
        }}><Search />{r.name}<small>{k}</small></button>))}</div></Modal>}
{help && <Modal title="Help & keyboard shortcuts" onClose={() => setHelp(false)}><button className="primary" onClick={() => {
        setHelp(false);
        tour.start();
      }}><HelpCircle />Start product tour</button><dl className="shortcuts"><dt>Open command palette</dt><dd>Ctrl / ⌘ + K</dd><dt>Go to leads</dt><dd>G then L</dd><dt>Quick create</dt><dd>N</dd><dt>Search</dt><dd>/</dd><dt>Shortcuts</dt><dd>?</dd><dt>Close dialogs / tour</dt><dd>Esc</dd></dl><a className="button" href="/forms/website-inquiry" target="_blank" rel="noreferrer"><ArrowRight />Website inquiry form preview</a></Modal>}
{notifications && <div className="notification-panel"><header><h2>Task reminders</h2><button aria-label="Close notifications" onClick={() => setNotifications(false)}><X /></button></header>{due.length ? due.map(t => <article key={t.id}><Clock className="danger-text" /><div><strong>{t.name}</strong><p className="danger-text">{new Date(t.due) < new Date() ? 'Overdue' : 'Due within an hour'}</p><div className="inline"><button onClick={() => void save('tasks', {
              ...t,
              status: 'Done'
            })}><Check />Complete</button><select aria-label="Snooze task" defaultValue="" onChange={e => {
              if (e.target.value) void save('tasks', {
                ...t,
                due: new Date(Date.now() + Number(e.target.value) * 60000).toISOString()
              });
            }}><option value="">Snooze…</option><option value="15">15 minutes</option><option value="60">1 hour</option><option value="1440">Tomorrow</option></select></div></div></article>) : <p>No pending reminders. You’re all caught up.</p>}</div>}{create && <RecordForm kind={create} item={{
      ...blank(),
      status: {
        leads: 'New',
        contacts: 'Lead',
        deals: 'Prospecting',
        tasks: 'To do',
        tickets: 'Open',
        companies: 'Active',
        emails: 'Drafts',
        activities: 'Logged'
      }[create]
    }} onClose={() => setCreate(null)} />}</div>;
}
export default function App() {
  return <TourProvider><Shell /></TourProvider>;
}
