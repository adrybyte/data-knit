import { useCallback, useEffect, useId, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { FileText, Loader2, Upload, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCsvParser, type CsvData } from './useCsvParser'

type FileUploadProps = {
  label: string
  initialFile?: File | null
  onFileChange?: (file: File | null) => void
  onParsed?: (data: CsvData | null) => void
}

const CSV_ERROR_KEYS = {
  EMPTY_FILE: 'CsvErrorEmpty',
  NO_HEADERS: 'CsvErrorNoHeaders',
  READ_ERROR: 'CsvErrorRead',
} as const

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  const units = ['KB', 'MB', 'GB'] as const
  let value = bytes / 1024
  let unit = 0

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`
}

export default function FileUpload({
  label,
  initialFile,
  onFileChange,
  onParsed,
}: FileUploadProps) {
  const { t } = useTranslation()
  const labelId = useId()
  const [file, setFile] = useState<File | null>(initialFile ?? null)
  const { data, isLoading, error } = useCsvParser(file)

  useEffect(() => {
    onParsed?.(data)
  }, [data, onParsed])

  const handleDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      // Si el drop era inválido, conservamos el archivo ya cargado.
      if (acceptedFiles.length === 0 && rejections.length > 0) return

      const nextFile = acceptedFiles[0] ?? null
      setFile(nextFile)
      onFileChange?.(nextFile)
    },
    [onFileChange],
  )

  const handleRemove = useCallback(() => {
    setFile(null)
    onFileChange?.(null)
  }, [onFileChange])

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    onDrop: handleDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
    maxFiles: 1,
  })

  const hasRejection = fileRejections.length > 0 && !file

  return (
    <div className="flex flex-col gap-2">
      <p id={labelId} className="text-xs font-medium text-slate-600 dark:text-slate-400">
        {label}
      </p>

      <div className="relative">
        <div
          {...getRootProps({
            role: 'button',
            'aria-labelledby': labelId,
            'aria-busy': isLoading,
            className: [
              'flex min-h-[124px] cursor-pointer items-center justify-center rounded-md border border-dashed bg-white px-6 py-8 text-center transition-colors duration-150 dark:bg-slate-900',
              'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:focus-visible:outline-slate-600',
              isDragReject
                ? 'border-red-300 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30'
                : isDragActive
                  ? 'border-slate-400 bg-slate-50 dark:border-slate-500 dark:bg-slate-800'
                  : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800',
            ].join(' '),
          })}
        >
          <input {...getInputProps()} />

          {file ? (
            <div className="flex w-full items-center gap-3 pr-10 text-left">
              {isLoading ? (
                <Loader2
                  className="h-4 w-4 shrink-0 animate-spin text-slate-400 dark:text-slate-500"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              ) : (
                <FileText
                  className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {file.name}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(file.size)}
                  {isLoading ? ` · ${t('Parsing')}` : null}
                  {data
                    ? ` · ${t('RowsAndColumns', {
                        rows: data.rowCount,
                        columns: data.columnCount,
                      })}`
                    : null}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Upload
                className="h-5 w-5 text-slate-400 dark:text-slate-500"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {t('DropFileHere')}
                </span>{' '}
                {t('DropFileHint')}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{t('CsvOnly')}</p>
            </div>
          )}
        </div>

        {file ? (
          <button
            type="button"
            onClick={handleRemove}
            aria-label={t('RemoveFile')}
            title={t('RemoveFile')}
            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200 dark:focus-visible:outline-slate-600"
          >
            <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {t(CSV_ERROR_KEYS[error.code])}
        </p>
      ) : null}

      {hasRejection ? (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {t('CsvRejected')}
        </p>
      ) : null}
    </div>
  )
}
