import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

/** Mapa `encabezado principal -> encabezado del segundo CSV`. */
export type ColumnMapping = Record<string, string>

type ColumnMapperProps = {
  mainHeaders: string[]
  dataHeaders: string[]
  onMerge?: (mapping: ColumnMapping) => void
  isMerging?: boolean
}

/**
 * Preselecciona la columna del segundo CSV cuyo nombre coincide con el
 * encabezado principal (comparación sin distinguir mayúsculas ni espacios).
 */
function buildInitialMapping(mainHeaders: string[], dataHeaders: string[]): ColumnMapping {
  const dataHeadersByName = new Map(
    dataHeaders.map((header) => [header.trim().toLowerCase(), header]),
  )

  const mapping: ColumnMapping = {}

  for (const header of mainHeaders) {
    const match = dataHeadersByName.get(header.trim().toLowerCase())
    if (match) mapping[header] = match
  }

  return mapping
}

export default function ColumnMapper({
  mainHeaders,
  dataHeaders,
  onMerge,
  isMerging = false,
}: ColumnMapperProps) {
  const { t } = useTranslation()
  const [mapping, setMapping] = useState<ColumnMapping>(() =>
    buildInitialMapping(mainHeaders, dataHeaders),
  )

  useEffect(() => {
    setMapping(buildInitialMapping(mainHeaders, dataHeaders))
  }, [mainHeaders, dataHeaders])

  const handleChange = useCallback((mainHeader: string, dataHeader: string) => {
    setMapping((current) => ({ ...current, [mainHeader]: dataHeader }))
  }, [])

  const hasMapping = Object.values(mapping).some(Boolean)

  return (
    <section className="rounded-md border border-slate-200 dark:border-slate-800">
      <ul className="divide-y divide-slate-200 dark:divide-slate-800">
        {mainHeaders.map((header) => (
          <li key={header} className="flex items-center gap-3 px-3 py-2">
            <span
              className="min-w-0 flex-1 truncate text-sm text-slate-900 dark:text-slate-100"
              title={header}
            >
              {header}
            </span>

            <select
              value={mapping[header] ?? ''}
              onChange={(event) => handleChange(header, event.target.value)}
              aria-label={`${header} — ${t('SelectColumn')}`}
              className="h-8 w-44 shrink-0 cursor-pointer rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 sm:w-56 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:outline-slate-600"
            >
              <option value="">{t('SelectColumn')}</option>
              {dataHeaders.map((dataHeader) => (
                <option key={dataHeader} value={dataHeader}>
                  {dataHeader}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onMerge?.(mapping)}
          disabled={isMerging || !hasMapping}
          aria-busy={isMerging}
          className="inline-flex h-9 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-slate-800 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:outline-slate-500"
        >
          {isMerging ? t('MergingData') : t('MergeData')}
        </button>
      </div>
    </section>
  )
}
