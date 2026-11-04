import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  createBrowserRouter,
  Link,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from 'react-router-dom'
import { LANGUAGES, type Language } from './i18n'
import Landing from './Landing'
import { LicenseProvider } from './LicenseContext'
import MergerApp from './MergerApp'
import Unlock from './Unlock'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'data-knit-theme'

/*
 * Reglas de diseño (estilo Linear, utilitario):
 * - Fondos planos: blanco (#fff) / slate-900.
 * - Bordes de 1px en slate-200 / slate-800.
 * - Texto en escala de grises de alto contraste.
 * - Sin sombras, degradados ni neones.
 * - Radios sutiles: rounded-md.
 */

function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* localStorage bloqueado */
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function AppShell() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [theme, setTheme] = useState<Theme>(readInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    const isDark = theme === 'dark'

    root.classList.toggle('dark', isDark)
    root.style.colorScheme = theme

    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* localStorage bloqueado */
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const isDark = theme === 'dark'
  const currentLanguage: Language = i18n.resolvedLanguage === 'es' ? 'es' : 'en'
  const isWorkspace = location.pathname.startsWith('/app')

  return (
    <div className="flex h-screen flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:px-6 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="min-w-0 text-sm font-medium tracking-tight">
            <Link
              to="/"
              className="flex min-w-0 items-center gap-2.5 rounded-md text-slate-900 transition-colors duration-150 hover:text-slate-500 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:text-slate-100 dark:hover:text-slate-400 dark:focus-visible:outline-slate-600"
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-[2px] bg-slate-900 dark:bg-slate-100"
              />
              <span className="truncate">{t('AppTitle')}</span>
            </Link>
          </div>

          {isWorkspace ? (
            <span className="hidden truncate text-xs text-slate-400 sm:inline dark:text-slate-500">
              / {t('Workspace')}
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <select
            value={currentLanguage}
            onChange={(event) => {
              void i18n.changeLanguage(event.target.value)
            }}
            aria-label={t('Language')}
            title={t('Language')}
            className="h-8 cursor-pointer rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:outline-slate-600"
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? t('LightMode') : t('DarkMode')}
            title={isDark ? t('LightMode') : t('DarkMode')}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:outline-slate-600"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <Outlet />
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'unlock', element: <Unlock /> },
      { path: 'app', element: <MergerApp /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default function App() {
  return (
    <LicenseProvider>
      <RouterProvider router={router} />
    </LicenseProvider>
  )
}
