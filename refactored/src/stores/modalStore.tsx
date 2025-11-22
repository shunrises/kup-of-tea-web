'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ModalState {
  activeButtonIdx: number
}

interface ModalStoreContextType {
  modal: ModalState
  setModal: (modal: Partial<ModalState>) => void
  resetModal: () => void
}

const ModalStoreContext = createContext<ModalStoreContextType | undefined>(
  undefined,
)

const initialModal: ModalState = {
  activeButtonIdx: -1,
}

export const ModalStoreProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModalState] = useState<ModalState>(initialModal)

  const setModal = (updates: Partial<ModalState>) => {
    setModalState((prev) => ({ ...prev, ...updates }))
  }

  const resetModal = () => {
    setModalState(initialModal)
  }

  return (
    <ModalStoreContext.Provider value={{ modal, setModal, resetModal }}>
      {children}
    </ModalStoreContext.Provider>
  )
}

export const useModalStore = () => {
  const context = useContext(ModalStoreContext)
  if (!context) {
    throw new Error('useModalStore must be used within ModalStoreProvider')
  }
  return context
}

