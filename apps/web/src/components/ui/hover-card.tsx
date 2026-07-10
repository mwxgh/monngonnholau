'use client'

import { PreviewCard as HoverCardPrimitive } from '@base-ui/react/preview-card'

import { cn } from '@/lib/utils'

function HoverCard({ ...props }: HoverCardPrimitive.Root.Props) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({ ...props }: HoverCardPrimitive.Trigger.Props) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  )
}

function HoverCardContent({
  className,
  sideOffset = 8,
  side = 'bottom',
  align = 'end',
  ...props
}: HoverCardPrimitive.Popup.Props &
  Pick<HoverCardPrimitive.Positioner.Props, 'sideOffset' | 'side' | 'align'>) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Positioner
        sideOffset={sideOffset}
        side={side}
        align={align}
      >
        <HoverCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            'z-50 w-72 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0',
            className
          )}
          {...props}
        />
      </HoverCardPrimitive.Positioner>
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardContent, HoverCardTrigger }
