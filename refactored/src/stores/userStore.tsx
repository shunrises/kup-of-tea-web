'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { USER_LENGTH } from '@/constants/user'
import type { User } from '@/types/user'

interface UserStoreContextType {
  users: User[]
  updateUser: (id: string, user: Partial<User>) => void
  resetUsers: () => void
  getUser: (id: string) => User | undefined
}

const UserStoreContext = createContext<UserStoreContextType | undefined>(
  undefined,
)

const generateInitialUsers = (): User[] => {
  const users: User[] = []
  for (let i = 0; i < USER_LENGTH; i++) {
    users.push({
      id: `u${i}`,
      image: null,
      username: null,
    })
  }
  return users
}

export const UserStoreProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(generateInitialUsers())

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, ...updates } : user)),
    )
  }

  const resetUsers = () => {
    setUsers(generateInitialUsers())
  }

  const getUser = (id: string) => {
    return users.find((user) => user.id === id)
  }

  return (
    <UserStoreContext.Provider
      value={{ users, updateUser, resetUsers, getUser }}
    >
      {children}
    </UserStoreContext.Provider>
  )
}

export const useUserStore = () => {
  const context = useContext(UserStoreContext)
  if (!context) {
    throw new Error('useUserStore must be used within UserStoreProvider')
  }
  return context
}

