import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { blank } from '../services/seed';
import { useCRM } from '../store';
export default function PublicForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const {
    save
  } = useCRM();
  return <main className="public-form"><span className="wordmark">N / Northwind</span><h1>Let’s talk about your team</h1><p>Tell us what you need. Our sales team will follow up shortly.</p>{sent ? <p className="inline"><CheckCircle />Thank you. Your inquiry has been captured.</p> : <form onSubmit={async e => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      setBusy(true);
      try {
        await save('leads', {
          ...blank(),
          name: String(data.get('name')),
          email: String(data.get('email')),
          company: String(data.get('company')),
          notes: String(data.get('notes')),
          source: 'Website form',
          status: 'New'
        });
        setSent(true);
      } finally {
        setBusy(false);
      }
    }}><label>Your name<input required name="name" minLength={2} /></label><label>Work email<input required type="email" name="email" /></label><label>Company<input required name="company" /></label><label>How can we help?<textarea name="notes" rows={4} /></label><button className="primary" disabled={busy}><Send />{busy ? 'Submitting…' : 'Send inquiry'}</button><small>Demo form. Please do not submit sensitive information.</small></form>}</main>;
}
