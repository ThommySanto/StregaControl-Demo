import { createContext, useContext, type ReactNode } from 'react'

interface AuthContextValue {
  session: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = { user: { email: 'demo@portfolio.local' } }
  
  async function signIn() { return { error: null } }
  async function signOut() {
    // In a demo, signOut could clear local storage or just reload the page.
    localStorage.removeItem('demo_db')
    window.location.reload()
  }

  return (
    <AuthContext.Provider value={{ session, loading: false, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve essere usato dentro <AuthProvider>')
  return ctx
}
