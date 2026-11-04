import Papa from 'papaparse'
import type { CsvData, CsvRow } from './useCsvParser'
import type { ColumnMapping } from './ColumnMapper'

export const MERGED_FILE_NAME = 'merged_data.csv'

/** Filas procesadas entre cada cesión al event loop (mantiene la UI fluida). */
const YIELD_EVERY = 2_000

export type MergeProgress = {
  processed: number
  total: number
}

export type MergeProgressCallback = (progress: MergeProgress) => void

export type MergeResult = {
  csv: string
  headers: string[]
  rows: CsvRow[]
  rowCount: number
  matchedCount: number
  unmatchedCount: number
}

export class MergeError extends Error {
  constructor(message = 'A key column mapping is required.') {
    super(message)
    this.name = 'MergeError'
  }
}

function normalizeKey(value: string | undefined): string {
  return (value ?? '').trim()
}

/** Devuelve el control al navegador para que pueda pintar mientras se fusiona. */
function yieldToMainThread(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

/**
 * Cruce tipo VLOOKUP, en el cliente:
 * - El primer par del mapeo define la columna clave (Main -> Data).
 * - Indexa el CSV secundario en un Map por valor de clave: O(n).
 * - Recorre el CSV principal una sola vez: O(m).
 * - Cede el hilo cada `YIELD_EVERY` filas para no bloquear la UI.
 * - Las columnas mapeadas toman el valor del CSV secundario; el resto
 *   conserva el valor del CSV principal.
 */
export async function mergeCsvData(
  main: CsvData,
  data: CsvData,
  mapping: ColumnMapping,
  onProgress?: MergeProgressCallback,
): Promise<MergeResult> {
  const mappedPairs = Object.entries(mapping).filter(([, dataHeader]) => dataHeader !== '')

  const [keyMainHeader, keyDataHeader] = mappedPairs[0] ?? []

  if (!keyMainHeader || !keyDataHeader) {
    throw new MergeError()
  }

  // Índice del CSV secundario: clave normalizada -> primera fila encontrada.
  const dataIndex = new Map<string, CsvRow>()

  for (let index = 0; index < data.rows.length; index += 1) {
    const row = data.rows[index]
    const key = normalizeKey(row[keyDataHeader])

    if (key !== '' && !dataIndex.has(key)) {
      dataIndex.set(key, row)
    }

    if ((index + 1) % YIELD_EVERY === 0) {
      await yieldToMainThread()
    }
  }

  const mergedRows: CsvRow[] = new Array(main.rows.length)
  let matchedCount = 0

  for (let index = 0; index < main.rows.length; index += 1) {
    const mainRow = main.rows[index]
    const key = normalizeKey(mainRow[keyMainHeader])
    const match = key === '' ? undefined : dataIndex.get(key)

    // Sin coincidencia reutilizamos la fila original (evita 50k copias extra).
    let merged: CsvRow = mainRow

    if (match) {
      merged = { ...mainRow }
      matchedCount += 1

      for (const [mainHeader, dataHeader] of mappedPairs) {
        // La clave se conserva tal como viene en el CSV principal.
        if (mainHeader === keyMainHeader) continue
        merged[mainHeader] = match[dataHeader] ?? ''
      }
    }

    mergedRows[index] = merged

    if ((index + 1) % YIELD_EVERY === 0) {
      onProgress?.({ processed: index + 1, total: main.rows.length })
      await yieldToMainThread()
    }
  }

  onProgress?.({ processed: main.rows.length, total: main.rows.length })

  const csv =
    mergedRows.length > 0
      ? Papa.unparse(mergedRows, { columns: main.headers, newline: '\r\n' })
      : // Papa.unparse no emite encabezados para un array vacío.
        Papa.unparse([main.headers], { newline: '\r\n' })

  return {
    csv,
    headers: main.headers,
    rows: mergedRows,
    rowCount: mergedRows.length,
    matchedCount,
    unmatchedCount: mergedRows.length - matchedCount,
  }
}

export type ExportCsvOutcome = 'downloaded' | 'demo-blocked'

export type ExportCsvOptions = {
  isDemo: boolean
  fileName?: string
}

/**
 * Exporta el CSV completo. En Demo Mode no inicia la descarga y devuelve
 * `demo-blocked` para que la UI muestre el modal de desbloqueo.
 */
export function exportCsv(
  csv: string,
  { isDemo, fileName }: ExportCsvOptions,
): ExportCsvOutcome {
  if (isDemo) return 'demo-blocked'

  downloadCsv(csv, fileName)
  return 'downloaded'
}

/**
 * Fuerza la descarga local del CSV. El BOM inicial ayuda a Excel a
 * interpretar correctamente los acentos como UTF-8.
 */
export function downloadCsv(csv: string, fileName: string = MERGED_FILE_NAME): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  link.remove()

  // Damos margen al navegador para iniciar la descarga antes de liberar la URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}
