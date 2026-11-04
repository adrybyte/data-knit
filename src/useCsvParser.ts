import { useEffect, useState } from 'react'
import Papa from 'papaparse'

/** Una fila del CSV: siempre indexada por los nombres de los encabezados. */
export type CsvRow = Record<string, string>

/** Resultado tipado del parseo de un archivo CSV. */
export type CsvData = {
  headers: string[]
  rows: CsvRow[]
  rowCount: number
  columnCount: number
}

export type CsvErrorCode = 'EMPTY_FILE' | 'NO_HEADERS' | 'READ_ERROR'

export type CsvParseError = {
  code: CsvErrorCode
  message: string
}

export type UseCsvParserResult = {
  data: CsvData | null
  isLoading: boolean
  error: CsvParseError | null
}

/** Número máximo de filas que se renderizan en la tabla de previsualización. */
export const DEMO_PREVIEW_ROW_LIMIT = 50

/**
 * Recorta las filas que se muestran en la previsualización. La fusión y la
 * exportación siguen trabajando con el conjunto completo de datos.
 */
export function getPreviewRows<T>(
  rows: readonly T[],
  limit: number = DEMO_PREVIEW_ROW_LIMIT,
): T[] {
  return rows.slice(0, limit)
}

const EMPTY_RESULT: UseCsvParserResult = {
  data: null,
  isLoading: false,
  error: null,
}

/**
 * Parsea un CSV en el cliente (Local-First) con Papa Parse.
 * Se re-ejecuta automáticamente cuando cambia el archivo y
 * descarta resultados de archivos que ya no están seleccionados.
 */
export function useCsvParser(file: File | null): UseCsvParserResult {
  const [data, setData] = useState<CsvData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<CsvParseError | null>(null)

  useEffect(() => {
    if (!file) {
      setData(EMPTY_RESULT.data)
      setError(EMPTY_RESULT.error)
      setIsLoading(EMPTY_RESULT.isLoading)
      return
    }

    let cancelled = false

    setIsLoading(true)
    setError(null)
    setData(null)

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      // Elimina el BOM que algunos exportadores añaden al primer encabezado.
      transformHeader: (header) => header.replace(/^\uFEFF/, '').trim(),
      complete: (results) => {
        if (cancelled) return

        const headers = results.meta.fields ?? []

        if (headers.length === 0) {
          setError({
            code: results.data.length === 0 ? 'EMPTY_FILE' : 'NO_HEADERS',
            message: 'The CSV file does not contain a header row.',
          })
          setIsLoading(false)
          return
        }

        // Normalizamos cada fila para que todas expongan exactamente las
        // mismas claves que `headers` (Papa omite celdas vacías al final).
        const rows: CsvRow[] = results.data.map((row) => {
          const normalized: CsvRow = {}

          for (const header of headers) {
            const value = row[header]
            normalized[header] = value == null ? '' : String(value)
          }

          return normalized
        })

        setData({
          headers,
          rows,
          rowCount: rows.length,
          columnCount: headers.length,
        })
        setIsLoading(false)
      },
      error: (parseError) => {
        if (cancelled) return

        setError({ code: 'READ_ERROR', message: parseError.message })
        setIsLoading(false)
      },
    })

    return () => {
      cancelled = true
    }
  }, [file])

  return { data, isLoading, error }
}
