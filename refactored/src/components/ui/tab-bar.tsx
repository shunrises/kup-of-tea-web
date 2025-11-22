'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

type Tab = {
  value: string
  label: string
}

type TabBarProps = Omit<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
  'value' | 'defaultValue'
> & {
  tabs: Tab[]
  value?: string
  defaultValue?: string
}

const TabBar = ({
  tabs,
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: TabBarProps) => {
  return (
    <TabsPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      className={cn('w-full', className, 'h-11 w-full rounded-lg')}
      {...props}
    >
      <TabsPrimitive.List
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
          backgroundColor: 'rgba(158, 164, 170, 0.1)',
          padding: '6px 8px',
          borderRadius: '8px',
        }}
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'h-full rounded-md text-sm font-regular text-grey-400 data-[state=active]:font-semibold data-[state=active]:text-grey-700 data-[state=active]:bg-white data-[state=active]:shadow-sm',
            )}
          >
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  )
}
TabBar.displayName = 'TabBar'

export { TabBar }
