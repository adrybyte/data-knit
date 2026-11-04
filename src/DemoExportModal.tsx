import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Lock, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { DEMO_PREVIEW_ROW_LIMIT } from './useCsvParser'

type DemoExportModalProps = {
  open: boolean
  onClose: () => void
}

export default function DemoExportModal({ open, onClose }: DemoExportModalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )

      if (!focusableElements || focusableElements.length === 0) return

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)

      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus()
      }
    }
  }, [onClose, open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 dark:bg-slate-950/70"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-export-title"
        className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <Lock className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
            title={t('Close')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:focus-visible:outline-slate-600"
          >
            <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <h2
          id="demo-export-title"
          className="mt-5 text-base font-semibold leading-6 tracking-tight text-slate-900 dark:text-slate-50"
        >
          {t('DemoModalMessage', { limit: DEMO_PREVIEW_ROW_LIMIT })}
        </h2>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              onClose()
              navigate('/#pricing')
            }}
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-slate-800 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:outline-slate-500"
          >
            {t('BuyLicense')}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              navigate('/unlock', { state: { from: '/app' } })
            }}
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:focus-visible:outline-slate-600"
          >
            {t('EnterLicenseKey')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
