import { useRef } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionStyle,
} from 'framer-motion'
import { Cpu } from 'lucide-react'

const CYCLE = 4.8

/** Deja que la entrada del hero termine antes de arrancar el flujo. */
const INTRO_HOLD = 0.85
const INTRO_PHASE = 0.2

const INPUT_FADE_IN = [0, 0.2] as const
const INPUT_TRAVEL = [0.2, 1] as const
const INPUT_FADE_OUT = [0.85, 1.02] as const

const NODE_PULSE = [1, 1.4] as const

const OUTPUT_FADE_IN = [1.35, 1.55] as const
const OUTPUT_TRAVEL = [1.35, 2] as const
const OUTPUT_FADE_OUT = [3.9, 4.35] as const

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

const easeInOut = (value: number) =>
  value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2

const easeOut = (value: number) => 1 - Math.pow(1 - value, 3)

const progress = (time: number, [start, end]: readonly [number, number]) =>
  clamp01((time - start) / (end - start))

const fade = (
  time: number,
  fadeIn: readonly [number, number],
  fadeOut: readonly [number, number],
) => {
  if (time < fadeIn[1]) {
    return progress(time, fadeIn)
  }

  if (time < fadeOut[0]) {
    return 1
  }

  return 1 - progress(time, fadeOut)
}

const round = (value: number) => Math.round(value * 1000) / 1000

/**
 * Diagrama técnico animado: CSV A + CSV B -> nodo de procesado -> Merged CSV.
 * Solo el nodo usa el acento del proyecto (slate-900 / slate-100).
 */
export default function DataFlowAnimation() {
  const reduceMotion = useReducedMotion()
  const time = useMotionValue(INTRO_PHASE)
  const startedAt = useRef<number | null>(null)

  useAnimationFrame((elapsed) => {
    if (reduceMotion) {
      return
    }

    if (startedAt.current === null) {
      startedAt.current = elapsed
    }

    const seconds = (elapsed - startedAt.current) / 1000

    if (seconds < INTRO_HOLD) {
      time.set(INTRO_PHASE)
      return
    }

    time.set((INTRO_PHASE + seconds - INTRO_HOLD) % CYCLE)
  })

  const inputAX = useTransform(time, (value) => round(112 * easeInOut(progress(value, INPUT_TRAVEL))))
  const inputAY = useTransform(time, (value) => round(92 * easeInOut(progress(value, INPUT_TRAVEL))))
  const inputBY = useTransform(time, (value) => round(-92 * easeInOut(progress(value, INPUT_TRAVEL))))
  const inputOpacity = useTransform(time, (value) => round(fade(value, INPUT_FADE_IN, INPUT_FADE_OUT)))

  const nodeScale = useTransform(time, (value) => {
    if (value < NODE_PULSE[0] || value > NODE_PULSE[1]) {
      return 1
    }

    return round(1 + 0.08 * Math.sin(Math.PI * progress(value, NODE_PULSE)))
  })

  const outputX = useTransform(time, (value) => round(-86 + 86 * easeOut(progress(value, OUTPUT_TRAVEL))))
  const outputScale = useTransform(time, (value) => round(0.98 + 0.02 * easeOut(progress(value, OUTPUT_TRAVEL))))
  const outputOpacity = useTransform(time, (value) =>
    round(fade(value, OUTPUT_FADE_IN, OUTPUT_FADE_OUT)),
  )

  const motionStyle = (values: MotionStyle) => (reduceMotion ? undefined : values)

  return (
    <div aria-hidden="true" className="mx-auto w-full max-w-[440px] select-none">
      <svg viewBox="0 0 440 300" fill="none" className="h-auto w-full">
        {/* Marcas de esquina */}
        <g className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={1}>
          <path d="M14 10v8M10 14h8" />
          <path d="M426 10v8M422 14h8" />
          <path d="M14 282v8M10 286h8" />
          <path d="M426 282v8M422 286h8" />
        </g>

        {/* Guías punteadas */}
        <g className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} strokeDasharray="4 4">
          <path d="M90 42 202 134" />
          <path d="M90 258 202 166" />
          <path d="M242 150h86" />
        </g>

        {/* Terminales */}
        <g className="fill-slate-400 dark:fill-slate-600">
          <circle cx={90} cy={42} r={1.75} />
          <circle cx={90} cy={258} r={1.75} />
          <circle cx={328} cy={150} r={1.75} />
        </g>

        {/* CSV A */}
        <motion.g style={motionStyle({ x: inputAX, y: inputAY, opacity: inputOpacity })}>
          <rect
            x={4}
            y={26}
            width={86}
            height={32}
            rx={4}
            strokeWidth={1}
            className="fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-700"
          />
          <text
            x={47}
            y={42}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            letterSpacing={0.6}
            className="fill-slate-600 font-mono dark:fill-slate-300"
          >
            CSV A
          </text>
        </motion.g>

        {/* CSV B */}
        <motion.g style={motionStyle({ x: inputAX, y: inputBY, opacity: inputOpacity })}>
          <rect
            x={4}
            y={242}
            width={86}
            height={32}
            rx={4}
            strokeWidth={1}
            className="fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-700"
          />
          <text
            x={47}
            y={258}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            letterSpacing={0.6}
            className="fill-slate-600 font-mono dark:fill-slate-300"
          >
            CSV B
          </text>
        </motion.g>

        {/* Nodo central (acento) */}
        <g transform="translate(220 150)">
          <motion.g style={motionStyle({ scale: nodeScale })}>
            <rect
              x={-22}
              y={-22}
              width={44}
              height={44}
              rx={10}
              className="fill-slate-900 dark:fill-slate-100"
            />
            <foreignObject x={-12} y={-12} width={24} height={24}>
              <div className="flex h-full w-full items-center justify-center text-white dark:text-slate-900">
                <Cpu className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </div>
            </foreignObject>
          </motion.g>

          <text
            x={0}
            y={36}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={8}
            letterSpacing={1.2}
            className="fill-slate-400 font-mono dark:fill-slate-500"
          >
            MERGE
          </text>
        </g>

        {/* Merged CSV */}
        <g transform="translate(376 150)">
          <motion.g
            style={motionStyle({
              x: outputX,
              scale: outputScale,
              opacity: outputOpacity,
            })}
          >
            <rect
              x={-48}
              y={-17}
              width={96}
              height={34}
              rx={4}
              strokeWidth={1}
              className="fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-600"
            />
            <text
              x={0}
              y={0}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight={500}
              letterSpacing={0.4}
              className="fill-slate-900 font-mono dark:fill-slate-100"
            >
              MERGED CSV
            </text>
          </motion.g>
        </g>
      </svg>
    </div>
  )
}
