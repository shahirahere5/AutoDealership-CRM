import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Trash2, Phone, Mail, Check, ArrowRightLeft, Plus, MessageSquare } from 'lucide-react';
import { Modal, Badge } from './ui';
import { useCRM } from '../store';
import { blank } from '../services/seed';
import { type Kind, type RecordItem, owners, statuses } from '../types';
const schema = z.object({
  name: z.string().min(2, 'Enter at least 2 characters'),
  email: z.union([z.literal(''), z.string().email('Enter a valid email')]),
  phone: z.string(),
  company: z.string(),
  owner: z.string(),
  status: z.string(),
  source: z.string(),
  value: z.coerce.number().min(0),
  due: z.string().min(1),
  priority: z.string(),
  notes: z.string(),
  tags: z.string(),
  type: z.string()
});
type Fields = z.infer<typeof schema>;
export default function RecordForm({
  kind,
  item,
  onClose
}: {
  kind: Kind;
  item: RecordItem;
  onClose: () => void;
}) {
  const {
    db,
    save,
    remove,
    convert,
    toast,
    settings
  } = useCRM();
  const [confirm, setConfirm] = useState(false);
  const [withDeal, setWithDeal] = useState(true);
  const [converting, setConverting] = useState(false);
  const [activity, setActivity] = useState('');
  const existing = !!db?.[kind].some(r => r.id === item.id);
  const canEdit = settings.role === 'Admin' || settings.role === 'Sales Manager' || (settings.role === 'Support Agent' ? kind === 'tickets' : item.owner === owners[0]);
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting
    }
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...item,
      due: item.due.slice(0, 16)
    }
  });
  async function submit(v: Fields) {
    if (kind === 'contacts' && v.email && db?.contacts.some(c => c.email.toLowerCase() === v.email.toLowerCase() && c.id !== item.id)) {
      toast('A contact with this email already exists. Open that contact to avoid a duplicate.');
      return;
    }
    try {
      await save(kind, {
        ...item,
        ...v,
        due: new Date(v.due).toISOString()
      });
      toast('Record saved');
      onClose();
    } catch (e) {
      toast(String(e));
    }
  }
  async function log() {
    if (!activity.trim()) return;
    await save('activities', {
      ...blank(),
      name: activity,
      related: item.id,
      company: item.company,
      type: 'Note',
      status: 'Logged'
    });
    setActivity('');
    if (settings.autoFollowup) {
      await save('tasks', {
        ...blank(),
        name: `Follow up with ${item.name}`,
        related: item.id,
        status: 'To do',
        type: 'Follow-up',
        due: new Date(Date.now() + 2 * 86400000).toISOString()
      });
    }
    toast('Activity logged');
  }
  return <Modal title={`${existing ? 'Record details' : 'Create ' + kind.slice(0, -1)}`} onClose={onClose}><div className="record-heading"><Badge>{item.status}</Badge><span className="mono">{item.id}</span></div>{existing && <div className="toolbar"><a className="button" href={`tel:${item.phone}`}><Phone />Call</a><a className="button" href={`mailto:${item.email}`}><Mail />Email</a>{canEdit && kind === 'leads' && item.status !== 'Converted' && <button onClick={() => setConverting(true)}><ArrowRightLeft />Convert lead</button>}{canEdit && <button onClick={async () => {
        await save('tasks', {
          ...blank(),
          name: `Follow up with ${item.name}`,
          related: item.id,
          status: 'To do',
          type: 'Follow-up'
        });
        toast('Follow-up task created');
      }}><Plus />Add task</button>}{kind === 'contacts' && settings.role !== 'Salesperson' && <button onClick={async () => {
        await save('tickets', {
          ...blank(),
          name: `Support for ${item.name}`,
          email: item.email,
          company: item.company,
          related: item.id,
          status: 'Open'
        });
        toast('Support ticket created');
      }}><Plus />Create ticket</button>}</div>}
<form onSubmit={handleSubmit(submit)}><fieldset disabled={!canEdit || isSubmitting}><div className="form-grid">{(['name', 'email', 'phone', 'company', 'value', 'due', 'tags'] as const).map(key => <label key={key}>{key === 'name' ? 'Name / subject' : key === 'due' ? 'Due / expected close' : key}<input {...register(key)} type={key === 'value' ? 'number' : key === 'due' ? 'datetime-local' : key === 'email' ? 'email' : 'text'} />{errors[key] && <small className="danger-text">{errors[key]?.message}</small>}</label>)}<label>Owner<select {...register('owner')}>{owners.map(o => <option key={o}>{o}</option>)}</select></label><label>Status / move to stage<select {...register('status')}>{(kind === 'deals' ? settings.stages.map(s => s.name) : statuses[kind]).map(s => <option key={s}>{s}</option>)}</select></label><label>Source<select {...register('source')}>{['Website form', 'Ads', 'Social media', 'Manual entry', 'Referral', 'Other'].map(s => <option key={s}>{s}</option>)}</select></label><label>Priority<select {...register('priority')}>{['Low', 'Medium', 'High', 'Urgent'].map(s => <option key={s}>{s}</option>)}</select></label><label>Activity / task type<select {...register('type')}>{['Call', 'Meeting', 'Email', 'Follow-up', 'To-do', 'Note'].map(s => <option key={s}>{s}</option>)}</select></label></div><label>Notes<textarea {...register('notes')} rows={3} /></label><footer>{existing && <button type="button" className="destructive" onClick={() => setConfirm(true)}><Trash2 />Delete</button>}<button className="primary" type="submit" disabled={isSubmitting}><Save />{isSubmitting ? 'Saving…' : 'Save record'}</button></footer></fieldset></form>
{existing && <section className="timeline"><h2>Activity timeline</h2>{db?.activities.filter(a => a.related === item.id).sort((a, b) => b.created.localeCompare(a.created)).map(a => <article key={a.id}><MessageSquare /><div><strong>{a.name}</strong><p>{new Date(a.created).toLocaleString()} · {a.type}</p></div></article>)}{canEdit && <div className="inline"><input aria-label="Activity note" placeholder="Log a call, meeting or note…" value={activity} onChange={e => setActivity(e.target.value)} /><button onClick={() => void log()}><Plus />Log note</button></div>}{kind === 'companies' && <><h2>Related contacts & deals</h2>{[...(db?.contacts ?? []), ...(db?.deals ?? [])].filter(r => r.company === item.name).map(r => <p key={r.id}>{r.name} · {r.status}</p>)}</>}</section>}
{confirm && <Modal title="Delete this record?" onClose={() => setConfirm(false)}><p>This cannot be undone.</p><footer><button onClick={() => setConfirm(false)}>Cancel</button><button className="destructive" onClick={async () => {
          await remove(kind, [item.id]);
          onClose();
          toast('Record deleted');
        }}><Trash2 />Delete record</button></footer></Modal>}
{converting && <Modal title="Convert lead" onClose={() => setConverting(false)}><p>Create a contact and, if needed, a company. This lead will be marked Converted.</p><label className="inline"><input type="checkbox" checked={withDeal} onChange={e => setWithDeal(e.target.checked)} />Also create a deal</label><footer><button className="primary" onClick={async () => {
          try {
            await convert(item.id, withDeal);
            onClose();
          } catch (e) {
            toast(String(e));
          }
        }}><Check />Convert</button></footer></Modal>}</Modal>;
}
