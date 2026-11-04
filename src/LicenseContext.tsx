import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export const LICENSE_STORAGE_KEY = 'app_license_key'
export const LICENSE_STATUS_STORAGE_KEY = 'app_is_licensed'

const VERIFY_ENDPOINT = '/api/verify'
const VERIFY_TIMEOUT_MS = 15_000

export type LicenseVerificationFailure =
  | 'empty'
  | 'invalid'
  | 'refunded'
  | 'request'

export type LicenseVerificationResult =
  | { valid: true }
  | { valid: false; reason: LicenseVerificationFailure }

export type LicenseContextValue = {
  isLicensed: boolean
  isDemo: boolean
  licenseKey: string
  isLoading: boolean
  verifyLicense: (key: string) => Promise<LicenseVerificationResult>
}

type VerifyLicenseResponse = {
  success?: boolean
  message?: string
}

const LicenseContext = createContext<LicenseContextValue | null>(null)

function readStoredLicenseKey(): string {
  if (typeof window === 'undefined') return ''

  try {
    return window.localStorage.getItem(LICENSE_STORAGE_KEY)?.trim() ?? ''
  } catch {
    return ''
  }
}

function hasStoredLicenseStatus(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return window.localStorage.getItem(LICENSE_STATUS_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function storeLicense(key: string) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(LICENSE_STORAGE_KEY, key)
    window.localStorage.setItem(LICENSE_STATUS_STORAGE_KEY, 'true')
  } catch {
    /* La licencia queda activa solo para esta sesión. */
  }
}

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [isLicensed, setIsLicensed] = useState(false)
  const [licenseKey, setLicenseKey] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedKey = readStoredLicenseKey()

    // La clave guardada se acepta al iniciar para no bloquear el uso offline.
    if (storedKey) {
      setLicenseKey(storedKey)
      setIsLicensed(true)

      // Compatibilidad con sesiones creadas antes de guardar el estado.
      if (!hasStoredLicenseStatus()) {
        storeLicense(storedKey)
      }
    }

    setIsLoading(false)
  }, [])

  const verifyLicense = useCallback(
    async (key: string): Promise<LicenseVerificationResult> => {
      const normalizedKey = key.trim()

      if (!normalizedKey) {
        return { valid: false, reason: 'empty' }
      }

      const controller = new AbortController()
      const timeoutId = window.setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS)
      let response: Response

      try {
        response = await fetch(VERIFY_ENDPOINT, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ licenseKey: normalizedKey }),
          signal: controller.signal,
        })
      } catch {
        return { valid: false, reason: 'request' }
      } finally {
        window.clearTimeout(timeoutId)
      }

      let payload: VerifyLicenseResponse | null = null

      try {
        payload = (await response.json()) as VerifyLicenseResponse
      } catch {
        /* La respuesta no era JSON; se resuelve con el estado HTTP. */
      }

      if (response.status === 400) {
        return { valid: false, reason: 'invalid' }
      }

      if (!response.ok) {
        return { valid: false, reason: 'request' }
      }

      if (!payload) {
        return { valid: false, reason: 'request' }
      }

      if (payload.success !== true) {
        return { valid: false, reason: 'invalid' }
      }

      storeLicense(normalizedKey)
      setLicenseKey(normalizedKey)
      setIsLicensed(true)

      return { valid: true }
    },
    [],
  )

  const isDemo = !isLoading && !isLicensed

  const value = useMemo(
    () => ({ isLicensed, isDemo, licenseKey, isLoading, verifyLicense }),
    [isDemo, isLicensed, isLoading, licenseKey, verifyLicense],
  )

  return <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>
}

export function useLicense(): LicenseContextValue {
  const context = useContext(LicenseContext)

  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider')
  }

  return context
}
