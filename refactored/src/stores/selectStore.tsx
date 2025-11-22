'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SelectState {
  gender: 'boy' | 'girl'
  type: 'group' | 'solo'
  title: string
}

interface SelectStoreContextType {
  selection: SelectState
  setSelection: (selection: Partial<SelectState>) => void
  resetSelection: () => void
}

const SelectStoreContext = createContext<SelectStoreContextType | undefined>(
  undefined,
)

const initialSelection: SelectState = {
  gender: 'boy',
  type: 'group',
  title: '보이그룹',
}

export const SelectStoreProvider = ({ children }: { children: ReactNode }) => {
  const [selection, setSelectionState] = useState<SelectState>(initialSelection)

  const setSelection = (updates: Partial<SelectState>) => {
    setSelectionState((prev) => ({ ...prev, ...updates }))
  }

  const resetSelection = () => {
    setSelectionState(initialSelection)
  }

  return (
    <SelectStoreContext.Provider
      value={{ selection, setSelection, resetSelection }}
    >
      {children}
    </SelectStoreContext.Provider>
  )
}

export const useSelectStore = () => {
  const context = useContext(SelectStoreContext)
  if (!context) {
    throw new Error('useSelectStore must be used within SelectStoreProvider')
  }
  return context
}
