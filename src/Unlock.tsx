import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Check, Loader2, Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  useLicense,
  type LicenseVerificationFailure,
} from './LicenseContext'

type UnlockLocationState = {
  from?: string
}

type UnlockStatus =
  | 'idle'
  | 'loading'
  | 'invalid'
  | 'refunded'
  | 'error'
  | 'success'

const SUCCESS_DELAY = 800

function statusForFailure(reason: LicenseVerificationFailure): UnlockStatus {
  switch (reason) {
    case 'refunded':
      return 'refunded'
    case 'request':
      return 'error'
    case 'empty':
    case 'invalid':
    default:
      return 'invalid'
  }
}

export default function Unlock() {
  const { t } = useTranslation()
  const { verifyLicense, isLicensed, isLoading: isCheckingLicense } = useLicense()
  const location = useLocation()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [licenseInput, setLicenseInput] = useState('')
  const [status, setStatus] = useState<UnlockStatus>('idle')

  const requestedPath = (location.state as UnlockLocationState | null)?.from
  const returnTo = requestedPath?.startsWith('/app') ? requestedPath : '/app'
  const isLoading = isCheckingLicense || status === 'loading'
  const isKeyInvalid = status === 'invalid' || status === 'refunded'
  const errorMessage =
    status === 'invalid'
      ? t('UnlockError')
      : status === 'refunded'
        ? t('UnlockRefunded')
        : status === 'error'
          ? t('UnlockVerificationError')
          : null

  useEffect(() => {
    if (!isCheckingLicense) {
      inputRef.current?.focus()
    }
  }, [isCheckingLicense])

  useEffect(() => {
    if (status !== 'loading') return

    let cancelled = false

    void verifyLicense(licenseInput)
      .then((result) => {
        if (cancelled) return
        setStatus(result.valid ? 'success' : statusForFailure(result.reason))
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [licenseInput, status, verifyLicense])

  useEffect(() => {
    if (status !== 'success') return

    const timer = window.setTimeout(() => {
      navigate(returnTo, { replace: true })
    }, SUCCESS_DELAY)

    return () => window.clearTimeout(timer)
  }, [navigate, returnTo, status])

  if (
    !isCheckingLicense &&
    isLicensed &&
    status !== 'loading' &&
    status !== 'success'
  ) {
    return <Navigate to={returnTo} replace />
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isLoading || status === 'success') return

    if (!licenseInput.trim()) {
      setStatus('invalid')
      inputRef.current?.focus()
      return
    }

    setStatus('loading')
  }

  return (
    <main className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-16 sm:px-6">
      <div className="w-full max-w-sm rounded-md border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <Lock className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        </div>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {t('UnlockTitle')}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {t('UnlockSubtitle')}
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6">
          <label
            htmlFor="license-key"
            className="text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            {t('LicenseKeyLabel')}
          </label>

          <input
            ref={inputRef}
            id="license-key"
            type="text"
            value={licenseInput}
            onChange={(event) => {
              setLicenseInput(event.target.value)
              if (
                status === 'invalid' ||
                status === 'refunded' ||
                status === 'error'
              ) {
                setStatus('idle')
              }
            }}
            disabled={isLoading || status === 'success'}
            autoComplete="off"
            spellCheck={false}
            placeholder={t('LicenseKeyPlaceholder')}
            aria-invalid={isKeyInvalid}
            aria-describedby={errorMessage ? 'license-key-error' : undefined}
            className={`mt-2 h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-900 transition-colors duration-150 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:outline-slate-600 ${
              isKeyInvalid
                ? 'border-red-300 dark:border-red-900'
                : 'border-slate-300 dark:border-slate-700'
            }`}
          />

          <div className="mt-2 min-h-5 text-xs" aria-live="polite">
            {errorMessage ? (
              <p
                id="license-key-error"
                role="alert"
                className="text-red-600 dark:text-red-400"
              >
                {errorMessage}
              </p>
            ) : null}

            {status === 'success' ? (
              <p
                role="status"
                className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                {t('UnlockSuccess')}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isLoading || status === 'success'}
            aria-busy={isLoading}
            className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-slate-800 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:outline-slate-500"
          >
            {isLoading ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {isCheckingLicense ? t('CheckingLicense') : t('UnlockLoading')}
              </>
            ) : (
              t('UnlockCta')
            )}
          </button>
        </form>

        <p className="mt-5 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {t('UnlockLocalNote')}
        </p>

        <Link
          to="/"
          className="mt-3 inline-flex text-xs font-medium text-slate-500 transition-colors duration-150 hover:text-slate-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:text-slate-400 dark:hover:text-slate-100 dark:focus-visible:outline-slate-600"
        >
          {t('BackToHome')}
        </Link>
      </div>
    </main>
  )
}
