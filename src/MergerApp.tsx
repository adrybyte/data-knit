import { useCallback, useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import ColumnMapper, { type ColumnMapping } from './ColumnMapper'
import DemoExportModal from './DemoExportModal'
import FileUpload from './FileUpload'
import { useLicense } from './LicenseContext'
import { exportCsv, mergeCsvData, type MergeResult } from './mergeCsv'
import PreviewTable from './PreviewTable'
import { createSampleFiles } from './sampleData'
import { getPreviewRows, type CsvData } from './useCsvParser'

export default function MergerApp() {
  const { t } = useTranslation()
  const { isDemo } = useLicense()
  const [searchParams] = useSearchParams()
  const isSampleDemo = searchParams.get('demo') === 'true'
  const sampleFiles = useMemo(
    () => (isSampleDemo ? createSampleFiles() : null),
    [isSampleDemo],
  )
  const [mainData, setMainData] = useState<CsvData | null>(null)
  const [mergeData, setMergeData] = useState<CsvData | null>(null)
  const [mergedResult, setMergedResult] = useState<MergeResult | null>(null)
  const [isMerging, setIsMerging] = useState(false)
  const [mergeError, setMergeError] = useState(false)
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)

  const handleMainParsed = useCallback((parsed: CsvData | null) => {
    setMainData(parsed)
    setMergedResult(null)
    setMergeError(false)
  }, [])

  const handleMergeParsed = useCallback((parsed: CsvData | null) => {
    setMergeData(parsed)
    setMergedResult(null)
    setMergeError(false)
  }, [])

  const handleMerge = useCallback(
    async (mapping: ColumnMapping) => {
      if (!mainData || !mergeData) return

      setIsMerging(true)
      setMergedResult(null)
      setMergeError(false)

      try {
        const result = await mergeCsvData(mainData, mergeData, mapping)
        setMergedResult(result)
      } catch (error) {
        console.error('CSV merge failed', error)
        setMergeError(true)
      } finally {
        setIsMerging(false)
      }
    },
    [mainData, mergeData],
  )

  const handleExport = useCallback(() => {
    if (!mergedResult) return

    const outcome = exportCsv(mergedResult.csv, { isDemo })

    if (outcome === 'demo-blocked') {
      setIsDemoModalOpen(true)
    }
  }, [isDemo, mergedResult])

  const closeDemoModal = useCallback(() => {
    setIsDemoModalOpen(false)
  }, [])

  const previewRows = mergedResult ? getPreviewRows(mergedResult.rows) : []

  return (
    <main className="flex-1 overflow-y-auto px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {isSampleDemo ? (
          <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-2">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                {t('SampleDemoBanner')}
              </p>
            </div>

            <Link
              to="/unlock"
              state={{ from: '/app' }}
              className="inline-flex shrink-0 items-center text-xs font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors duration-150 hover:text-slate-600 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:text-slate-100 dark:decoration-slate-700 dark:hover:text-slate-300 dark:focus-visible:outline-slate-600"
            >
              {t('ActivateFullVersion')}
            </Link>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FileUpload
            label={t('MainCsv')}
            initialFile={sampleFiles?.users}
            onParsed={handleMainParsed}
          />
          <FileUpload
            label={t('DataToMergeCsv')}
            initialFile={sampleFiles?.orders}
            onParsed={handleMergeParsed}
          />
        </div>

        {mainData && mergeData ? (
          <div className="flex flex-col gap-2">
            <ColumnMapper
              mainHeaders={mainData.headers}
              dataHeaders={mergeData.headers}
              onMerge={handleMerge}
              isMerging={isMerging}
            />

            {mergeError ? (
              <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                {t('MergeError')}
              </p>
            ) : null}
          </div>
        ) : null}

        {mergedResult ? (
          <PreviewTable
            headers={mergedResult.headers}
            rows={previewRows}
            totalRows={mergedResult.rowCount}
            isDemo={isDemo}
            onExport={handleExport}
          />
        ) : null}
      </div>

      <DemoExportModal open={isDemoModalOpen} onClose={closeDemoModal} />
    </main>
  )
}
