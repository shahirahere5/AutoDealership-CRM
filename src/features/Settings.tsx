import { useState } from 'react';
import { Download, RotateCcw, Plus, Trash2, Mail, Check, ArrowUp, ArrowDown, Play } from 'lucide-react';
import { useCRM } from '../store';
import { Modal, download } from '../components/ui';
import { useTour } from '../tours/Tour';
export default function Settings() {
  const {
    settings,
    configure,
    reset,
    db,
    toast
  } = useCRM();
  const [confirm, setConfirm] = useState(false);
  const tour = useTour();
  const admin = settings.role === 'Admin';
  return <><div className="page-heading"><div><p className="breadcrumb">Workspace / Preferences</p><h1>Settings</h1></div></div><div className="settings-grid"><section className="panel"><h2>Appearance & workspace</h2><label>Theme<select value={settings.theme} onChange={e => configure({
            theme: e.target.value as typeof settings.theme
          })}>{['system', 'light', 'dark'].map(s => <option key={s}>{s}</option>)}</select></label><label>Table density<select value={settings.density} onChange={e => configure({
            density: e.target.value as typeof settings.density
          })}>{['Compact', 'Comfortable'].map(s => <option key={s}>{s}</option>)}</select></label><label className="inline"><input type="checkbox" checked={settings.reminders} onChange={e => configure({
            reminders: e.target.checked
          })} />Task reminders</label><button onClick={tour.start}><Play />Start product tour</button></section><section className="panel"><h2>Sales automation</h2><label className="inline"><input type="checkbox" disabled={!admin} checked={settings.roundRobin} onChange={e => configure({
            roundRobin: e.target.checked
          })} />Round-robin lead assignment</label><label className="inline"><input type="checkbox" disabled={!admin} checked={settings.autoFollowup} onChange={e => configure({
            autoFollowup: e.target.checked
          })} />Create follow-up task automatically</label><p className="muted">Follow-ups are created two days after a logged note or a deal board move.</p></section><section className="panel"><h2>Email connection · simulation only</h2><p className="muted">No account credentials are requested. No real emails are sent.</p>{['Gmail', 'Outlook'].map(s => <button key={s} disabled={!admin} onClick={() => {
          configure({
            connected: settings.connected === s ? '' : s
          });
          toast(settings.connected === s ? 'Mock account disconnected' : 'Mock account connected — no external access');
        }}>{settings.connected === s ? <Check /> : <Mail />}{s} · {settings.connected === s ? 'Disconnect' : 'Connect demo'}</button>)}</section><section className="panel"><h2>Demo data</h2><p className="muted">Records are stored only in this browser. Avoid entering sensitive customer information.</p><button onClick={() => download('northwind-demo.json', JSON.stringify(db, null, 2), 'application/json')}><Download />Export JSON</button><button disabled={!admin} className="destructive" onClick={() => setConfirm(true)}><RotateCcw />Reset demo data</button></section><section className="panel full"><h2>Pipeline stages</h2><p className="muted">Rename stages, set probabilities, and change their order. Renames update existing deals.</p>{settings.stages.map((s, i) => <div className="stage-editor" key={i}><input aria-label={`Stage ${i + 1} name`} disabled={!admin} defaultValue={s.name} onBlur={async e => {
            const name = e.target.value.trim();
            if (!name || settings.stages.some((v, j) => j !== i && v.name === name)) {
              e.target.value = s.name;
              return;
            }
            for (const d of db?.deals.filter(d => d.status === s.name) ?? []) await useCRM.getState().save('deals', {
              ...d,
              status: name
            });
            configure({
              stages: settings.stages.map((v, j) => j === i ? {
                ...v,
                name
              } : v)
            });
          }} /><input aria-label={`${s.name} probability`} disabled={!admin} type="number" min="0" max="100" value={s.probability} onChange={e => configure({
            stages: settings.stages.map((v, j) => j === i ? {
              ...v,
              probability: Math.min(100, Math.max(0, Number(e.target.value)))
            } : v)
          })} /><span>%</span><button aria-label="Move stage up" disabled={!admin || i === 0} onClick={() => {
            const a = [...settings.stages];
            [a[i - 1], a[i]] = [a[i], a[i - 1]];
            configure({
              stages: a
            });
          }}><ArrowUp /></button><button aria-label="Move stage down" disabled={!admin || i === settings.stages.length - 1} onClick={() => {
            const a = [...settings.stages];
            [a[i + 1], a[i]] = [a[i], a[i + 1]];
            configure({
              stages: a
            });
          }}><ArrowDown /></button><button aria-label="Delete empty stage" disabled={!admin || !!db?.deals.some(d => d.status === s.name)} onClick={() => configure({
            stages: settings.stages.filter((_, j) => j !== i)
          })}><Trash2 /></button></div>)}<button disabled={!admin} onClick={() => configure({
          stages: [...settings.stages, {
            name: `Stage ${settings.stages.length + 1}`,
            probability: 50,
            color: 'var(--brand)'
          }]
        })}><Plus />Add stage</button></section></div>{confirm && <Modal title="Reset all demo records?" onClose={() => setConfirm(false)}><p>Your changes will be replaced with the original sample records. Preferences are retained.</p><footer><button onClick={() => setConfirm(false)}>Cancel</button><button className="destructive" onClick={async () => {
          await reset();
          setConfirm(false);
        }}><RotateCcw />Reset data</button></footer></Modal>}</>;
}
