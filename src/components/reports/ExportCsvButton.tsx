import React, { useCallback } from 'react';

export interface ExportCsvColumn<T> {
  /** Key used to read the value from each row. */
  key: keyof T | string;
  /** Header label shown in the CSV. Falls back to the key. */
  label?: string;
  /** Optional accessor for computed/nested values. */
  accessor?: (row: T) => unknown;
}

export interface ExportCsvButtonProps<T> {
  /** The rows currently visible in the report table. */
  rows: T[];
  /** Column definitions describing what to serialize. */
  columns: ExportCsvColumn<T>[];
  /** File name for the download (without extension is fine). */
  filename?: string;
  /** Button label. */
  label?: string;
  className?: string;
  /** Called after a successful export. */
  onExported?: (rowCount: number) => void;
}

/** Escape a single value per RFC 4180 (quote if it contains comma, quote, or newline). */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Serialize rows + columns into a CSV string. Exported for unit testing. */
export function rowsToCsv<T>(rows: T[], columns: ExportCsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCsvValue(c.label ?? String(c.key))).join(',');

  const body = rows.map((row) =>
    columns
      .map((c) => {
        const raw = c.accessor
          ? c.accessor(row)
          : (row as Record<string, unknown>)[String(c.key)];
        return escapeCsvValue(raw);
      })
      .join(','),
  );

  return [header, ...body].join('\r\n');
}

function triggerDownload(csv: string, filename: string): void {
  // Prepend BOM so Excel opens UTF-8 content correctly.
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Release the object URL on the next tick to avoid revoking before download starts.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * A self-contained button that exports the currently visible report rows to CSV
 * and triggers a client-side download. Disabled when there is no data.
 */
export function ExportCsvButton<T>({
  rows,
  columns,
  filename = 'report',
  label = 'Export CSV',
  className,
  onExported,
}: ExportCsvButtonProps<T>) {
  const isEmpty = !rows || rows.length === 0 || columns.length === 0;

  const handleClick = useCallback(() => {
    if (isEmpty) {
      return;
    }
    const csv = rowsToCsv(rows, columns);
    triggerDownload(csv, filename);
    onExported?.(rows.length);
  }, [isEmpty, rows, columns, filename, onExported]);

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={isEmpty}
      aria-disabled={isEmpty}
      title={isEmpty ? 'No data to export' : 'Download the current report as CSV'}
    >
      {label}
    </button>
  );
}

export default ExportCsvButton;
