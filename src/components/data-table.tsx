'use client';

import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Download, SlidersHorizontal } from 'lucide-react';

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = 'Filter rows',
  empty = 'No records yet.',
  exportName = 'export',
}: {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  searchPlaceholder?: string;
  empty?: string;
  exportName?: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [openCols, setOpenCols] = useState(false);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  const hideable = useMemo(
    () => table.getAllLeafColumns().filter((column) => column.getCanHide()),
    [table],
  );

  function exportCsv() {
    const visible = table.getVisibleLeafColumns();
    const header = visible.map((column) => String(column.columnDef.header ?? column.id)).join(',');
    const rows = table.getFilteredRowModel().rows.map((row) =>
      visible
        .map((column) => {
          const value = row.getValue(column.id);
          return `"${String(value ?? '').replaceAll('"', '""')}"`;
        })
        .join(','),
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="dt">
      <div className="dt-toolbar">
        <input
          className="ws-input dt-search"
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
        <div className="dt-tools">
          <span className="ws-hint">
            {table.getFilteredRowModel().rows.length} of {data.length}
          </span>
          <div className="ws-bell-wrap">
            <button type="button" className="ws-btn" onClick={() => setOpenCols((value) => !value)}>
              <SlidersHorizontal size={14} />
              Columns
            </button>
            {openCols ? (
              <div className="ws-pop">
                {hideable.map((column) => (
                  <label className="ws-check" key={column.id}>
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                    />
                    {String(column.columnDef.header ?? column.id)}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
          <button type="button" className="ws-btn" onClick={exportCsv}>
            <Download size={14} />
            Export
          </button>
        </div>
      </div>
      <div className="ws-table-wrap">
        <table className="ws-table dt-table">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="dt-sort"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <ChevronsUpDown size={12} aria-hidden />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={Math.max(1, table.getVisibleLeafColumns().length)} className="dt-empty">
                  {empty}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {table.getPageCount() > 1 ? (
        <div className="dt-pager">
          <button
            type="button"
            className="ws-btn"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft size={14} />
            Previous
          </button>
          <span className="ws-hint">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            type="button"
            className="ws-btn"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
