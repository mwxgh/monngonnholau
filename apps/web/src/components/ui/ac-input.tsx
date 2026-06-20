'use client'

import * as React from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import { cn } from '@/lib/utils'

export type AcInputProps = React.InputHTMLAttributes<HTMLInputElement>

const AcInput = React.forwardRef<HTMLInputElement, AcInputProps>(
  ({ className, type, ...props }, ref) => {
    const radius = 120
    const [visible, setVisible] = React.useState(false)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    function handleMouseMove({
      currentTarget,
      clientX,
      clientY
    }: React.MouseEvent<HTMLDivElement>) {
      const { left, top } = currentTarget.getBoundingClientRect()
      mouseX.set(clientX - left)
      mouseY.set(clientY - top)
    }

    return (
      <motion.div
        style={{
          background: useMotionTemplate`radial-gradient(${
            visible ? radius + 'px' : '0px'
          } circle at ${mouseX}px ${mouseY}px, var(--color-primary), transparent 80%)`
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="group/input rounded-lg p-[2px] transition duration-300"
      >
        <input
          type={type}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-300 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 group-hover/input:shadow-none disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
      </motion.div>
    )
  }
)
AcInput.displayName = 'AcInput'

export { AcInput }
