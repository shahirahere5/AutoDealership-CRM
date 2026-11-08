import { useEffect, useRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { X, Plus, Search, CheckCircle, Inbox } from 'lucide-react';
export function Button({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props}>{children}</button>;
}
export function Modal({
  title,
  children,
  onClose
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return <dialog ref={ref} onCancel={onClose} onClick={e => {
    if (e.target === e.currentTarget) onClose();
  }}><header><h2>{title}</h2><button aria-label="Close dialog" onClick={onClose}><X /></button></header>{children}</dialog>;
}
export function Badge({
  children
}: {
  children: ReactNode;
}) {
  const s = String(children);
  return <span className={`badge ${/Won|Done|Resolved|Converted|Customer/.test(s) ? 'success' : /Lost|Urgent|Overdue/.test(s) ? 'danger' : /New|Open|High/.test(s) ? 'warning' : ''}`}><CheckCircle size={12} />{children}</span>;
}
export function Avatar({
  name
}: {
  name: string;
}) {
  return <span className="avatar" title={name}>{name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>;
}
export function EmptyState({
  onAdd
}: {
  onAdd: () => void;
}) {
  return <div className="empty"><Inbox size={32} /><h2>No matching records</h2><p>Adjust your filters or create your first record.</p><button onClick={onAdd}><Plus />New record</button></div>;
}
export function SearchBox({
  value,
  onChange
}: {
  value: string;
  onChange: (s: string) => void;
}) {
  return <label className="search"><Search /><input aria-label="Search records" placeholder="Search records…" value={value} onChange={e => onChange(e.target.value)} /></label>;
}
export function download(name: string, text: string, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], {
    type
  }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function csv<T extends object>(rows: T[]) {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const escape = (v: unknown) => '"' + String(v ?? '').replace(/^[=+@-]/, "'$&").replaceAll('"', '""') + '"';
  return [keys.map(escape).join(','), ...rows.map(r => keys.map(k => escape(r[k as keyof T])).join(','))].join('\r\n');
}
