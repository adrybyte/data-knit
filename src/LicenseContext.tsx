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

const GUMROAD_VERIFY_URL = 'https://api.gumroad.com/v2/licenses/verify'
const GUMROAD_PRODUCT_ID =
  import.meta.env.VITE_GUMROAD_PRODUCT_ID?.trim() || 'TU_PRODUCT_ID'
const VERIFY_TIMEOUT_MS = 15_000

if (import.meta.env.DEV && GUMROAD_PRODUCT_ID === 'TU_PRODUCT_ID') {
  console.warn(
    '[license] Set VITE_GUMROAD_PRODUCT_ID in your .env file to verify real Gumroad licenses.',
  )
}

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

type GumroadVerifyResponse = {
  success?: boolean
  purchase?: {
    refunded?: boolean
    chargebacked?: boolean
    disputed?: boolean
  }
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

function storeLicenseKey(key: string) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(LICENSE_STORAGE_KEY, key)
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
        response = await fetch(GUMROAD_VERIFY_URL, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            product_id: GUMROAD_PRODUCT_ID,
            license_key: normalizedKey,
          }).toString(),
          signal: controller.signal,
        })
      } catch {
        return { valid: false, reason: 'request' }
      } finally {
        window.clearTimeout(timeoutId)
      }

      let payload: GumroadVerifyResponse | null = null

      try {
        payload = (await response.json()) as GumroadVerifyResponse
      } catch {
        /* La respuesta no era JSON; se resuelve con el estado HTTP. */
      }

      if (!response.ok) {
        // Gumroad devuelve 404 cuando la licencia no existe para el producto.
        if ([400, 404, 422].includes(response.status)) {
          return { valid: false, reason: 'invalid' }
        }

        return { valid: false, reason: 'request' }
      }

      if (!payload) {
        return { valid: false, reason: 'request' }
      }

      if (payload.success !== true) {
        return { valid: false, reason: 'invalid' }
      }

      if (!payload.purchase) {
        return { valid: false, reason: 'request' }
      }

      if (
        payload.purchase.refunded === true ||
        payload.purchase.chargebacked === true ||
        payload.purchase.disputed === true
      ) {
        return { valid: false, reason: 'refunded' }
      }

      storeLicenseKey(normalizedKey)
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
