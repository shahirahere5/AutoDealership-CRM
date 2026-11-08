import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Download, RefreshCw, LayoutGrid, List, Globe, Check, Clock, CalendarDays, UserRound, Undo2 } from 'lucide-react';
import { useCRM } from '../store';
import { type Kind, type RecordItem, labels, owners, statuses } from '../types';
import { blank } from '../services/seed';
import { SearchBox, EmptyState, Modal, download, csv } from '../components/ui';
import DataGrid from '../components/DataGrid';
import Board from '../components/Board';
import RecordForm from '../components/RecordForm';
import { date } from '../lib/format';
export default function Records({
  kind
}: {
  kind: Kind;
}) {
  const {
    db,
    settings,
    save,
    remove,
    load,
    toast
  } = useCRM();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [status, setStatus] = useState('');
  const [owner, setOwner] = useState('');
  const [source, setSource] = useState('');
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [lost, setLost] = useState<RecordItem | null>(null);
  const [reason, setReason] = useState('');
  const [team, setTeam] = useState(false);
  const [undo, setUndo] = useState<RecordItem | null>(null);
  const [tab, setTab] = useState('All');
  const canCreate = settings.role !== 'Support Agent' || kind === 'tickets';
  const stages = kind === 'deals' ? settings.stages.map(s => s.name) : statuses[kind];
  let rows = (db?.[kind] ?? []).filter(r => (!search || `${r.name} ${r.company} ${r.email}`.toLowerCase().includes(search.toLowerCase())) && (!status || r.status === status) && (!owner || r.owner === owner) && (!source || r.source === source));
  if (settings.role === 'Salesperson' && !team) rows = rows.filter(r => r.owner === owners[0]);
  if (kind === 'tasks' && tab !== 'All') rows = rows.filter(r => tab === 'Completed' ? r.status === 'Done' : r.status !== 'Done' && (tab === 'Overdue' ? new Date(r.due) < new Date() : tab === 'Today' ? r.due.slice(0, 10) === new Date().toISOString().slice(0, 10) : new Date(r.due) > new Date()));
  const readOnly = settings.role === 'Support Agent' && kind !== 'tickets' || settings.role === 'Salesperson' && team;
  function create(stage?: string) {
    setEditing({
      ...blank(),
      owner: settings.role === 'Salesperson' ? owners[0] : settings.roundRobin ? owners[(db?.[kind].length ?? 0) % owners.length] : owners[0],
      status: stage ?? stages[0]
    });
  }
  async function move(row: RecordItem, s: string) {
    if (readOnly) return;
    if (s === 'Lost') {
      setLost(row);
      return;
    }
    setUndo(row);
    await save(kind, {
      ...row,
      status: s,
      probability: settings.stages.find(x => x.name === s)?.probability ?? row.probability
    });
    toast(s === 'Won' ? 'Deal won. Excellent work!' : 'Stage updated — undo is available below.');
    if (settings.autoFollowup) await save('tasks', {
      ...blank(),
      name: `Follow up: ${row.name}`,
      related: row.id,
      status: 'To do',
      type: 'Follow-up',
      due: new Date(Date.now() + 172800000).toISOString()
    });
  }
  return <><div className="page-heading"><div><p className="breadcrumb">Workspace / {labels[kind]}</p><h1>{labels[kind]} <small>{rows.length}</small></h1></div><div className="inline">{kind === 'contacts' && <a className="button" href="/companies"><UserRound />Companies</a>}{['leads', 'deals', 'tasks', 'tickets'].includes(kind) && <div className="segmented"><button aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')}><List /></button><button aria-label="Board view" aria-pressed={view === 'board'} onClick={() => setView('board')}><LayoutGrid /></button>{kind === 'tasks' && <button aria-label="Calendar view" onClick={() => setView('calendar')}><CalendarDays /></button>}</div>}{canCreate && !readOnly && <button className="primary" onClick={() => create()}><Plus />New {kind === 'deals' ? 'deal' : kind === 'companies' ? 'company' : kind.slice(0, -1)}</button>}</div></div>
{kind === 'tasks' && <div className="tabs">{['All', 'Today', 'Upcoming', 'Overdue', 'Completed'].map(t => <button className={tab === t ? 'active' : ''} key={t} onClick={() => setTab(t)}><Clock />{t}</button>)}</div>}
<div className="toolbar" data-tour="records"><SearchBox value={search} onChange={setSearch} /><select aria-label="Filter status" value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{stages.map(s => <option key={s}>{s}</option>)}</select><select aria-label="Filter owner" value={owner} onChange={e => setOwner(e.target.value)}><option value="">All owners</option>{owners.map(o => <option key={o}>{o}</option>)}</select>{kind === 'leads' && <select aria-label="Filter source" value={source} onChange={e => setSource(e.target.value)}><option value="">All sources</option>{['Website form', 'Ads', 'Social media', 'Manual entry', 'Referral', 'Other'].map(s => <option key={s}>{s}</option>)}</select>}<button onClick={() => download(`${kind}.csv`, csv(rows))}><Download />Export</button><button onClick={() => void load()}><RefreshCw />Refresh</button>{settings.role === 'Salesperson' && <label className="inline"><input type="checkbox" checked={team} onChange={e => setTeam(e.target.checked)} />Team (read-only)</label>}{kind === 'leads' && !readOnly && <button onClick={async () => {
        await save('leads', {
          ...blank(),
          name: 'Rania Mahmood',
          email: `rania.${Date.now()}@cedar.example`,
          company: 'Cedar Analytics',
          source: 'Website form',
          status: 'New',
          notes: 'Interested in a 25-seat enterprise rollout.'
        });
        toast('Website inquiry captured');
      }}><Globe />Simulate website inquiry</button>}</div>
{selected.length > 0 && !readOnly && <div className="selection-bar"><span>{selected.length} selected</span><select aria-label="Bulk assign owner" defaultValue="" onChange={async e => {
        if (!e.target.value) return;
        await Promise.all(rows.filter(r => selected.includes(r.id)).map(r => save(kind, {
          ...r,
          owner: e.target.value
        })));
        toast('Owners assigned');
        setSelected([]);
      }}><option value="">Assign owner…</option>{owners.map(o => <option key={o}>{o}</option>)}</select>{kind === 'tasks' && <button onClick={async () => {
        for (const r of rows.filter(r => selected.includes(r.id))) await save(kind, {
          ...r,
          status: 'Done'
        });
        setSelected([]);
      }}><Check />Complete</button>}<button className="destructive" onClick={() => setConfirm(true)}><Trash2 />Delete</button></div>}
{undo && <div className="selection-bar">Stage updated <button onClick={async () => {
        await save(kind, undo);
        setUndo(null);
      }}><Undo2 />Undo</button></div>}
{!rows.length ? <EmptyState onAdd={() => create()} /> : view === 'board' ? <Board rows={rows} stages={stages} onOpen={setEditing} onMove={(r, s) => void move(r, s)} onAdd={create} /> : view === 'calendar' ? <div className="calendar">{Array.from({
        length: 35
      }, (_, i) => {
        const day = new Date();
        day.setDate(1);
        day.setDate(i + 1);
        return <section key={i}><strong>{date(day.toISOString())}</strong>{rows.filter(r => r.due.slice(0, 10) === day.toISOString().slice(0, 10)).map(r => <button key={r.id} onClick={() => setEditing(r)}>{r.name}</button>)}</section>;
      })}</div> : <DataGrid rows={rows} onOpen={setEditing} selected={selected} onSelect={setSelected} />}
{editing && <RecordForm kind={kind} item={editing} onClose={() => setEditing(null)} />}{confirm && <Modal title={`Delete ${selected.length} records?`} onClose={() => setConfirm(false)}><p>Deletion cannot be undone.</p><footer><button onClick={() => setConfirm(false)}>Cancel</button><button className="destructive" onClick={async () => {
          await remove(kind, selected);
          setSelected([]);
          setConfirm(false);
          toast('Records deleted');
        }}><Trash2 />Delete records</button></footer></Modal>}{lost && <Modal title="Why was this deal lost?" onClose={() => setLost(null)}><label>Lost reason<textarea value={reason} onChange={e => setReason(e.target.value)} required /></label><footer><button className="primary" disabled={!reason.trim()} onClick={async () => {
          setUndo(lost);
          await save(kind, {
            ...lost,
            status: 'Lost',
            lostReason: reason,
            probability: 0
          });
          setLost(null);
          setReason('');
        }}><Check />Save reason</button></footer></Modal>}</>;
}
