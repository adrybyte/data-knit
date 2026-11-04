import { useEffect } from 'react'
import { ArrowRight, Check, Infinity as InfinityIcon, ShieldCheck, Zap } from 'lucide-react'
import { motion, MotionConfig, type MotionProps, type Variants } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import DataFlowAnimation from './DataFlowAnimation'

const FEATURES = [
  {
    Icon: InfinityIcon,
    titleKey: 'FeatureNoApiTitle',
    descriptionKey: 'FeatureNoApiDescription',
  },
  {
    Icon: Zap,
    titleKey: 'FeatureInstantTitle',
    descriptionKey: 'FeatureInstantDescription',
  },
  {
    Icon: ShieldCheck,
    titleKey: 'FeaturePrivacyTitle',
    descriptionKey: 'FeaturePrivacyDescription',
  },
] as const

const BENEFITS = ['BenefitUnlimited', 'BenefitUpdates', 'BenefitNoSubscription'] as const

/** Contenedor del hero: orquesta la cascada de hijos. */
const HERO_CONTAINER: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
}

/** Fade in up: 20px hacia arriba mientras la opacidad pasa de 0 a 1. */
const HERO_ITEM: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const SECTION_REVEAL: MotionProps = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
}

const CARD_HOVER = { y: -2 }
const CARD_TRANSITION = { duration: 0.15, ease: 'easeOut' } as const

export default function Landing() {
  const { t } = useTranslation()

  useEffect(() => {
    if (window.location.hash === '#pricing') {
      document.getElementById('pricing')?.scrollIntoView({ block: 'start' })
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <main className="flex-1 overflow-y-auto">
        {/* Hero */}
        <motion.div variants={HERO_CONTAINER} initial="hidden" animate="show">
          <section className="border-b border-slate-200 dark:border-slate-800">
            <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div>
                  <motion.div variants={HERO_ITEM}>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('LandingEyebrow')}
                    </p>

                    <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl xl:text-6xl dark:text-slate-50">
                      {t('LandingTitle')}
                    </h1>
                  </motion.div>

                  <motion.p
                    variants={HERO_ITEM}
                    className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400"
                  >
                    {t('LandingSubtitle')}
                  </motion.p>

                  <motion.div variants={HERO_ITEM} className="mt-8">
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                      <Link
                        to="/app"
                        className="inline-flex h-10 items-center gap-1.5 rounded-md bg-slate-900 px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-slate-800 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:outline-slate-500"
                      >
                        {t('LandingCta')}
                        <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                      </Link>

                      <Link
                        to="/app?demo=true"
                        className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:focus-visible:outline-slate-600"
                      >
                        {t('LandingTryDemo')}
                      </Link>
                    </div>

                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      {t('LandingHeroNote')}
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  variants={HERO_ITEM}
                  className="mx-auto w-full max-w-[460px]"
                >
                  <DataFlowAnimation />
                </motion.div>
              </div>
            </div>
          </section>
        </motion.div>

        {/* Features */}
        <motion.div {...SECTION_REVEAL}>
          <section className="border-b border-slate-200 dark:border-slate-800">
            <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
              <div className="grid gap-4 md:grid-cols-3">
                {FEATURES.map(({ Icon, titleKey, descriptionKey }) => (
                  <motion.div
                    key={titleKey}
                    whileHover={CARD_HOVER}
                    transition={CARD_TRANSITION}
                    className="rounded-md border border-slate-200 p-6 transition-colors duration-150 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-600"
                  >
                    <Icon
                      className="h-5 w-5 text-slate-500 dark:text-slate-400"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <h2 className="mt-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {t(titleKey)}
                    </h2>
                    <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {t(descriptionKey)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </motion.div>

        {/* Pricing */}
        <motion.div {...SECTION_REVEAL}>
          <section id="pricing">
            <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
              <div className="mx-auto max-w-md text-center">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('PricingEyebrow')}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  {t('PricingTitle')}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {t('PricingSubtitle')}
                </p>
              </div>

              <motion.div
                whileHover={CARD_HOVER}
                transition={CARD_TRANSITION}
                className="mx-auto mt-8 max-w-md rounded-md border border-slate-300 transition-colors duration-150 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600"
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {t('PricingPlanName')}
                  </span>
                  <div className="text-right">
                    <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      {t('PricingPrice')}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {t('PricingPriceNote')}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-5">
                  <button
                    type="button"
                    className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-slate-800 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:outline-slate-500"
                  >
                    {t('BuyLicense')}
                  </button>

                  <ul className="mt-5 space-y-2.5 border-t border-slate-200 pt-5 dark:border-slate-800">
                    {BENEFITS.map((key) => (
                      <li
                        key={key}
                        className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        {t(key)}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </section>
        </motion.div>
      </main>
    </MotionConfig>
  )
}
