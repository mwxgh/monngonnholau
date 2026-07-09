'use client'

import { useEffect, useState } from 'react'
import { toast as sonnerToast } from 'sonner'
import {
  CheckCircle2,
  XCircle,
  TriangleAlert,
  Info,
  type LucideIcon
} from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

const config: Record<
  ToastType,
  { icon: LucideIcon; iconClass: string; accentClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: 'bg-green-50 text-green-500',
    accentClass: 'bg-green-500'
  },
  error: {
    icon: XCircle,
    iconClass: 'bg-red-50 text-red-500',
    accentClass: 'bg-red-500'
  },
  warning: {
    icon: TriangleAlert,
    iconClass: 'bg-yellow-50 text-yellow-500',
    accentClass: 'bg-yellow-500'
  },
  info: {
    icon: Info,
    iconClass: 'bg-blue-50 text-blue-500',
    accentClass: 'bg-blue-500'
  }
}

const DEFAULT_DURATION = 4000
const EXIT_DURATION = 300

function ToastCard({
  id,
  type,
  title,
  description,
  duration
}: {
  id: string | number
  type: ToastType
  title: string
  description?: string
  duration: number
}) {
  const { icon: Icon, iconClass, accentClass } = config[type]
  const [drained, setDrained] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const startId = requestAnimationFrame(() => setDrained(true))
    const exitTimer = setTimeout(() => setExiting(true), duration)
    return () => {
      cancelAnimationFrame(startId)
      clearTimeout(exitTimer)
    }
  }, [duration])

  useEffect(() => {
    if (!exiting) return
    const dismissTimer = setTimeout(
      () => sonnerToast.dismiss(id),
      EXIT_DURATION
    )
    return () => clearTimeout(dismissTimer)
  }, [exiting, id])

  return (
    <div
      className="relative w-89 max-w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
      style={{
        transform: exiting ? 'translateX(110%)' : 'translateX(0)',
        opacity: exiting ? 0 : 1,
        transition: `transform ${EXIT_DURATION}ms ease, opacity ${EXIT_DURATION}ms ease`
      }}
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>
      <span
        className={`absolute bottom-0 left-0 h-1 ${accentClass}`}
        style={{
          width: drained ? '0%' : '100%',
          transition: `width ${duration}ms linear`
        }}
      />
    </div>
  )
}

export function showToast(
  type: ToastType,
  title: string,
  description?: string,
  duration = DEFAULT_DURATION
) {
  sonnerToast.custom(
    (id) => (
      <ToastCard
        id={id}
        type={type}
        title={title}
        description={description}
        duration={duration}
      />
    ),
    { duration: Infinity }
  )
}
