import { useDraggable, useDroppable, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Plus, Clock, GripVertical } from 'lucide-react';
import type { RecordItem } from '../types';
import { money, date } from '../lib/format';
import { Avatar } from './ui';
function Card({
  row,
  onOpen
}: {
  row: RecordItem;
  onOpen: (r: RecordItem) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: row.id
  });
  return <article className="deal-card" ref={setNodeRef} style={{
    transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined,
    opacity: isDragging ? .5 : 1
  }}><div className="inline"><button aria-label={`Drag ${row.name}`} {...attributes} {...listeners}><GripVertical /></button><button className="text-button" onClick={() => onOpen(row)}>{row.name}</button></div><p>{row.company}</p><strong className="mono">{money(row.value)}</strong><footer><span className={new Date(row.due) < new Date() ? 'danger-text' : ''}><Clock size={12} /> {date(row.due)}</span><Avatar name={row.owner} /></footer>{Date.now() - new Date(row.updated).getTime() > 7 * 86400000 && <small className="warning-text">No activity in 7+ days</small>}</article>;
}
function Column({
  name,
  rows,
  onOpen,
  onAdd,
  weighted
}: {
  name: string;
  rows: RecordItem[];
  onOpen: (r: RecordItem) => void;
  onAdd: (s: string) => void;
  weighted: boolean;
}) {
  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id: name
  });
  return <section ref={setNodeRef} className={`board-column ${isOver ? 'drop-active' : ''}`}><header><span>{name} <small>{rows.length}</small></span><button aria-label={`Add to ${name}`} onClick={() => onAdd(name)}><Plus /></button></header><p className="mono column-total">{money(rows.reduce((sum, r) => sum + r.value * (weighted ? r.probability / 100 : 1), 0))}</p>{rows.map(row => <Card key={row.id} row={row} onOpen={onOpen} />)}</section>;
}
export default function Board({
  rows,
  stages,
  onOpen,
  onMove,
  onAdd
}: {
  rows: RecordItem[];
  stages: string[];
  onOpen: (r: RecordItem) => void;
  onMove: (r: RecordItem, s: string) => void;
  onAdd: (s: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 6
    }
  }), useSensor(KeyboardSensor));
  function end(e: DragEndEvent) {
    const row = rows.find(r => r.id === e.active.id);
    if (row && e.over && row.status !== e.over.id) onMove(row, String(e.over.id));
  }
  return <DndContext sensors={sensors} onDragEnd={end}><div className="board">{stages.map(name => <Column key={name} name={name} rows={rows.filter(r => r.status === name)} onOpen={onOpen} onAdd={onAdd} weighted={false} />)}</div></DndContext>;
}
