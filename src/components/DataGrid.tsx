import { useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, flexRender, type ColumnDef, type SortingState } from '@tanstack/react-table';
import { ArrowUpDown, ChevronLeft, ChevronRight, Columns3 } from 'lucide-react';
import type { RecordItem } from '../types';
import { Badge, Avatar } from './ui';
import { money, date } from '../lib/format';
export default function DataGrid({
  rows,
  onOpen,
  selected,
  onSelect
}: {
  rows: RecordItem[];
  onOpen: (r: RecordItem) => void;
  selected: string[];
  onSelect: (ids: string[]) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [visibility, setVisibility] = useState({});
  const columns: ColumnDef<RecordItem>[] = [{
    id: 'select',
    header: () => <input type="checkbox" aria-label="Select filtered records" checked={rows.length > 0 && selected.length === rows.length} onChange={e => onSelect(e.target.checked ? rows.map(r => r.id) : [])} />,
    cell: ({
      row
    }) => <input type="checkbox" aria-label={`Select ${row.original.name}`} checked={selected.includes(row.original.id)} onChange={e => onSelect(e.target.checked ? [...selected, row.original.id] : selected.filter(id => id !== row.original.id))} />
  }, {
    accessorKey: 'name',
    header: 'Name / subject',
    cell: ({
      row
    }) => <button className="text-button" onClick={() => onOpen(row.original)}>{row.original.name}<small>{row.original.id}</small></button>
  }, {
    accessorKey: 'company',
    header: 'Company'
  }, {
    accessorKey: 'status',
    header: 'Status',
    cell: ({
      getValue
    }) => <Badge>{String(getValue())}</Badge>
  }, {
    accessorKey: 'owner',
    header: 'Owner',
    cell: ({
      getValue
    }) => <span className="inline"><Avatar name={String(getValue())} />{String(getValue())}</span>
  }, {
    accessorKey: 'value',
    header: 'Value',
    cell: ({
      getValue
    }) => <span className="mono">{money(Number(getValue()))}</span>
  }, {
    accessorKey: 'due',
    header: 'Due / close',
    cell: ({
      row
    }) => <span className={new Date(row.original.due) < new Date() && !['Done', 'Won', 'Resolved', 'Closed'].includes(row.original.status) ? 'danger-text' : ''}>{date(row.original.due)}</span>
  }, {
    accessorKey: 'source',
    header: 'Source'
  }];
  const table = useReactTable({
    data: rows,
    columns,
    state: {
      sorting,
      columnVisibility: visibility
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    initialState: {
      pagination: {
        pageSize: 15
      }
    }
  });
  return <section className="grid-panel"><details className="column-menu"><summary><Columns3 size={14} /> Columns</summary><div>{table.getAllLeafColumns().filter(c => c.id !== 'select').map(c => <label key={c.id}><input type="checkbox" checked={c.getIsVisible()} onChange={c.getToggleVisibilityHandler()} />{c.id}</label>)}</div></details><div className="table-scroll"><table><thead>{table.getHeaderGroups().map(g => <tr key={g.id}>{g.headers.map(h => <th key={h.id} style={{
              width: h.getSize()
            }}><div className="inline">{h.column.getCanSort() ? <button onClick={h.column.getToggleSortingHandler()}>{flexRender(h.column.columnDef.header, h.getContext())}<ArrowUpDown size={12} /></button> : flexRender(h.column.columnDef.header, h.getContext())}</div><span className="resizer" onMouseDown={h.getResizeHandler()} onTouchStart={h.getResizeHandler()} /></th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map(row => <tr key={row.id} data-selected={selected.includes(row.original.id)}>{row.getVisibleCells().map(c => <td key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</td>)}</tr>)}</tbody></table></div><footer><span>{rows.length} records · {selected.length} selected</span><div className="inline"><button aria-label="Previous page" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}><ChevronLeft /></button><span>{table.getState().pagination.pageIndex + 1} / {Math.max(1, table.getPageCount())}</span><button aria-label="Next page" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}><ChevronRight /></button></div></footer></section>;
}
