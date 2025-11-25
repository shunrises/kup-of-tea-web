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
  ...props
}: TabBarProps) => {
  return (
    <TabsPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      {...props}
      className="bg-grey-400/10 w-full rounded-[8px]"
    >
      <TabsPrimitive.List className="grid grid-cols-2 py-1.5 px-2">
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'text-grey-400 body1',
              'data-[state=active]:text-grey-700 data-[state=active]:bg-white data-[state=active]:shadow-[0px_1px_2px_0px_rgba(158,164,170,0.30)] data-[state=active]:body2 data-[state=active]:text-grey-700 py-[7px] rounded-[6px]',
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
