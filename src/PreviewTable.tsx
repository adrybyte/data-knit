import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CsvRow } from './useCsvParser'

type PreviewTableProps = {
  headers: string[]
  rows: CsvRow[]
  totalRows: number
  isDemo: boolean
  onExport: () => void
}

export default function PreviewTable({
  headers,
  rows,
  totalRows,
  isDemo,
  onExport,
}: PreviewTableProps) {
  const { t } = useTranslation()

  return (
    <section className="rounded-md border border-slate-200 dark:border-slate-800">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {t('PreviewTitle')}
            </h2>

            {isDemo ? (
              <span className="inline-flex items-center rounded-md border border-slate-300 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {t('DemoMode')}
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('PreviewShowing', { shown: rows.length, total: totalRows })}
          </p>
        </div>

        <button
          type="button"
          onClick={onExport}
          className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-slate-800 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 sm:w-auto dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:outline-slate-500"
        >
          <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {t('ExportFullCsv')}
        </button>
      </div>

      <div className="max-h-[420px] overflow-auto">
        <table className="w-full border-collapse text-left text-xs">
          <caption className="sr-only">{t('PreviewTitle')}</caption>

          <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={`${header}-${index}`}
                  scope="col"
                  className="whitespace-nowrap border-b border-slate-200 px-3 py-2 font-medium text-slate-600 dark:border-slate-800 dark:text-slate-400"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {headers.map((header, columnIndex) => {
                    const value = row[header] ?? ''

                    return (
                      <td
                        key={`${header}-${columnIndex}`}
                        title={value}
                        className="max-w-[220px] truncate whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-300"
                      >
                        {value}
                      </td>
                    )
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={Math.max(headers.length, 1)}
                  className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                >
                  {t('PreviewNoRows')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
