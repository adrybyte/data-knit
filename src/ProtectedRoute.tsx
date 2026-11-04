import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation } from 'react-router-dom'
import { useLicense } from './LicenseContext'

type ProtectedRouteProps = {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { t } = useTranslation()
  const { isLicensed, isLoading } = useLicense()
  const location = useLocation()

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
        >
          <Loader2
            className="h-4 w-4 animate-spin"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          {t('CheckingLicense')}
        </p>
      </main>
    )
  }

  if (!isLicensed) {
    return (
      <Navigate
        to="/unlock"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    )
  }

  return <>{children}</>
}
