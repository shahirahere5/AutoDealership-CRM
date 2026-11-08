import { useState } from 'react';
import { Mail, Send, Plus, FileText, Clock, CheckCheck, Ticket, Save } from 'lucide-react';
import { useCRM } from '../store';
import { blank } from '../services/seed';
import { Modal, Avatar } from '../components/ui';
export default function Inbox() {
  const {
    db,
    save,
    toast
  } = useCRM();
  const [folder, setFolder] = useState('Inbox');
  const [selected, setSelected] = useState('');
  const [compose, setCompose] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const emails = db?.emails.filter(e => e.status === folder) ?? [];
  const current = db?.emails.find(e => e.id === selected) ?? emails[0];
  async function send(draft = false) {
    if (!to || !subject || !body) {
      toast('Add a recipient, subject and message');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      toast('Enter a valid recipient email');
      return;
    }
    setSending(true);
    try {
      const contact = db?.contacts.find(c => c.email === to);
      const email = {
        ...blank(),
        name: subject,
        email: to,
        notes: body,
        status: draft ? 'Drafts' : 'Sent',
        related: contact?.id ?? '',
        company: contact?.company ?? '',
        type: 'Email'
      };
      await save('emails', email);
      if (!draft) {
        await save('activities', {
          ...email,
          id: crypto.randomUUID(),
          status: 'Logged'
        });
        setTimeout(() => {
          void save('emails', {
            ...email,
            read: true
          });
        }, 10000);
      }
      toast(draft ? 'Draft saved' : 'Email sent (simulation)');
      setCompose(false);
      setTo('');
      setSubject('');
      setBody('');
    } finally {
      setSending(false);
    }
  }
  return <><div className="page-heading"><div><p className="breadcrumb">Workspace / Communication</p><h1>Inbox</h1></div><button className="primary" onClick={() => setCompose(true)}><Plus />Compose</button></div><section className="inbox"><aside>{[{
          name: 'Inbox',
          icon: Mail
        }, {
          name: 'Sent',
          icon: Send
        }, {
          name: 'Drafts',
          icon: FileText
        }, {
          name: 'Scheduled',
          icon: Clock
        }].map(({
          name,
          icon: Icon
        }) => <button className={folder === name ? 'active' : ''} key={name} onClick={() => {
          setFolder(name);
          setSelected('');
        }}><Icon />{name}<small>{db?.emails.filter(e => e.status === name).length}</small></button>)}</aside><div className="threads">{emails.map(e => <button className={current?.id === e.id ? 'active' : ''} key={e.id} onClick={() => setSelected(e.id)}><div className="inline"><Avatar name={e.company} /><strong>{e.company}</strong></div><strong>{e.name}</strong><p>{e.notes}</p><small>{new Date(e.created).toLocaleDateString()} {e.read ? '· Opened' : ''}</small></button>)}</div><article className="conversation">{current ? <><header><h2>{current.name}</h2><p>{current.email}</p><span className="inline"><CheckCheck /> {current.read ? 'Opened (simulated)' : 'Delivered (simulated)'}</span></header><div className="message"><p>{current.notes}</p><small>{new Date(current.created).toLocaleString()}</small></div><div className="toolbar"><button onClick={() => {
              setTo(current.email);
              setSubject(`Re: ${current.name}`);
              setCompose(true);
            }}><Send />Reply</button><button onClick={async () => {
              await save('tickets', {
                ...blank(),
                name: current.name,
                email: current.email,
                notes: current.notes,
                company: current.company,
                related: current.related,
                status: 'Open'
              });
              toast('Ticket created from email');
            }}><Ticket />Convert to ticket</button></div></> : <p>Select a conversation.</p>}</article></section>{compose && <Modal title="Compose email · demo" onClose={() => setCompose(false)}><label>To<input type="email" list="contacts" value={to} onChange={e => setTo(e.target.value)} /><datalist id="contacts">{db?.contacts.map(c => <option key={c.id} value={c.email}>{c.name}</option>)}</datalist></label><label>Template<select defaultValue="" onChange={e => {
          const contact = db?.contacts.find(c => c.email === to);
          const t = e.target.value;
          setSubject(t);
          setBody(`Hi ${contact?.name.split(' ')[0] ?? 'there'},\n\n${t === 'Intro' ? `I'd like to learn more about ${contact?.company ?? 'your team'} and your priorities.` : t === 'Follow-up' ? 'Following up on our recent conversation. Would you have time to discuss next steps?' : t === 'Proposal sent' ? 'Your proposal is ready for review. Please let me know if you have any questions.' : 'Thank you for your time. I look forward to working together.'}\n\nBest regards,\nAmira`);
        }}><option value="">Choose template…</option>{['Intro', 'Follow-up', 'Proposal sent', 'Thank you'].map(t => <option key={t}>{t}</option>)}</select></label><label>Subject<input value={subject} onChange={e => setSubject(e.target.value)} /></label><label>Message<textarea rows={10} value={body} onChange={e => setBody(e.target.value)} /></label><footer><button disabled={sending} onClick={() => void send(true)}><Save />Save draft</button><button className="primary" disabled={sending} onClick={() => void send()}><Send />{sending ? 'Sending…' : 'Send demo email'}</button></footer></Modal>}</>;
}
