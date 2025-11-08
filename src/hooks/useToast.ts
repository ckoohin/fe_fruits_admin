'use client'

import * as React from 'react'
import { ToastActionElement, type ToastProps } from '@/components/ui/Toast'

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const

type Action =
  | { type: 'ADD_TOAST'; toast: ToasterToast }
  | { type: 'UPDATE_TOAST'; toast: Partial<ToasterToast> & { id: string } }
  | { type: 'DISMISS_TOAST'; toastId?: string }
  | { type: 'REMOVE_TOAST'; toastId?: string }

interface State {
  toasts: ToasterToast[]
}

let listeners: ((state: State) => void)[] = []
let memoryState: State = { toasts: [] }

function genId() {
  return Math.random().toString(36).substring(2, 9)
}

function dispatch(action: Action) {
  switch (action.type) {
    case 'ADD_TOAST':
      memoryState = {
        ...memoryState,
        toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
      }
      break
    case 'UPDATE_TOAST':
      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }
      break
    case 'DISMISS_TOAST':
      const { toastId } = action
      if (toastId) {
        setTimeout(() => dispatch({ type: 'REMOVE_TOAST', toastId }), TOAST_REMOVE_DELAY)
      } else {
        memoryState.toasts.forEach((t) =>
          setTimeout(() => dispatch({ type: 'REMOVE_TOAST', toastId: t.id }), TOAST_REMOVE_DELAY)
        )
      }
      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.map((t) =>
          toastId && t.id !== toastId ? t : { ...t, open: false }
        ),
      }
      break
    case 'REMOVE_TOAST':
      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
      }
      break
  }

  listeners.forEach((listener) => listener(memoryState))
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      listeners = listeners.filter((l) => l !== setState)
    }
  }, [])

  const toast = React.useCallback((props: ToastProps) => {
    const id = genId()
    const toast: ToasterToast = { id, open: true, ...props }
    dispatch({ type: 'ADD_TOAST', toast })
    return {
      id,
      dismiss: () => dispatch({ type: 'DISMISS_TOAST', toastId: id }),
    }
  }, [])

  const dismiss = React.useCallback((toastId?: string) => {
    dispatch({ type: 'DISMISS_TOAST', toastId })
  }, [])

  return {
    ...state,
    toast,
    dismiss,
  }
}