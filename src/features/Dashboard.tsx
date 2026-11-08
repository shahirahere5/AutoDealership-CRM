import { useState } from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, Target, Clock, DollarSign, Users, CheckCircle, Download, Printer, BarChart3 } from 'lucide-react';
import { useCRM } from '../store';
import { money } from '../lib/format';
import { owners } from '../types';
import { csv, download } from '../components/ui';
export default function Dashboard({
  reports = false
}: {
  reports?: boolean;
}) {
  const {
    db,
    settings,
    save
  } = useCRM();
  const [owner, setOwner] = useState('');
  const [report, setReport] = useState('Sales performance');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  if (!db) return null;
  const visibleOwner = settings.role === 'Salesperson' ? owners[0] : owner;
  const deals = db.deals.filter(d => (!visibleOwner || d.owner === visibleOwner) && (!from || d.created.slice(0, 10) >= from) && (!to || d.created.slice(0, 10) <= to));
  const leads = db.leads.filter(d => !visibleOwner || d.owner === visibleOwner);
  const tasks = db.tasks.filter(d => !visibleOwner || d.owner === visibleOwner);
  const won = deals.filter(d => d.status === 'Won');
  const revenue = won.reduce((s, d) => s + d.value, 0);
  const open = deals.filter(d => !['Won', 'Lost'].includes(d.status));
  const overdue = tasks.filter(t => t.status !== 'Done' && new Date(t.due) < new Date());
  const stageData = settings.stages.map(s => ({
    name: s.name,
    value: deals.filter(d => d.status === s.name).reduce((sum, d) => sum + d.value, 0)
  }));
  const sourceData = ['Website form', 'Ads', 'Social media', 'Manual entry', 'Referral', 'Other'].map(name => ({
    name,
    value: leads.filter(l => l.source === name).length
  }));
  const trend = Array.from({
    length: 6
  }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5 + i);
    return {
      name: d.toLocaleDateString('en', {
        month: 'short'
      }),
      revenue: won.filter(w => new Date(w.created).getMonth() === d.getMonth() && new Date(w.created).getFullYear() === d.getFullYear()).reduce((s, w) => s + w.value, 0)
    };
  });
  const closed = deals.filter(d => ['Won', 'Lost'].includes(d.status));
  const kpis = [{
    label: 'Won revenue · selected period',
    value: money(revenue),
    icon: DollarSign
  }, {
    label: 'Open pipeline',
    value: money(open.reduce((s, d) => s + d.value, 0)),
    icon: BarChart3
  }, {
    label: 'Win rate',
    value: `${closed.length ? Math.round(won.length / closed.length * 100) : 0}%`,
    icon: Target
  }, {
    label: 'New leads',
    value: String(leads.filter(l => l.status === 'New').length),
    icon: Users
  }, {
    label: 'Lead conversion',
    value: `${leads.length ? Math.round(leads.filter(l => l.status === 'Converted').length / leads.length * 100) : 0}%`,
    icon: ArrowUpRight
  }, {
    label: 'Overdue tasks',
    value: String(overdue.length),
    icon: Clock
  }];
  return <><div className="page-heading"><div><p className="breadcrumb">Workspace / {reports ? 'Reports' : 'Overview'}</p><h1>{reports ? 'Reports & analytics' : 'Sales overview'}</h1><p className="muted">A clear view of your pipeline, customers and next steps.</p></div><span className="badge"><CheckCircle size={12} /> Live demo data</span></div>{reports && <div className="toolbar"><select aria-label="Report" value={report} onChange={e => setReport(e.target.value)}>{['Sales performance', 'Lead sources', 'Conversion rates', 'Pipeline velocity', 'Activity report', 'Support summary'].map(s => <option key={s}>{s}</option>)}</select><label>From<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label><label>To<input type="date" value={to} onChange={e => setTo(e.target.value)} /></label><select aria-label="Report owner" value={owner} onChange={e => setOwner(e.target.value)}><option value="">All owners</option>{owners.map(o => <option key={o}>{o}</option>)}</select><button onClick={() => download('sales-report.csv', csv(deals))}><Download />Export CSV</button><button onClick={() => window.print()}><Printer />Print</button></div>}<section className="kpis" data-tour="kpis">{kpis.map(({
        label,
        value,
        icon: Icon
      }, i) => <article key={label} className={i === 0 ? 'featured' : ''}><div><span>{label}</span><Icon /></div><strong>{value}</strong><small>{i === 5 ? 'Requires attention' : 'Calculated from seeded records'}</small></article>)}</section><div className="dashboard-grid"><section className="panel wide"><header><h2>{reports ? report : 'Revenue performance'}</h2><span className="muted">Last 6 months · USD</span></header><div className="chart" role="img" aria-label="Won revenue by month"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="name" /><YAxis tickFormatter={n => `${n / 1000}k`} /><Tooltip contentStyle={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text)'
              }} formatter={v => money(Number(v))} /><Legend /><Area type="monotone" dataKey="revenue" stroke="var(--brand)" fill="var(--brand-soft)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></section><section className="panel"><header><h2>My day</h2><Clock /></header><div className="day-list">{tasks.filter(t => t.status !== 'Done').slice(0, 5).map(t => <label key={t.id} className="task-line"><input type="checkbox" onChange={() => void save('tasks', {
              ...t,
              status: 'Done'
            })} /><span>{t.name}<small className={new Date(t.due) < new Date() ? 'danger-text' : ''}>{new Date(t.due).toLocaleDateString()} · {t.type}</small></span></label>)}</div><a href="/tasks" className="text-button">View all tasks →</a></section><section className="panel"><header><h2>Pipeline by stage</h2><Target /></header><div className="chart" role="img" aria-label="Pipeline value by stage"><ResponsiveContainer><BarChart data={stageData} layout="vertical"><CartesianGrid stroke="var(--border)" /><XAxis type="number" hide /><YAxis type="category" dataKey="name" width={95} fontSize={12} /><Tooltip contentStyle={{
                background: 'var(--surface)'
              }} formatter={v => money(Number(v))} /><Legend /><Bar dataKey="value" fill="var(--brand)" radius={[0, 3, 3, 0]} /></BarChart></ResponsiveContainer></div></section><section className="panel"><header><h2>Leads by source</h2><Users /></header><div className="chart" role="img" aria-label="Lead source distribution"><ResponsiveContainer><PieChart><Pie data={sourceData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80}>{sourceData.map((s, i) => <Cell key={s.name} fill={['var(--brand)', 'var(--info)', 'var(--success)', 'var(--warning)', 'var(--muted)', 'var(--border)'][i]} />)}</Pie><Tooltip contentStyle={{
                background: 'var(--surface)'
              }} /><Legend iconSize={8} /></PieChart></ResponsiveContainer></div></section><section className="panel"><header><h2>Monthly targets</h2><Target /></header>{owners.filter(o => !visibleOwner || o === visibleOwner).map(o => {
          const amount = won.filter(d => d.owner === o).reduce((s, d) => s + d.value, 0);
          return <div className="target" key={o}><div><span>{o}</span><span className="mono">{money(amount)} / $250k</span></div><progress max={250000} value={amount} aria-label={`${o} target`} /></div>;
        })}<p className="muted">Team target: $1,000,000</p><progress max={1000000} value={revenue} aria-label="Team target" /></section></div>{reports && <section className="panel"><h2>Report records</h2><table><thead><tr><th>Opportunity</th><th>Owner</th><th>Stage</th><th>Value</th></tr></thead><tbody>{deals.map(d => <tr key={d.id}><td>{d.name}</td><td>{d.owner}</td><td>{d.status}</td><td>{money(d.value)}</td></tr>)}</tbody></table></section>}</>;
}
