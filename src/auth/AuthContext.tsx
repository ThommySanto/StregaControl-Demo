import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/db/supabaseClient'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Fornisce lo stato di sessione a tutta l'app. Supabase gestisce da solo
// il refresh del token; qui ci limitiamo ad ascoltare i cambi di stato
// (login, logout, refresh) e a esporli via context.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? traduciErrore(error.message) : null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve essere usato dentro <AuthProvider>')
  return ctx
}

// Traduce i messaggi d'errore piu' comuni di Supabase in italiano
// comprensibile, invece di mostrare testo tecnico all'organizzatore (§54).
function traduciErrore(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'Email o password non corrette.'
  }
  if (message.includes('Email not confirmed')) {
    return 'Email non ancora confermata. Controlla la posta.'
  }
  return 'Impossibile accedere. Riprova tra poco.'
}
